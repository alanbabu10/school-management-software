import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Incorrect phone number or password" },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).trim();
    const cleanPassword = String(password).trim();

    // Extract digits and get last 10 digits for flexible country code / formatting match
    const rawDigits = cleanPhone.replace(/\D/g, "");
    const last10Digits = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch student records matching phone exact or last 10 digits pattern
    let query = supabase
      .from("students")
      .select("id, full_name, parent_phone, parent_password");

    if (last10Digits) {
      query = query.or(`parent_phone.eq.${cleanPhone},parent_phone.ilike.%${last10Digits}`);
    } else {
      query = query.eq("parent_phone", cleanPhone);
    }

    const { data: students, error } = await query;

    if (error || !students || students.length === 0) {
      return NextResponse.json(
        { error: "Incorrect phone number or password" },
        { status: 401 }
      );
    }

    // Check if any student record matching this parent_phone has a matching password
    let authenticatedStudent = null;
    let matchedParentPhone = cleanPhone;

    for (const student of students) {
      if (!student.parent_password) continue;

      let isMatch = false;

      try {
        isMatch = bcrypt.compareSync(cleanPassword, student.parent_password);
      } catch {
        isMatch = false;
      }

      // Fallback for plain text password comparison
      if (!isMatch && student.parent_password === cleanPassword) {
        isMatch = true;
      }

      if (isMatch) {
        authenticatedStudent = student;
        matchedParentPhone = student.parent_phone || cleanPhone;
        break;
      }
    }

    if (!authenticatedStudent) {
      return NextResponse.json(
        { error: "Incorrect phone number or password" },
        { status: 401 }
      );
    }

    // Set Parent Session Cookie
    const cookieStore = await cookies();
    const sessionPayload = JSON.stringify({
      parent_phone: matchedParentPhone,
      parent_phone_digits: last10Digits,
      authenticated: true,
      logged_in_at: new Date().toISOString(),
    });

    cookieStore.set("parent_session", sessionPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      redirect: "/parent/select-child",
    });
  } catch (err: unknown) {
    console.error("Parent login error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
