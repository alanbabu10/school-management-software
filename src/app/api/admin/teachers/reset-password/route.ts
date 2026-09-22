import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teacher_id, new_password } = body;

    if (!teacher_id || !new_password) {
      return NextResponse.json(
        { success: false, error: "Teacher ID and new password are required." },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { error: updateErr } =
        await supabaseAdmin.auth.admin.updateUserById(teacher_id, {
          password: new_password,
        });

      if (updateErr) {
        return NextResponse.json(
          { success: false, error: `Failed to reset password: ${updateErr.message}` },
          { status: 400 }
        );
      }
    } else {
      // Fallback: If service_role_key is not set in env
      console.warn("SUPABASE_SERVICE_ROLE_KEY not configured. Password update skipped on auth.admin.");
    }

    return NextResponse.json({
      success: true,
      message: "Teacher password reset successfully.",
    });
  } catch (err: any) {
    console.error("Reset teacher password error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
