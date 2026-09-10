import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ClassManagementClient from "./class-management-client";

export default async function AdminClassesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch classes from Supabase
  let initialClasses: any[] = [];
  const { data: classesData, error: classesError } = await supabase
    .from("classes")
    .select(`
      *,
      teachers (
        id,
        full_name,
        employee_id
      )
    `)
    .order("name", { ascending: true });

  if (classesError) {
    const { data: rawClasses } = await supabase
      .from("classes")
      .select("*")
      .order("name", { ascending: true });
    initialClasses = rawClasses || [];
  } else {
    initialClasses = classesData || [];
  }

  // Fetch teachers for dropdown selection
  const { data: teachersData } = await supabase
    .from("teachers")
    .select("id, full_name, employee_id")
    .order("full_name", { ascending: true });

  // Extract unique academic years for filter dropdown
  const academicYearsSet = new Set<string>();
  initialClasses.forEach((cls: any) => {
    if (cls.academic_year) {
      academicYearsSet.add(cls.academic_year);
    }
  });
  academicYearsSet.add("2026-2027");

  return (
    <ClassManagementClient
      initialClasses={initialClasses}
      teachersList={teachersData || []}
      academicYearsList={Array.from(academicYearsSet)}
    />
  );
}
