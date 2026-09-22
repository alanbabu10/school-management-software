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

async function testTeacherLoginForSeena() {
  const cleanInput = "8085698847";
  const cleanPhone = "8085698847";

  console.log("Searching teacher record for Seena...");

  const { data: teachers, error } = await supabase
    .from("teachers")
    .select("id, full_name, phone, employee_id, status")
    .or(`phone.eq.${cleanInput},employee_id.eq.${cleanInput}`);

  console.log("Teacher match:", teachers, "Error:", error);
}

testTeacherLoginForSeena();
