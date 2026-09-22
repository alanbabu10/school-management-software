import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envText = fs.readFileSync(".env.local", "utf8");
const envVars: Record<string, string> = {};
envText.split("\n").forEach((line) => {
  const [k, v] = line.split("=");
  if (k && v) envVars[k.trim()] = v.trim();
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseKey = envVars["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfilesInsertWithUserSession() {
  const testPhone = "9876500002";
  const testEmail = `teacher_${testPhone}@school.com`;
  const testPassword = "teacherPass123";

  // 1. Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (authError || !authData.user) {
    console.error("signUp error:", authError);
    return;
  }

  console.log("User signed up:", authData.user.id);

  // 2. Sign in as that user (session token set)
  const { data: sessionData, error: sessionErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (sessionErr || !sessionData.session) {
    console.error("signIn error:", sessionErr);
    return;
  }

  console.log("User signed in! User ID:", sessionData.user.id);

  // 3. Insert profile using authenticated user's client session
  const userClient = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    },
  });

  const { data: profileRes, error: profileErr } = await userClient
    .from("profiles")
    .upsert({
      id: sessionData.user.id,
      full_name: "Test Teacher User",
      role: "teacher",
    })
    .select();

  console.log("Profile insert result:", profileRes, profileErr);

  const { data: teacherRes, error: teacherErr } = await userClient
    .from("teachers")
    .upsert({
      id: sessionData.user.id,
      employee_id: "T102",
      full_name: "Test Teacher User",
      phone: testPhone,
      subject: "Science",
      joining_date: "2026-09-11",
      status: "active",
    })
    .select();

  console.log("Teacher insert result:", teacherRes, teacherErr);
}

testProfilesInsertWithUserSession();
