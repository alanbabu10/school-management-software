import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TimetableClient from "./timetable-client";

export default async function AdminTimetablePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all timetable records with relations
  const { data: rawTimetable } = await supabase
    .from("timetable")
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
    .order("period_number", { ascending: true });

  const initialEntries = (rawTimetable || []).map((t: any) => ({
    ...t,
    classes: Array.isArray(t.classes) ? t.classes[0] || null : t.classes || null,
    subjects: Array.isArray(t.subjects) ? t.subjects[0] || null : t.subjects || null,
    teachers: Array.isArray(t.teachers) ? t.teachers[0] || null : t.teachers || null,
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
    .select("id, full_name")
    .order("full_name", { ascending: true });

  // Fetch class_subjects assignments
  const { data: classSubjectsData } = await supabase
    .from("class_subjects")
    .select(`
      *,
      subjects (id, name, code),
      teachers (id, full_name)
    `);

  return (
    <TimetableClient
      initialEntries={initialEntries}
      classesList={classesData || []}
      subjectsList={subjectsData || []}
      teachersList={teachersData || []}
      classSubjectsList={classSubjectsData || []}
    />
  );
}
