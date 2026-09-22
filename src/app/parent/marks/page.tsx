import { validateParentSession } from "@/lib/parentAuth";
import { createClient } from "@supabase/supabase-js";
import { FileText, Award, CheckCircle2, BookOpen, Clock, ChevronRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParentAppShell } from "@/components/parent/ParentAppShell";

export default async function ParentMarksPage() {
  const { student, hasMultipleChildren } = await validateParentSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const classNameStr = student.classes?.name
    ? `${student.classes.name}${student.classes.division ? ` (${student.classes.division})` : ""}`
    : "Unassigned Class";

  // Fetch all marks for this student joined with exams and subjects
  const { data: rawMarks } = await supabase
    .from("marks")
    .select(`
      *,
      exams (
        id,
        name,
        exam_date,
        academic_year
      ),
      subjects (
        id,
        name,
        code
      )
    `)
    .eq("student_id", student.id)
    .order("created_at", { ascending: false });

  const marksList = (rawMarks || []).map((m: any) => ({
    ...m,
    exams: Array.isArray(m.exams) ? m.exams[0] || null : m.exams || null,
    subjects: Array.isArray(m.subjects) ? m.subjects[0] || null : m.subjects || null,
  }));

  // Group marks by Exam Name
  const examGroups: Record<string, { examInfo: any; marksItems: any[] }> = {};

  for (const mark of marksList) {
    const examName = mark.exams?.name || "General Evaluation";
    if (!examGroups[examName]) {
      examGroups[examName] = {
        examInfo: mark.exams,
        marksItems: [],
      };
    }
    examGroups[examName].marksItems.push(mark);
  }

  const examGroupList = Object.entries(examGroups);

  const getGradeBadge = (grade?: string) => {
    if (!grade) return null;
    const upper = grade.toUpperCase();
    if (upper.startsWith("A")) return <Badge variant="success">{upper}</Badge>;
    if (upper.startsWith("B")) return <Badge variant="primary">{upper}</Badge>;
    if (upper.startsWith("C")) return <Badge variant="warning">{upper}</Badge>;
    return <Badge variant="neutral">{upper}</Badge>;
  };

  return (
    <ParentAppShell
      childName={student.full_name}
      classNameStr={classNameStr}
      hasMultipleChildren={hasMultipleChildren}
    >
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Exam Marks & Performance
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Academic evaluation and report cards for <span className="font-bold text-slate-800">{student.full_name}</span> in <span className="font-bold text-indigo-700">{classNameStr}</span>
            </p>
          </div>

          <Badge variant="primary" size="md">
            {examGroupList.length} Exam Evaluation{examGroupList.length === 1 ? "" : "s"}
          </Badge>
        </div>

        {/* Exam Report Cards Grouped by Examination */}
        {examGroupList.length > 0 ? (
          <div className="space-y-6">
            {examGroupList.map(([examName, { examInfo, marksItems }]) => {
              const totalScored = marksItems.reduce(
                (sum, m) => sum + (Number(m.marks_obtained) || 0),
                0
              );
              const totalMax = marksItems.reduce(
                (sum, m) => sum + (Number(m.max_marks) || 100),
                0
              );
              const examPercentage = totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : 0;

              return (
                <Card key={examName}>
                  <CardHeader
                    title={examName}
                    subtitle={`Academic Year ${examInfo?.academic_year || "2026-2027"} • Date: ${
                      examInfo?.exam_date
                        ? new Date(examInfo.exam_date).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Completed"
                    }`}
                    action={
                      <div className="flex items-center gap-2 bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-100">
                        <Award className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-extrabold text-indigo-900">
                          {examPercentage}% Overall Score
                        </span>
                      </div>
                    }
                  />

                  {/* Marks Table for this Exam */}
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-left border-collapse min-w-[550px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                          <th className="py-3 px-4">Subject</th>
                          <th className="py-3 px-4 text-center">Marks Obtained</th>
                          <th className="py-3 px-4 text-center">Maximum Marks</th>
                          <th className="py-3 px-4 text-center">Percentage</th>
                          <th className="py-3 px-4 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                        {marksItems.map((item) => {
                          const subjectName = item.subjects?.name || "Subject";
                          const subjectCode = item.subjects?.code ? ` (${item.subjects.code})` : "";
                          const scored = Number(item.marks_obtained) || 0;
                          const max = Number(item.max_marks) || 100;
                          const pct = max > 0 ? Math.round((scored / max) * 100) : 0;

                          return (
                            <tr key={item.id} className="hover:bg-slate-50/60 transition">
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-slate-900">
                                  {subjectName}
                                  <span className="font-normal text-slate-400">{subjectCode}</span>
                                </p>
                                {item.remarks && (
                                  <p className="text-[11px] text-slate-500 mt-0.5">{item.remarks}</p>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-center font-extrabold text-indigo-900">
                                {scored}
                              </td>
                              <td className="py-3.5 px-4 text-center text-slate-500">{max}</td>
                              <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                                {pct}%
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {getGradeBadge(item.grade) || <span className="text-slate-400">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 border-t border-slate-200 text-xs font-bold text-slate-900">
                          <td className="py-3.5 px-4 uppercase tracking-wider">Total Performance</td>
                          <td className="py-3.5 px-4 text-center text-indigo-900 text-sm">
                            {totalScored}
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-600">{totalMax}</td>
                          <td className="py-3.5 px-4 text-center text-indigo-700 text-sm">
                            {examPercentage}%
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {getGradeBadge(
                              examPercentage >= 90
                                ? "A+"
                                : examPercentage >= 80
                                ? "A"
                                : examPercentage >= 70
                                ? "B"
                                : examPercentage >= 60
                                ? "C"
                                : "D"
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Exam Marks Published</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Exam marks and report cards have not been published for {student.full_name} yet. Check back after examination evaluations are completed.
            </p>
          </div>
        )}
      </div>
    </ParentAppShell>
  );
}
