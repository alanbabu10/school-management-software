import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FeesClient from "./fees-client";

export default async function AdminFeesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch initial fee records joined with student & class
  const { data: rawFees } = await supabase
    .from("fees")
    .select(`
      *,
      students (
        id,
        full_name,
        admission_number,
        class_id,
        classes (
          id,
          name,
          division
        )
      )
    `)
    .order("created_at", { ascending: false });

  const todayStr = new Date().toISOString().split("T")[0];

  const initialFees = (rawFees || []).map((f: any) => {
    const studentObj = Array.isArray(f.students) ? f.students[0] || null : f.students || null;
    let status = f.status || "pending";

    // Auto check overdue
    const isPastDue = f.due_date && f.due_date < todayStr;
    if (isPastDue && status !== "paid") {
      status = "overdue";
    }

    return {
      ...f,
      status,
      students: studentObj
        ? {
            ...studentObj,
            classes: Array.isArray(studentObj.classes)
              ? studentObj.classes[0] || null
              : studentObj.classes || null,
          }
        : null,
    };
  });

  // Fetch classes list for dropdowns & filters
  const { data: classesData } = await supabase
    .from("classes")
    .select("id, name, division")
    .order("name", { ascending: true });

  // Fetch students list for dropdowns
  const { data: studentsData } = await supabase
    .from("students")
    .select("id, full_name, admission_number, class_id")
    .order("full_name", { ascending: true });

  return (
    <FeesClient
      initialFees={initialFees}
      classesList={classesData || []}
      studentsList={studentsData || []}
    />
  );
}
