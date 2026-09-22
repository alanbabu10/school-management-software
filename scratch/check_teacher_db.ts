import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local manually
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  for (const line of envConfig.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTeacher() {
  console.log("Checking teachers matching 8085698847...");
  const { data: teachers, error: tErr } = await supabase
    .from("teachers")
    .select("*")
    .or("phone.eq.8085698847,employee_id.eq.8085698847");

  console.log("Teachers:", teachers, "Error:", tErr);

  if (teachers && teachers.length > 0) {
    const t = teachers[0];
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", t.id);
    console.log("Profile:", profile, "Error:", pErr);
  }
}

checkTeacher();
