import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SubjectManagementClient from "./subject-management-client";

export default async function AdminSubjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch subjects from Supabase
  let initialSubjects: any[] = [];
  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true });

  if (subjectsData) {
    initialSubjects = subjectsData;
  }

  // Fetch classes list for assignment workspace
  const { data: classesData } = await supabase
    .from("classes")
    .select("id, name, division, academic_year")
    .order("name", { ascending: true });

  // Fetch teachers list for class-subject teacher assignment
  const { data: teachersData } = await supabase
    .from("teachers")
    .select("id, full_name, employee_id")
    .order("full_name", { ascending: true });

  // Fetch initial class_subjects assignments
  let initialAssignments: any[] = [];
  const { data: assignmentsData, error: assignmentsError } = await supabase
    .from("class_subjects")
    .select(`
      *,
      subjects (id, name, code),
      teachers (id, full_name, employee_id)
    `);

  if (assignmentsError) {
    const { data: rawAssignments } = await supabase
      .from("class_subjects")
      .select("*");
    initialAssignments = rawAssignments || [];
  } else {
    initialAssignments = assignmentsData || [];
  }

  return (
    <SubjectManagementClient
      initialSubjects={initialSubjects}
      classesList={classesData || []}
      teachersList={teachersData || []}
      initialAssignments={initialAssignments}
    />
  );
}
