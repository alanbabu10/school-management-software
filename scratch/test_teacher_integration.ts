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

async function testTeacherIntegration() {
  console.log("=== Testing Teacher Registration & Login Verification ===");
  const testPhone = "9876543210";
  const testPassword = "teacherPass123";
  const testEmail = `teacher_${testPhone}@school.com`;

  // 1. SignUp
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (authErr && !authErr.message.includes("already registered")) {
    console.log("Auth signup info:", authErr.message);
  } else if (authData.user) {
    console.log("Auth user created ID:", authData.user.id);
  }

  // 2. Sign In
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (loginErr) {
    console.error("Login test failed:", loginErr.message);
    return;
  }

  const userId = loginData.user.id;
  console.log("Teacher logged in successfully! User ID:", userId);

  // 3. Ensure profile and teacher row
  const userClient = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${loginData.session.access_token}`,
      },
    },
  });

  await userClient.from("profiles").upsert({
    id: userId,
    full_name: "Anita Sharma",
    role: "teacher",
  });

  const { data: teacherRec, error: teacherErr } = await userClient
    .from("teachers")
    .upsert({
      id: userId,
      employee_id: "EMP-201",
      full_name: "Anita Sharma",
      phone: testPhone,
      subject: "Mathematics",
      joining_date: "2026-09-11",
      status: "active",
    })
    .select()
    .single();

  console.log("Teacher profile upserted:", teacherRec, teacherErr);

  // 4. Verify profile role query
  const { data: profileCheck } = await userClient
    .from("profiles")
    .select("role, full_name")
    .eq("id", userId)
    .single();

  console.log("Profile role check result:", profileCheck);
  console.log("Integration Test COMPLETE!");
}

testTeacherIntegration();
