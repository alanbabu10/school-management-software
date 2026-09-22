import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";

async function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createRawClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);
  }
  return createServerClient();
}

function getTeacherIdFromCookie(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  try {
    const parsed = JSON.parse(cookieValue);
    if (parsed?.authenticated && parsed?.teacher_id) return parsed.teacher_id;
  } catch {}
  return null;
}

/**
 * POST /api/teacher/marks — Save marks for students
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const teacherId = getTeacherIdFromCookie(cookieStore.get("teacher_session")?.value);
    if (!teacherId) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json();
    const { records } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, error: "Marks records are required." }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();

    const { error } = await supabase
      .from("marks")
      .upsert(records, { onConflict: "exam_id,student_id,subject_id" });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, savedCount: records.length });
  } catch (err: any) {
    console.error("Teacher marks save error:", err);
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * GET /api/teacher/marks?examId=x&classId=y&subjectId=z
 * Fetch students and existing marks for a class/exam/subject
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const teacherId = getTeacherIdFromCookie(cookieStore.get("teacher_session")?.value);
    if (!teacherId) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");

    if (!examId || !classId) {
      return NextResponse.json({ success: false, error: "examId and classId are required." }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();

    // Fetch students
    const { data: students } = await supabase
      .from("students")
      .select("id, admission_number, full_name")
      .eq("class_id", classId)
      .order("full_name", { ascending: true });

    // Fetch existing marks
    let query = supabase.from("marks").select("*").eq("exam_id", examId).eq("class_id", classId);
    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }
    const { data: marksData } = await query;

    const marksMap: Record<string, any> = {};
    (marksData || []).forEach((m: any) => {
      marksMap[m.student_id] = {
        marks_obtained: m.marks_obtained !== null && m.marks_obtained !== undefined ? String(m.marks_obtained) : "",
        max_marks: m.max_marks !== null && m.max_marks !== undefined ? String(m.max_marks) : "100",
        grade: m.grade || "",
        remarks: m.remarks || "",
      };
    });

    return NextResponse.json({
      success: true,
      students: students || [],
      marksMap,
    });
  } catch (err: any) {
    console.error("Teacher marks fetch error:", err);
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
