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

async function testAllDays() {
  const lowercaseDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const titlecaseDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  console.log("--- Testing TitleCase Days ---");
  for (const day of titlecaseDays) {
    const res = await supabase.from("timetable").insert([
      { class_id: 1, day_of_week: day, period_number: 1, subject_id: 1 },
    ]);
    console.log(`TitleCase '${day}':`, res.error?.message);
  }

  console.log("\n--- Testing LowerCase Days ---");
  for (const day of lowercaseDays) {
    const res = await supabase.from("timetable").insert([
      { class_id: 1, day_of_week: day, period_number: 1, subject_id: 1 },
    ]);
    console.log(`LowerCase '${day}':`, res.error?.message);
  }
}

testAllDays();
