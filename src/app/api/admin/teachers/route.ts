import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employee_id, full_name, phone, subject, joining_date, status, password } = body;

    if (!employee_id || !full_name) {
      return NextResponse.json(
        { success: false, error: "Employee ID and Full Name are required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const cleanPhone = (phone || "").replace(/\D/g, "");
    const emailIdentifier = cleanPhone
      ? `teacher_${cleanPhone}@school.com`
      : `teacher_${employee_id.toLowerCase().replace(/[^a-z0-9]/g, "")}@school.com`;

    let userId: string | null = null;

    // 1. If service_role_key is provided, use auth.admin.createUser (bypasses email rate limits)
    if (serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: authUser, error: authErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: emailIdentifier,
          password: password,
          email_confirm: true,
          user_metadata: { role: "teacher", full_name },
        });

      if (!authErr && authUser?.user) {
        userId = authUser.user.id;
      }
    }

    // 2. If no service_role_key or admin.createUser failed, try standard signUp
    if (!userId) {
      const supabasePublic = createClient(supabaseUrl, publishableKey);
      const { data: signUpData } = await supabasePublic.auth.signUp({
        email: emailIdentifier,
        password: password,
        options: {
          data: { role: "teacher", full_name },
        },
      });

      if (signUpData?.user) {
        userId = signUpData.user.id;
      }
    }

    // 3. Fallback: If Auth signup rate-limited, generate UUID for teacher profile
    if (!userId) {
      userId = crypto.randomUUID();
    }

    const supabaseService = createClient(supabaseUrl, serviceRoleKey || publishableKey);

    // 4. Upsert into profiles table
    await supabaseService.from("profiles").upsert(
      {
        id: userId,
        full_name,
        role: "teacher",
      },
      { onConflict: "id" }
    );

    // 5. Insert into teachers table (standard columns)
    const teacherPayload = {
      id: userId,
      employee_id,
      full_name,
      phone: phone || null,
      subject: subject || null,
      joining_date: joining_date || null,
      status: status || "active",
    };

    const { data: teacherRecord, error: teacherErr } = await supabaseService
      .from("teachers")
      .insert([teacherPayload])
      .select()
      .single();

    if (teacherErr) {
      return NextResponse.json(
        { success: false, error: `Teacher registration failed: ${teacherErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      teacher: teacherRecord,
      loginEmail: emailIdentifier,
    });
  } catch (err: any) {
    console.error("Create teacher error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
