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

async function debugAmmu() {
  console.log("=== Debugging Student 'ammu' & Classes ===");

  const { data: students, error: sErr } = await supabase
    .from("students")
    .select(`
      id,
      full_name,
      admission_number,
      class_id,
      parent_phone,
      classes (
        id,
        name,
        division
      )
    `);

  console.log("Students in DB:", students, sErr?.message);

  const { data: classesList } = await supabase.from("classes").select("*");
  console.log("Classes in DB:", classesList);
}

debugAmmu();
