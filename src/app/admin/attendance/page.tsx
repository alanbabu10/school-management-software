import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AttendanceClient from "./attendance-client";

export default async function AdminAttendancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rawStudents } = await supabase
    .from("students")
    .select("id, admission_number, full_name, class_id, classes(name)")
    .order("admission_number", { ascending: true });

  const { data: classesData } = await supabase
    .from("classes")
    .select("id, name, division")
    .order("name", { ascending: true });

  const formattedStudents = (rawStudents || []).map((s: any) => ({
    id: s.id,
    admission_number: s.admission_number,
    full_name: s.full_name,
    class_id: s.class_id,
    classes: Array.isArray(s.classes) ? s.classes[0] || null : s.classes || null,
  }));

  return (
    <AttendanceClient
      initialStudents={formattedStudents}
      classesList={classesData || []}
    />
  );
}
