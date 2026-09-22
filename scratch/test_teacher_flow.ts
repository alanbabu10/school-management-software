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

async function testTeacherCreationAndLogin() {
  console.log("=== Testing Teacher Creation & Login ===");
  const testPhone = "9876500001";
  const testEmail = `teacher_${testPhone}@school.com`;
  const testPassword = "teacherPass123";

  // 1. Create Auth User via signUp
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (authError || !authData.user) {
    console.error("Auth signUp error:", authError?.message);
    return;
  }

  const userId = authData.user.id;
  console.log("Auth user created with ID:", userId);

  // 2. Insert into profiles
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: "Test Teacher Arun",
    role: "teacher",
  });

  if (profileError) {
    console.error("Profile insert error:", profileError.message);
    return;
  }
  console.log("Profile created for role=teacher!");

  // 3. Insert into teachers
  const { data: teacherData, error: teacherError } = await supabase
    .from("teachers")
    .insert([
      {
        id: userId,
        employee_id: "T101",
        full_name: "Test Teacher Arun",
        phone: testPhone,
        subject: "Mathematics",
        joining_date: "2026-09-11",
        status: "active",
      },
    ])
    .select()
    .single();

  if (teacherError) {
    console.error("Teacher insert error:", teacherError.message);
    return;
  }

  console.log("Teacher record inserted successfully:", teacherData);

  // 4. Test Login with email + password
  const loginClient = createClient(supabaseUrl, supabaseKey);
  const { data: loginData, error: loginError } = await loginClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (loginError) {
    console.error("Login failed:", loginError.message);
  } else {
    console.log("LOGIN SUCCESSFUL! Logged in User ID:", loginData.user.id);
  }

  // 5. Test fetching profile role
  const { data: profileCheck } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  console.log("Profile role check:", profileCheck);
}

testTeacherCreationAndLogin();
