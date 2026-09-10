import React from "react";
import { ExamItem, MarkItem } from "@/types/exam";
import { SubjectItem } from "@/types/subject";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { calculateGrade } from "@/services/examService";

export interface StudentRowItem {
  id: string;
  admission_number: string;
  full_name: string;
}

export interface MarksReportProps {
  exams: ExamItem[];
  selectedExamId: string;
  onExamChange: (examId: string) => void;
  students: StudentRowItem[];
  classSubjects: SubjectItem[];
  marks: MarkItem[];
  isLoading?: boolean;
}

export const MarksReport: React.FC<MarksReportProps> = ({
  exams,
  selectedExamId,
  onExamChange,
  students,
  classSubjects,
  marks,
  isLoading = false,
}) => {
  const currentExam = exams.find((e) => String(e.id) === String(selectedExamId));

  const marksMap: Record<string, MarkItem> = {};
  marks.forEach((m) => {
    marksMap[`${m.student_id}_${m.subject_id}`] = m;
  });

  return (
    <div className="space-y-6">
      {/* Controls Card */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Select
              label="Select Exam to View Report"
              value={selectedExamId}
              onChange={(e) => onExamChange(e.target.value)}
              options={[
                { label: "Choose an exam...", value: "" },
                ...exams.map((e) => ({
                  label: `${e.name} (${e.classes?.name || "All Classes"})`,
                  value: e.id,
                })),
              ]}
            />
          </div>
          {currentExam && (
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                AY: {currentExam.academic_year || "2026-2027"}
              </Badge>
              <Badge variant="neutral" size="sm">
                Class: {currentExam.classes?.name || "Unassigned"}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Report Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Student</th>
                {classSubjects.map((sub) => (
                  <th key={sub.id} className="px-4 py-3.5 text-center border-l border-slate-200">
                    {sub.name}
                  </th>
                ))}
                <th className="px-6 py-3.5 text-center border-l border-slate-200">Total Score</th>
                <th className="px-6 py-3.5 text-right border-l border-slate-200">Overall Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={classSubjects.length + 3} className="px-6 py-12 text-center text-slate-400">
                    Loading marksheets...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => {
                  let totalObtained = 0;
                  let totalMax = 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={student.full_name} size="sm" />
                          <div>
                            <p className="font-semibold text-slate-900">{student.full_name}</p>
                            <p className="text-[11px] text-slate-400">Adm: {student.admission_number}</p>
                          </div>
                        </div>
                      </td>

                      {classSubjects.map((sub) => {
                        const m = marksMap[`${student.id}_${sub.id}`];
                        if (m) {
                          totalObtained += Number(m.marks_obtained) || 0;
                          totalMax += Number(m.max_marks) || 100;
                        }

                        return (
                          <td key={sub.id} className="px-4 py-4 text-center border-l border-slate-100">
                            {m ? (
                              <div>
                                <span className="font-bold text-slate-900">{m.marks_obtained}</span>
                                <span className="text-xs text-slate-400">/{m.max_marks}</span>
                                <span className="block text-[10px] font-semibold text-indigo-600">
                                  {m.grade || calculateGrade(m.marks_obtained, m.max_marks)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Total Score Column */}
                      <td className="px-6 py-4 text-center border-l border-slate-100 font-bold text-slate-900">
                        {totalMax > 0 ? (
                          <div>
                            <span>{totalObtained}</span>
                            <span className="text-xs text-slate-400">/{totalMax}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Overall Grade Column */}
                      <td className="px-6 py-4 text-right border-l border-slate-100">
                        {totalMax > 0 ? (
                          <Badge
                            variant={
                              calculateGrade(totalObtained, totalMax).startsWith("A")
                                ? "success"
                                : calculateGrade(totalObtained, totalMax) === "F"
                                ? "danger"
                                : "primary"
                            }
                          >
                            {calculateGrade(totalObtained, totalMax)} (
                            {Math.round((totalObtained / totalMax) * 100)}%)
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-xs">Unmarked</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={classSubjects.length + 3} className="px-6 py-12 text-center text-slate-400">
                    Select an exam above to view student marks.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
