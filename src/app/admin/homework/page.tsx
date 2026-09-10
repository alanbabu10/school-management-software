import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeworkClient from "./homework-client";

export default async function AdminHomeworkPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch initial homework assignments with relations
  const { data: rawHomeworks } = await supabase
    .from("homework")
    .select(`
      *,
      classes (
        id,
        name,
        division
      ),
      subjects (
        id,
        name,
        code
      ),
      teachers (
        id,
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  const initialHomeworks = (rawHomeworks || []).map((h: any) => ({
    ...h,
    classes: Array.isArray(h.classes) ? h.classes[0] || null : h.classes || null,
    subjects: Array.isArray(h.subjects) ? h.subjects[0] || null : h.subjects || null,
    teachers: Array.isArray(h.teachers) ? h.teachers[0] || null : h.teachers || null,
  }));

  // Fetch classes list for dropdown
  const { data: classesData } = await supabase
    .from("classes")
    .select("id, name, division")
    .order("name", { ascending: true });

  // Fetch subjects list
  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("id, name, code")
    .order("name", { ascending: true });

  // Fetch teachers list
  const { data: teachersData } = await supabase
    .from("teachers")
    .select("id, full_name, employee_id")
    .order("full_name", { ascending: true });

  // Fetch class_subjects assignments
  const { data: classSubjectsData } = await supabase
    .from("class_subjects")
    .select(`
      *,
      subjects (id, name, code),
      teachers (id, full_name, employee_id)
    `);

  return (
    <HomeworkClient
      initialHomeworks={initialHomeworks}
      initialClasses={classesData || []}
      initialSubjects={subjectsData || []}
      initialTeachers={teachersData || []}
      initialClassSubjects={classSubjectsData || []}
    />
  );
}
