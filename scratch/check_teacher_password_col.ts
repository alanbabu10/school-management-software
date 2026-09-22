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

async function addPasswordColumnToTeachers() {
  console.log("Checking teachers table structure...");
  
  // Try inserting/updating a dummy column test or check columns
  const { data, error } = await supabase
    .from("teachers")
    .select("id, password")
    .limit(1);

  if (error && error.message.includes("column \"password\" does not exist")) {
    console.log("Adding column password to teachers table...");
  } else {
    console.log("Teachers query result:", data, error);
  }
}

addPasswordColumnToTeachers();
