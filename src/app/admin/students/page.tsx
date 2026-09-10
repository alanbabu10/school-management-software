import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StudentManagementClient from "./student-management-client";

export default async function AdminStudentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch students with classes relation
  let initialStudents: any[] = [];
  const { data: studentsData, error: studentsError } = await supabase
    .from("students")
    .select(`
      *,
      classes (
        id,
        name,
        division
      )
    `)
    .order("created_at", { ascending: false });

  if (studentsError) {
    const { data: rawStudents } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });
    initialStudents = rawStudents || [];
  } else {
    initialStudents = studentsData || [];
  }

  // Fetch classes list for dropdown filter & selection (including division)
  const { data: classesData } = await supabase
    .from("classes")
    .select("id, name, division")
    .order("name", { ascending: true });

  return (
    <StudentManagementClient
      initialStudents={initialStudents}
      classesList={classesData || []}
    />
  );
}
