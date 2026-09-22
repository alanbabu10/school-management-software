import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { childId } = await request.json();

    if (!childId) {
      return NextResponse.json({ error: "Child ID is required." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("parent_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized session." }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie);
    const parentPhone = session.parent_phone;

    // Verify child belongs to this parent phone
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: student, error } = await supabase
      .from("students")
      .select("id")
      .eq("id", childId)
      .eq("parent_phone", parentPhone)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: "Child profile not found." }, { status: 404 });
    }

    cookieStore.set("selected_child_id", String(childId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true, redirect: "/parent/dashboard" });
  } catch (err: unknown) {
    console.error("Select child error:", err);
    return NextResponse.json({ error: "Failed to select child." }, { status: 500 });
  }
}
