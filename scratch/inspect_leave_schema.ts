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

async function testLeaveRequestsColumns() {
  const cols = [
    "id",
    "student_id",
    "from_date",
    "to_date",
    "reason",
    "status",
    "requested_by",
    "reviewed_by",
    "reviewed_at",
    "remarks",
    "created_at",
  ];

  console.log("--- Testing Leave Requests Columns ---");
  for (const c of cols) {
    const { error } = await supabase.from("leave_requests").select(c).limit(1);
    console.log(`Column '${c}':`, error ? error.message : "EXISTS");
  }

  const { data, error } = await supabase.from("leave_requests").select("*").limit(3);
  console.log("Leave requests sample query error:", error?.message);
  console.log("Leave requests sample rows:", data);
}

testLeaveRequestsColumns();
