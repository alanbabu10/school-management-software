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

async function testNoticesColumns() {
  const cols = [
    "id",
    "title",
    "content",
    "target_role",
    "class_id",
    "created_by",
    "published_at",
    "attachment_url",
    "attachment",
    "created_at",
  ];

  console.log("--- Testing Notices Columns ---");
  for (const c of cols) {
    const { error } = await supabase.from("notices").select(c).limit(1);
    console.log(`Column '${c}':`, error ? error.message : "EXISTS");
  }

  const { data, error } = await supabase.from("notices").select("*").limit(3);
  console.log("Notices sample query error:", error?.message);
  console.log("Notices sample rows:", data);
}

testNoticesColumns();
