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
const serviceKey = envVars["SUPABASE_SERVICE_ROLE_KEY"] || supabaseKey;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testAuthAdmin() {
  console.log("Testing Supabase Auth...");
  const testEmail = `teacher_${Date.now()}@school.com`;
  const testPassword = "password123";

  // Test 1: Try admin.createUser
  try {
    const { data: adminData, error: adminErr } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { role: "teacher" },
    });

    if (adminErr) {
      console.log("admin.createUser failed:", adminErr.message);
    } else {
      console.log("admin.createUser SUCCESS! User ID:", adminData.user.id);
      // Clean up test user
      await supabase.auth.admin.deleteUser(adminData.user.id);
      return;
    }
  } catch (err: any) {
    console.log("admin.createUser exception:", err.message);
  }

  // Test 2: Try signUp
  try {
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    if (signUpErr) {
      console.log("signUp failed:", signUpErr.message);
    } else {
      console.log("signUp SUCCESS! User ID:", signUpData.user?.id);
    }
  } catch (err: any) {
    console.log("signUp exception:", err.message);
  }
}

testAuthAdmin();
