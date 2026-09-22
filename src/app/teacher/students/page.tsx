import { validateTeacherSession } from "@/lib/teacherAuth";
import { createClient } from "@supabase/supabase-js";
import { TeacherAppShell } from "@/components/teacher/TeacherAppShell";
import { TeacherStudentsClient } from "./teacher-students-client";

export default async function TeacherStudentsPage() {
  const { teacher, assignedClasses, assignedClassIds } = await validateTeacherSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let initialStudents: any[] = [];

  if (assignedClassIds && assignedClassIds.length > 0) {
    const { data } = await supabase
      .from("students")
      .select(`
        *,
        classes (
          id,
          name,
          division
        )
      `)
      .in("class_id", assignedClassIds)
      .order("created_at", { ascending: false });

    initialStudents = (data || []).map((s: any) => ({
      ...s,
      classes: Array.isArray(s.classes) ? s.classes[0] || null : s.classes || null,
    }));
  }

  return (
    <TeacherAppShell
      teacherName={teacher.full_name}
      employeeId={teacher.employee_id}
      subjectStr={teacher.subject || "Faculty Member"}
    >
      <TeacherStudentsClient
        initialStudents={initialStudents}
        assignedClasses={assignedClasses}
      />
    </TeacherAppShell>
  );
}
