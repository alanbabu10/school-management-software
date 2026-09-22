import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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

async function testAttendanceUpsert() {
  const todayStr = new Date().toISOString().split("T")[0];
  console.log("Testing attendance upsert for date:", todayStr);

  const { data: students } = await supabase.from("students").select("id").limit(1);
  if (!students || students.length === 0) {
    console.log("No student found to test.");
    return;
  }

  const studentId = students[0].id;

  const recordsToUpsert = [
    {
      student_id: studentId,
      attendance_date: todayStr,
      status: "present",
    },
  ];

  const { data, error } = await supabase
    .from("attendance")
    .upsert(recordsToUpsert, { onConflict: "student_id,attendance_date" })
    .select();

  console.log("Upsert result:", data);
  console.log("Upsert error:", error);
}

testAttendanceUpsert();
