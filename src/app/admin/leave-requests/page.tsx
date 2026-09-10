import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LeaveClient from "./leave-client";

export default async function AdminLeaveRequestsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch initial leave requests joined with student & class
  const { data: rawRequests } = await supabase
    .from("leave_requests")
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

  const initialRequests = (rawRequests || []).map((l: any) => {
    const studentObj = Array.isArray(l.students) ? l.students[0] || null : l.students || null;
    return {
      ...l,
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

  // Fetch classes list for filter & form dropdowns
  const { data: classesData } = await supabase
    .from("classes")
    .select("id, name, division")
    .order("name", { ascending: true });

  // Fetch students list for form dropdown
  const { data: studentsData } = await supabase
    .from("students")
    .select("id, full_name, admission_number, class_id")
    .order("full_name", { ascending: true });

  return (
    <LeaveClient
      initialRequests={initialRequests}
      classesList={classesData || []}
      studentsList={studentsData || []}
      currentUserId={user.id}
    />
  );
}
