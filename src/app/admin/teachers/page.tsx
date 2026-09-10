import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TeacherManagementClient from "./teacher-management-client";

export default async function AdminTeachersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch teachers from Supabase
  let initialTeachers: any[] = [];
  const { data: teachersData } = await supabase
    .from("teachers")
    .select("*")
    .order("created_at", { ascending: false });

  if (teachersData) {
    initialTeachers = teachersData;
  }

  // Fetch subject names if available
  let subjectsList: string[] = [];
  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("name")
    .order("name", { ascending: true });

  if (subjectsData) {
    subjectsList = subjectsData.map((s: any) => s.name).filter(Boolean);
  }

  return (
    <TeacherManagementClient
      initialTeachers={initialTeachers}
      subjectsList={subjectsList}
    />
  );
}
