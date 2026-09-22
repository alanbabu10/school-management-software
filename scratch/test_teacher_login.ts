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

async function testTeacherLoginWithCreatedUser() {
  console.log("=== Testing Teacher Login Credentials ===");
  
  // Use user created in previous test: 69c4c454-e1e2-48e9-8f0e-edd599f3891d
  // Email: teacher_9876500001@school.com
  const testEmail = "teacher_9876500001@school.com";
  const testPassword = "teacherPass123";

  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (loginErr) {
    console.error("Login failed:", loginErr.message);
    return;
  }

  console.log("LOGIN SUCCESSFUL! User ID:", loginData.user.id);

  // Authenticated user client session
  const userClient = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${loginData.session.access_token}`,
      },
    },
  });

  // Upsert profile and teacher
  const { data: profData, error: profErr } = await userClient.from("profiles").upsert({
    id: loginData.user.id,
    full_name: "Anita Sharma",
    role: "teacher",
  }).select();

  console.log("Profile Upsert:", profData, profErr);

  const { data: teacherData, error: teacherErr } = await userClient.from("teachers").upsert({
    id: loginData.user.id,
    employee_id: "EMP-201",
    full_name: "Anita Sharma",
    phone: "9876500001",
    subject: "Mathematics",
    joining_date: "2026-09-11",
    status: "active",
  }).select();

  console.log("Teacher Upsert:", teacherData, teacherErr);
}

testTeacherLoginWithCreatedUser();
