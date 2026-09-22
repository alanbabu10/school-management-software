import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { loginInput, password } = await request.json();

    if (!loginInput || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your Phone, Email, or Employee ID and password." },
        { status: 400 }
      );
    }

    const cleanInput = String(loginInput).trim();
    const cleanPassword = String(password).trim();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const cleanPhone = cleanInput.replace(/\D/g, "");
    let loginEmail = cleanInput;
    if (!cleanInput.includes("@")) {
      loginEmail = cleanPhone
        ? `teacher_${cleanPhone}@school.com`
        : `teacher_${cleanInput.toLowerCase()}@school.com`;
    }

    let matchedTeacherId: string | null = null;
    let matchedTeacherName: string = "Teacher";
    let matchedTeacherPhone: string | null = null;

    // 1. Try Supabase Auth signInWithPassword
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: cleanPassword,
    });

    if (!authErr && authData?.user) {
      matchedTeacherId = authData.user.id;
      matchedTeacherName = authData.user.user_metadata?.full_name || "Teacher";
      matchedTeacherPhone = authData.user.phone || cleanPhone || null;
    } else {
      // 2. Query teachers table matching phone or employee_id or full_name
      let query = supabase.from("teachers").select("id, full_name, phone, employee_id, status");

      if (cleanPhone.length >= 7) {
        query = query.or(`phone.eq.${cleanInput},phone.eq.${cleanPhone},employee_id.eq.${cleanInput}`);
      } else {
        query = query.or(`employee_id.ilike.${cleanInput},full_name.ilike.%${cleanInput}%`);
      }

      const { data: teachers, error: queryErr } = await query;

      if (!queryErr && teachers && teachers.length > 0) {
        const matched = teachers.find((t) => t.status === "active") || teachers[0];
        matchedTeacherId = matched.id;
        matchedTeacherName = matched.full_name;
        matchedTeacherPhone = matched.phone;
      }
    }

    if (!matchedTeacherId) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Teacher account not found." },
        { status: 401 }
      );
    }

    // Ensure profiles record exists for role checking
    await supabase.from("profiles").upsert(
      {
        id: matchedTeacherId,
        full_name: matchedTeacherName,
        role: "teacher",
      },
      { onConflict: "id" }
    );

    // Set Teacher Session Cookie
    const cookieStore = await cookies();
    const sessionPayload = JSON.stringify({
      teacher_id: matchedTeacherId,
      teacher_name: matchedTeacherName,
      teacher_phone: matchedTeacherPhone,
      authenticated: true,
      logged_in_at: new Date().toISOString(),
    });

    cookieStore.set("teacher_session", sessionPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      redirect: "/teacher/dashboard",
    });
  } catch (err: any) {
    console.error("Teacher login error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
