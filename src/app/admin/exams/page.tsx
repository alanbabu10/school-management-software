import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ExamsClient from "./exams-client";

export default async function AdminExamsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch initial exams list with classes relation
  const { data: rawExams } = await supabase
    .from("exams")
    .select(`
      *,
      classes (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  const initialExams = (rawExams || []).map((e: any) => ({
    ...e,
    classes: Array.isArray(e.classes) ? e.classes[0] || null : e.classes || null,
  }));

  // Fetch classes list for dropdown
  const { data: classesData } = await supabase
    .from("classes")
    .select("id, name, division")
    .order("name", { ascending: true });

  // Fetch all students for marks entry
  const { data: studentsData } = await supabase
    .from("students")
    .select("id, admission_number, full_name, class_id")
    .order("admission_number", { ascending: true });

  // Fetch all subjects
  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("id, name, code")
    .order("name", { ascending: true });

  // Fetch class_subjects assignments
  const { data: assignmentsData } = await supabase.from("class_subjects").select(`
    *,
    subjects (id, name, code),
    teachers (id, full_name, employee_id)
  `);

  return (
    <ExamsClient
      initialExams={initialExams}
      classesList={classesData || []}
      allStudents={studentsData || []}
      allSubjects={subjectsData || []}
      allAssignments={assignmentsData || []}
    />
  );
}
