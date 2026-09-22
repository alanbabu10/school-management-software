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

async function testAllTables() {
  const tables = ["students", "teachers", "classes", "subjects", "attendance", "fees", "notices", "leave_requests", "homework", "timetable"];

  console.log("=== RLS Audit across all tables ===");

  for (const table of tables) {
    const { data: selectData, error: selectError } = await supabase.from(table).select("*").limit(1);
    console.log(`Table '${table}': SELECT ->`, selectError ? `ERROR: ${selectError.message}` : `OK (${selectData?.length || 0} rows)`);
  }
}

testAllTables();
