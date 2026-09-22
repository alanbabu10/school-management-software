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

async function testInsertAndLogin() {
  console.log("=== Testing Student Creation & Parent Login ===");

  // 1. Try to select parent_password column
  const { data, error } = await supabase.from("students").select("id, parent_phone, parent_password").limit(1);

  if (error) {
    console.error("COLUMN ERROR:", error.message);
  } else {
    console.log("COLUMN SUCCESS: parent_password exists!", data);
  }
}

testInsertAndLogin();
