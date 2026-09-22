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

async function seedClassesAndAssign() {
  console.log("=== Seeding Classes and Assigning Students ===");

  // 1. Insert initial classes
  const classesToInsert = [
    { name: "Class 1", division: "A", academic_year: "2026-2027" },
    { name: "Class 2", division: "A", academic_year: "2026-2027" },
    { name: "Class 3", division: "B", academic_year: "2026-2027" },
    { name: "Class 4", division: "A", academic_year: "2026-2027" },
  ];

  const { data: createdClasses, error: cErr } = await supabase
    .from("classes")
    .insert(classesToInsert)
    .select();

  if (cErr) {
    console.error("Error creating classes:", cErr.message);
    // If insertion failed due to RLS, let's log it
    return;
  }

  console.log("Created classes:", createdClasses);

  if (createdClasses && createdClasses.length > 0) {
    const class1Id = createdClasses[0].id;
    const class2Id = createdClasses[1].id;

    // Update students to point to real class IDs
    const { data: updatedAmmu } = await supabase
      .from("students")
      .update({ class_id: class1Id })
      .eq("full_name", "ammu")
      .select();

    console.log("Updated ammu class:", updatedAmmu);

    const { data: updatedAlan } = await supabase
      .from("students")
      .update({ class_id: class2Id })
      .eq("full_name", "Alan")
      .select();

    console.log("Updated Alan class:", updatedAlan);
  }
}

seedClassesAndAssign();
