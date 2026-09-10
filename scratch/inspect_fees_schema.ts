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

async function testFeesColumns() {
  const cols = [
    "id",
    "student_id",
    "fee_type",
    "amount",
    "due_date",
    "paid_amount",
    "paid_date",
    "status",
    "remarks",
    "created_at",
    "academic_year",
  ];

  console.log("--- Testing Fees Columns ---");
  for (const c of cols) {
    const { error } = await supabase.from("fees").select(c).limit(1);
    console.log(`Column '${c}':`, error ? error.message : "EXISTS");
  }

  const { data, error } = await supabase.from("fees").select("*").limit(3);
  console.log("Fees sample query error:", error?.message);
  console.log("Fees sample rows:", data);
}

testFeesColumns();
