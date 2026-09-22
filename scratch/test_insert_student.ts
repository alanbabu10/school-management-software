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

async function testInsert() {
  const { data, error } = await supabase.from("students").insert([
    {
      admission_number: "TEST-001",
      full_name: "Test Child 1",
      parent_name: "Test Parent",
      parent_phone: "9876543210",
      status: "active",
      parent_password: "hashed_test_pass"
    }
  ]).select();

  console.log("Insert result:", data, "error:", error?.message);
}

testInsert();
