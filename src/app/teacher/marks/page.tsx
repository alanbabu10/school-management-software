import { validateTeacherSession } from "@/lib/teacherAuth";
import { createClient } from "@supabase/supabase-js";
import { TeacherAppShell } from "@/components/teacher/TeacherAppShell";
import { TeacherMarksClient } from "./teacher-marks-client";

export default async function TeacherMarksPage() {
  const { teacher, assignedClasses, assignedClassSubjects, assignedClassIds } =
    await validateTeacherSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch Active Exams
  const { data: examsData } = await supabase
    .from("exams")
    .select("*")
    .order("created_at", { ascending: false });

  const examsList = examsData || [];
  const initialExamId = examsList[0]?.id || "";
  const initialClassId = assignedClassIds[0] || "";

  // Consolidate unique assigned subjects
  const subjectMap: Record<string, any> = {};
  assignedClassSubjects.forEach((cs) => {
    if (cs.subjects?.id) {
      subjectMap[cs.subjects.id] = cs.subjects;
    }
  });
  const assignedSubjects = Object.values(subjectMap);
  const initialSubjectId = assignedSubjects[0]?.id || "";

  let initialStudents: any[] = [];
  const initialMarksMap: Record<
    string,
    { marks_obtained: string; max_marks: string; grade: string; remarks: string }
  > = {};

  if (initialClassId && initialExamId) {
    const { data: stData } = await supabase
      .from("students")
      .select("id, admission_number, full_name")
      .eq("class_id", initialClassId)
      .order("full_name", { ascending: true });

    initialStudents = stData || [];

    let query = supabase
      .from("marks")
      .select("*")
      .eq("exam_id", initialExamId)
      .eq("class_id", initialClassId);

    if (initialSubjectId) {
      query = query.eq("subject_id", initialSubjectId);
    }

    const { data: marksData } = await query;

    (marksData || []).forEach((m: any) => {
      initialMarksMap[m.student_id] = {
        marks_obtained:
          m.marks_obtained !== null && m.marks_obtained !== undefined
            ? String(m.marks_obtained)
            : "",
        max_marks:
          m.max_marks !== null && m.max_marks !== undefined ? String(m.max_marks) : "100",
        grade: m.grade || "",
        remarks: m.remarks || "",
      };
    });

    initialStudents.forEach((s) => {
      if (!initialMarksMap[s.id]) {
        initialMarksMap[s.id] = {
          marks_obtained: "",
          max_marks: "100",
          grade: "",
          remarks: "",
        };
      }
    });
  }

  return (
    <TeacherAppShell
      teacherName={teacher.full_name}
      employeeId={teacher.employee_id}
      subjectStr={teacher.subject || "Faculty Member"}
    >
      <TeacherMarksClient
        examsList={examsList}
        assignedClasses={assignedClasses}
        assignedSubjects={assignedSubjects}
        initialExamId={initialExamId}
        initialClassId={initialClassId}
        initialSubjectId={initialSubjectId}
        initialStudents={initialStudents}
        initialMarksMap={initialMarksMap}
      />
    </TeacherAppShell>
  );
}
