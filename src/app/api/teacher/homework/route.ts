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
 * POST /api/teacher/homework — Create or Update homework
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const teacherId = getTeacherIdFromCookie(cookieStore.get("teacher_session")?.value);
    if (!teacherId) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }

    const body = await request.json();
    const { action, homeworkId, class_id, subject_id, title, description, due_date, attachment_url } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: "Homework title is required." }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();

    if (action === "update" && homeworkId) {
      const { data, error } = await supabase
        .from("homework")
        .update({
          class_id: class_id || null,
          subject_id: subject_id || null,
          title: title.trim(),
          description: description?.trim() || null,
          due_date: due_date || null,
          attachment_url: attachment_url?.trim() || null,
        })
        .eq("id", homeworkId)
        .eq("teacher_id", teacherId)
        .select(`*, classes (id, name, division), subjects (id, name, code)`)
        .single();

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, homework: data });
    } else {
      const { data, error } = await supabase
        .from("homework")
        .insert([{
          class_id: class_id || null,
          subject_id: subject_id || null,
          teacher_id: teacherId,
          title: title.trim(),
          description: description?.trim() || null,
          due_date: due_date || null,
          attachment_url: attachment_url?.trim() || null,
        }])
        .select(`*, classes (id, name, division), subjects (id, name, code)`)
        .single();

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, homework: data });
    }
  } catch (err: any) {
    console.error("Teacher homework save error:", err);
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * DELETE /api/teacher/homework — Delete homework
 */
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const teacherId = getTeacherIdFromCookie(cookieStore.get("teacher_session")?.value);
    if (!teacherId) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const homeworkId = searchParams.get("id");
    if (!homeworkId) {
      return NextResponse.json({ success: false, error: "Homework ID is required." }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();
    const { error } = await supabase
      .from("homework")
      .delete()
      .eq("id", homeworkId)
      .eq("teacher_id", teacherId);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Teacher homework delete error:", err);
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
