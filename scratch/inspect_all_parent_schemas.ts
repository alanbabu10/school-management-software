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

async function inspectSchemas() {
  console.log("=== Inspecting Tables for Parent Dashboard ===");

  const { data: hwData, error: hwErr } = await supabase.from("homework").select("*").limit(1);
  console.log("Homework columns:", hwData ? Object.keys(hwData[0] || {}) : hwErr?.message);

  const { data: ttData, error: ttErr } = await supabase.from("timetable").select("*").limit(1);
  console.log("Timetable columns:", ttData ? Object.keys(ttData[0] || {}) : ttErr?.message);

  const { data: feeData, error: feeErr } = await supabase.from("fees").select("*").limit(1);
  console.log("Fees columns:", feeData ? Object.keys(feeData[0] || {}) : feeErr?.message);

  const { data: noticeData, error: noticeErr } = await supabase.from("notices").select("*").limit(1);
  console.log("Notices columns:", noticeData ? Object.keys(noticeData[0] || {}) : noticeErr?.message);
}

inspectSchemas();
