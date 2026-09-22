import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

async function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createRawClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);
  }
  return createServerClient();
}

async function getTeacherInfo(): Promise<{ teacherId: string | null }> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("teacher_session");
  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(sessionCookie.value);
      if (parsed?.authenticated && parsed?.teacher_id) {
        return { teacherId: parsed.teacher_id };
      }
    } catch {}
  }

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id) {
      return { teacherId: user.id };
    }
  } catch {}

  return { teacherId: null };
}

async function getTeacherAssignedClassIds(supabase: any, teacherId: string): Promise<string[]> {
  const [classTeacherRes, subjectTeacherRes] = await Promise.all([
    supabase.from("classes").select("id").eq("class_teacher_id", teacherId),
    supabase.from("class_subjects").select("class_id").eq("teacher_id", teacherId),
  ]);

  const classIds = new Set<string>();
  (classTeacherRes.data || []).forEach((c: { id: string }) => classIds.add(String(c.id)));
  (subjectTeacherRes.data || []).forEach((cs: { class_id: string }) => {
    if (cs.class_id) classIds.add(String(cs.class_id));
  });

  return Array.from(classIds);
}

/**
 * GET /api/teacher/students
 * List students belonging to teacher's assigned classes
 */
export async function GET() {
  try {
    const { teacherId } = await getTeacherInfo();
    if (!teacherId) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }

    const supabase = await getSupabaseAdmin();
    const assignedClassIds = await getTeacherAssignedClassIds(supabase, teacherId);

    if (assignedClassIds.length === 0) {
      return NextResponse.json({ success: true, students: [] });
    }

    const { data: students, error } = await supabase
      .from("students")
      .select(`
        *,
        classes (
          id,
          name,
          division
        )
      `)
      .in("class_id", assignedClassIds)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, students: students || [] });
  } catch (err: any) {
    console.error("Teacher fetch students error:", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

/**
 * POST /api/teacher/students
 * Add a new student to one of the teacher's assigned classes
 */
export async function POST(request: Request) {
  try {
    const { teacherId } = await getTeacherInfo();
    if (!teacherId) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json();
    const {
      admission_number,
      full_name,
      date_of_birth,
      gender,
      class_id,
      parent_name,
      parent_phone,
      parent_password,
      phone,
      address,
    } = body;

    if (!admission_number?.trim()) {
      return NextResponse.json({ success: false, error: "Admission Number is required." }, { status: 400 });
    }
    if (!full_name?.trim()) {
      return NextResponse.json({ success: false, error: "Full Name is required." }, { status: 400 });
    }
    if (!class_id) {
      return NextResponse.json({ success: false, error: "Class is required." }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();
    const assignedClassIds = await getTeacherAssignedClassIds(supabase, teacherId);

    if (!assignedClassIds.includes(String(class_id))) {
      return NextResponse.json(
        { success: false, error: "You can only add students to classes assigned to you." },
        { status: 403 }
      );
    }

    // Check duplicate admission number
    const { data: existingStudent } = await supabase
      .from("students")
      .select("id")
      .ilike("admission_number", admission_number.trim())
      .maybeSingle();

    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: `Admission Number "${admission_number.trim()}" already exists.` },
        { status: 400 }
      );
    }

    let hashedPassword: string | null = null;
    if (parent_password && parent_password.trim()) {
      hashedPassword = bcrypt.hashSync(parent_password.trim(), 10);
    }

    const insertPayload: Record<string, any> = {
      admission_number: admission_number.trim(),
      full_name: full_name.trim(),
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      class_id: class_id,
      parent_name: parent_name?.trim() || null,
      parent_phone: parent_phone?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      status: "active",
    };

    if (hashedPassword) {
      insertPayload.parent_password = hashedPassword;
    }

    const { data, error } = await supabase
      .from("students")
      .insert([insertPayload])
      .select(`
        *,
        classes (
          id,
          name,
          division
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, student: data });
  } catch (err: any) {
    console.error("Teacher create student error:", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

/**
 * PATCH /api/teacher/students
 * Edit student basic details (name, parent info, DOB, phone, address).
 * Disallows changes to admission_number, status, or class_id.
 */
export async function PATCH(request: Request) {
  try {
    const { teacherId } = await getTeacherInfo();
    if (!teacherId) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      full_name,
      date_of_birth,
      gender,
      parent_name,
      parent_phone,
      parent_password,
      phone,
      address,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Student ID is required." }, { status: 400 });
    }

    if (!full_name?.trim()) {
      return NextResponse.json({ success: false, error: "Full Name is required." }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();
    const assignedClassIds = await getTeacherAssignedClassIds(supabase, teacherId);

    // Verify existing student belongs to one of the teacher's assigned classes
    const { data: currentStudent, error: findError } = await supabase
      .from("students")
      .select("id, class_id")
      .eq("id", id)
      .single();

    if (findError || !currentStudent) {
      return NextResponse.json({ success: false, error: "Student not found." }, { status: 404 });
    }

    if (!currentStudent.class_id || !assignedClassIds.includes(String(currentStudent.class_id))) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to edit students outside your assigned classes." },
        { status: 403 }
      );
    }

    // Only allow updating safe fields
    const updatePayload: Record<string, any> = {
      full_name: full_name.trim(),
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      parent_name: parent_name?.trim() || null,
      parent_phone: parent_phone?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
    };

    if (parent_password && parent_password.trim()) {
      updatePayload.parent_password = bcrypt.hashSync(parent_password.trim(), 10);
    }

    const { data, error } = await supabase
      .from("students")
      .update(updatePayload)
      .eq("id", id)
      .select(`
        *,
        classes (
          id,
          name,
          division
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, student: data });
  } catch (err: any) {
    console.error("Teacher update student error:", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

/**
 * DELETE /api/teacher/students
 * Teachers cannot delete students
 */
export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Teachers are not permitted to delete students. Please contact an administrator." },
    { status: 403 }
  );
}
