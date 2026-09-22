import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import bcrypt from "bcryptjs";

const envText = fs.readFileSync(".env.local", "utf8");
const envVars: Record<string, string> = {};
envText.split("\n").forEach((line) => {
  const [k, v] = line.split("=");
  if (k && v) envVars[k.trim()] = v.trim();
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseKey = envVars["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

const supabase = createClient(supabaseUrl, supabaseKey);

async function createStudentAsAdmin() {
  console.log("=== Signing in as Admin to Create Test Student ===");

  // Sign in as admin first (using standard admin credentials or service)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "admin@school.com",
    password: "adminpassword", // or inspect user login
  });

  if (authError) {
    console.log("Admin signin failed:", authError.message);
    // Let's try inserting without auth or check auth state
  } else {
    console.log("Admin signin success! User:", authData.user?.email);
  }

  // Get class id if exists
  const { data: classes } = await supabase.from("classes").select("id").limit(1);
  const classId = classes && classes.length > 0 ? classes[0].id : null;

  const hashedPassword = bcrypt.hashSync("1405", 10);

  const payload = {
    admission_number: "ADM-2026-9288",
    full_name: "Aarav Kumar",
    date_of_birth: "2018-05-14",
    gender: "male",
    class_id: classId,
    parent_name: "Parent Kumar",
    parent_phone: "9288140567",
    parent_password: hashedPassword,
    status: "active",
  };

  const { data, error } = await supabase.from("students").insert([payload]).select();

  if (error) {
    console.error("Insert error:", error.message);
  } else {
    console.log("SUCCESS! Student created:", data);
  }
}

createStudentAsAdmin();
