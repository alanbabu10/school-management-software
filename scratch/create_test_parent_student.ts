import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import bcrypt from "bcryptjs";

const envText = fs.readFileSync(".env.local", "utf8");
const envVars: Record<string, string> = {};
envText.split("\n").forEach((line) => {
  const [k, v] = line.split("=");
  if (k && v) envVars[k.trim()] = v.trim();
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseKey = envVars["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestStudent() {
  console.log("=== Creating Test Student for Parent 9288140567 ===");

  // Check if class exists
  const { data: classes } = await supabase.from("classes").select("id, name, division").limit(1);
  const classId = classes && classes.length > 0 ? classes[0].id : null;

  // Hash password "1405"
  const hashedPassword = bcrypt.hashSync("1405", 10);

  const payload = {
    admission_number: "ADM-2026-9288",
    full_name: "Rahul Kumar",
    date_of_birth: "2018-05-14",
    gender: "male",
    class_id: classId,
    parent_name: "Kumar Parent",
    parent_phone: "9288140567",
    parent_password: hashedPassword,
    status: "active",
  };

  const { data, error } = await supabase.from("students").insert([payload]).select();

  if (error) {
    console.error("Error creating student:", error.message);
  } else {
    console.log("SUCCESS! Test student created for parent phone 9288140567:", data);
  }
}

createTestStudent();
