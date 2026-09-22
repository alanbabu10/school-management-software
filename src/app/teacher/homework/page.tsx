import { validateTeacherSession } from "@/lib/teacherAuth";
import { createClient } from "@supabase/supabase-js";
import { TeacherAppShell } from "@/components/teacher/TeacherAppShell";
import { TeacherHomeworkClient } from "./teacher-homework-client";

export default async function TeacherHomeworkPage() {
  const { teacher, assignedClasses, assignedClassSubjects } = await validateTeacherSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch homework posted by this teacher
  const { data: rawHomeworks } = await supabase
    .from("homework")
    .select(`
      *,
      classes (id, name, division),
      subjects (id, name, code)
    `)
    .eq("teacher_id", teacher.id)
    .order("created_at", { ascending: false });

  const initialHomeworks = (rawHomeworks || []).map((h: any) => ({
    ...h,
    classes: Array.isArray(h.classes) ? h.classes[0] || null : h.classes || null,
    subjects: Array.isArray(h.subjects) ? h.subjects[0] || null : h.subjects || null,
  }));

  // Extract unique assigned subjects
  const subjectMap: Record<string, any> = {};
  assignedClassSubjects.forEach((cs) => {
    if (cs.subjects?.id) {
      subjectMap[cs.subjects.id] = cs.subjects;
    }
  });
  const assignedSubjects = Object.values(subjectMap);

  return (
    <TeacherAppShell
      teacherName={teacher.full_name}
      employeeId={teacher.employee_id}
      subjectStr={teacher.subject || "Faculty Member"}
    >
      <TeacherHomeworkClient
        teacherId={teacher.id}
        assignedClasses={assignedClasses}
        assignedSubjects={assignedSubjects}
        initialHomeworks={initialHomeworks}
      />
    </TeacherAppShell>
  );
}
