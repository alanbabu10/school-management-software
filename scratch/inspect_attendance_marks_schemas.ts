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

async function inspectAttendanceAndMarks() {
  console.log("=== Inspecting Attendance, Exams & Marks Schemas ===");

  const { data: attData, error: attErr } = await supabase.from("attendance").select("*").limit(1);
  console.log("Attendance columns:", attData ? Object.keys(attData[0] || {}) : attErr?.message);

  const { data: examData, error: examErr } = await supabase.from("exams").select("*").limit(1);
  console.log("Exams columns:", examData ? Object.keys(examData[0] || {}) : examErr?.message);

  const { data: markData, error: markErr } = await supabase.from("marks").select("*").limit(1);
  console.log("Marks columns:", markData ? Object.keys(markData[0] || {}) : markErr?.message);
}

inspectAttendanceAndMarks();
