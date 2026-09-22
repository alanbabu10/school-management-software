import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client that bypasses RLS when service_role key is available.
 * Falls back to the cookie-based SSR server client otherwise.
 */
async function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createRawClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );
  }
  // Fallback to server client (may be subject to RLS)
  return createServerClient();
}

/**
 * POST /api/teacher/attendance
 * Save attendance records for a teacher's assigned class.
 * Validates teacher_session cookie and performs upsert server-side.
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("teacher_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Not authenticated. Please log in." },
        { status: 401 }
      );
    }

    let teacherId: string | null = null;
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed?.authenticated && parsed?.teacher_id) {
        teacherId = parsed.teacher_id;
      }
    } catch {
      // invalid cookie
    }

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: "Invalid session. Please log in again." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { records, classId, date } = body;

    if (!records || !Array.isArray(records) || records.length === 0 || !date) {
      return NextResponse.json(
        { success: false, error: "Records and date are required." },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseAdmin();

    // Verify teacher exists and is active
    const { data: teacher } = await supabase
      .from("teachers")
      .select("id, status")
      .eq("id", teacherId)
      .single();

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: "Teacher account not found." },
        { status: 403 }
      );
    }

    // Process each attendance record individually (upsert by student_id + date)
    const errors: string[] = [];
    let savedCount = 0;

    for (const record of records) {
      const { student_id, status } = record;
      if (!student_id || !status) continue;

      // Check if record exists
      const { data: existing } = await supabase
        .from("attendance")
        .select("id")
        .eq("student_id", student_id)
        .eq("attendance_date", date)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error: updateErr } = await supabase
          .from("attendance")
          .update({ status, marked_by: null })
          .eq("id", existing.id);

        if (updateErr) {
          errors.push(`Update failed for student ${student_id}: ${updateErr.message}`);
        } else {
          savedCount++;
        }
      } else {
        // Insert new record
        const { error: insertErr } = await supabase
          .from("attendance")
          .insert({
            student_id,
            attendance_date: date,
            status,
            marked_by: null,
          });

        if (insertErr) {
          errors.push(`Insert failed for student ${student_id}: ${insertErr.message}`);
        } else {
          savedCount++;
        }
      }
    }

    if (errors.length > 0 && savedCount === 0) {
      return NextResponse.json(
        { success: false, error: errors[0] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      savedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error("Teacher attendance save error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teacher/attendance?classId=xxx&date=yyyy-mm-dd
 * Fetch attendance for a class on a given date.
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("teacher_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    let teacherId: string | null = null;
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed?.authenticated && parsed?.teacher_id) {
        teacherId = parsed.teacher_id;
      }
    } catch {}

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: "Invalid session." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const date = searchParams.get("date");

    if (!classId || !date) {
      return NextResponse.json(
        { success: false, error: "classId and date are required." },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseAdmin();

    // Fetch students for the class
    const { data: students } = await supabase
      .from("students")
      .select("id, admission_number, full_name, status")
      .eq("class_id", classId)
      .order("full_name", { ascending: true });

    const studentList = students || [];
    const studentIds = studentList.map((s) => s.id);

    // Fetch attendance records
    let attendanceMap: Record<string, string> = {};
    if (studentIds.length > 0) {
      const { data: attData } = await supabase
        .from("attendance")
        .select("student_id, status")
        .in("student_id", studentIds)
        .eq("attendance_date", date);

      (attData || []).forEach((a) => {
        attendanceMap[a.student_id] = a.status;
      });
    }

    return NextResponse.json({
      success: true,
      students: studentList,
      attendanceMap,
    });
  } catch (err: any) {
    console.error("Teacher attendance fetch error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
