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

async function testSelectColumns() {
  const cols = [
    "id",
    "class_id",
    "day_of_week",
    "period_number",
    "subject_id",
    "teacher_id",
    "start_time",
    "end_time",
    "room_number",
    "created_at",
  ];

  for (const c of cols) {
    const { error } = await supabase.from("timetable").select(c).limit(1);
    console.log(`Column '${c}':`, error ? error.message : "EXISTS");
  }
}

testSelectColumns();
