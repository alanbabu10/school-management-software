import { validateTeacherSession } from "@/lib/teacherAuth";
import { createClient } from "@supabase/supabase-js";
import { TeacherAppShell } from "@/components/teacher/TeacherAppShell";
import { TeacherAttendanceClient } from "./teacher-attendance-client";

export default async function TeacherAttendancePage() {
  const { teacher, assignedClasses, assignedClassIds } = await validateTeacherSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const initialClassId = assignedClassIds[0] || "";
  let initialStudents: any[] = [];
  const initialAttendanceMap: Record<string, string> = {};

  const todayStr = new Date().toISOString().split("T")[0];

  if (initialClassId) {
    const { data: stData } = await supabase
      .from("students")
      .select("id, admission_number, full_name, status")
      .eq("class_id", initialClassId)
      .order("full_name", { ascending: true });

    initialStudents = stData || [];

    const studentIds = initialStudents.map((s) => s.id);
    if (studentIds.length > 0) {
      const { data: attData } = await supabase
        .from("attendance")
        .select("student_id, status")
        .in("student_id", studentIds)
        .eq("attendance_date", todayStr);

      (attData || []).forEach((a) => {
        initialAttendanceMap[a.student_id] = a.status;
      });
    }

    initialStudents.forEach((s) => {
      if (!initialAttendanceMap[s.id]) {
        initialAttendanceMap[s.id] = "present";
      }
    });
  }

  return (
    <TeacherAppShell
      teacherName={teacher.full_name}
      employeeId={teacher.employee_id}
      subjectStr={teacher.subject || "Faculty Member"}
    >
      <TeacherAttendanceClient
        assignedClasses={assignedClasses}
        initialClassId={initialClassId}
        initialStudents={initialStudents}
        initialAttendanceMap={initialAttendanceMap}
      />
    </TeacherAppShell>
  );
}
