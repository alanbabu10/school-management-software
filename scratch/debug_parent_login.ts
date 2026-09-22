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

async function debugParentLogin() {
  console.log("=== Debugging Parent Login ===");

  // 1. Check all students in DB
  const { data: allStudents, error } = await supabase
    .from("students")
    .select("id, full_name, admission_number, parent_name, parent_phone, parent_password, created_at");

  if (error) {
    console.error("Error fetching students:", error.message);
    return;
  }

  console.log(`Total students found: ${allStudents?.length || 0}`);
  
  if (allStudents) {
    for (const s of allStudents) {
      console.log("-----------------------------------------");
      console.log(`Student ID: ${s.id}`);
      console.log(`Full Name: ${s.full_name}`);
      console.log(`Admission #: ${s.admission_number}`);
      console.log(`Parent Name: ${s.parent_name}`);
      console.log(`Parent Phone: "${s.parent_phone}"`);
      console.log(`Parent Password: "${s.parent_password ? s.parent_password.substring(0, 20) + '...' : 'NULL/EMPTY'}"`);
    }
  }
}

debugParentLogin();
