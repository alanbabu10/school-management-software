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

async function testTeacherQuery() {
  const cleanInput = "8085698847";
  const cleanPhone = "8085698847";

  console.log("Testing teacher query for phone:", cleanPhone);

  const { data: data1, error: err1 } = await supabase
    .from("teachers")
    .select("id, full_name, phone, employee_id, status")
    .or(`phone.eq.${cleanInput},phone.ilike.%${cleanPhone.slice(-10)}`);

  console.log("Query 1 result:", data1, "Error 1:", err1);

  const { data: data2, error: err2 } = await supabase
    .from("teachers")
    .select("id, full_name, phone, employee_id, status");

  console.log("All teachers in DB:", data2);
}

testTeacherQuery();
