import React, { useState } from "react";
import { ExamItem, MarkItem } from "@/types/exam";
import { SubjectItem, ClassSubjectAssignment } from "@/types/subject";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculateGrade } from "@/services/examService";
import { Save, ArrowLeft } from "lucide-react";

export interface StudentRowItem {
  id: string;
  admission_number: string;
  full_name: string;
}

export interface MarksEntryGridProps {
  exam: ExamItem;
  students: StudentRowItem[];
  classSubjects: SubjectItem[];
  existingMarks: MarkItem[];
  onSave: (marksList: MarkItem[]) => void;
  onBack: () => void;
  isSaving?: boolean;
}

export const MarksEntryGrid: React.FC<MarksEntryGridProps> = ({
  exam,
  students,
  classSubjects,
  existingMarks,
  onSave,
  onBack,
  isSaving = false,
}) => {
  // State map: studentId_subjectId -> { obtained, max }
  const [gridData, setGridData] = useState<
    Record<string, { obtained: number; max: number }>
  >(() => {
    const initial: Record<string, { obtained: number; max: number }> = {};
    existingMarks.forEach((m) => {
      const key = `${m.student_id}_${m.subject_id}`;
      initial[key] = {
        obtained: m.marks_obtained,
        max: m.max_marks || 100,
      };
    });
    return initial;
  });

  const handleCellChange = (
    studentId: string,
    subjectId: string,
    field: "obtained" | "max",
    value: number
  ) => {
    const key = `${studentId}_${subjectId}`;
    setGridData((prev) => {
      const existing = prev[key] || { obtained: 0, max: 100 };
      return {
        ...prev,
        [key]: {
          ...existing,
          [field]: Math.max(0, value),
        },
      };
    });
  };

  const handleSaveAll = () => {
    const listToSave: MarkItem[] = [];

    students.forEach((student) => {
      classSubjects.forEach((subject) => {
        const key = `${student.id}_${subject.id}`;
        const val = gridData[key];
        if (val) {
          listToSave.push({
            exam_id: exam.id,
            student_id: student.id,
            subject_id: subject.id,
            marks_obtained: Number(val.obtained) || 0,
            max_marks: Number(val.max) || 100,
            grade: calculateGrade(val.obtained, val.max || 100),
          });
        }
      });
    });

    onSave(listToSave);
  };

  if (classSubjects.length === 0) {
    return (
      <Card padding="lg" className="text-center space-y-4">
        <p className="text-slate-500 text-sm">
          No subjects have been assigned to this class yet. Assign subjects to the class under <strong>Subjects & Curriculum</strong> first.
        </p>
        <Button variant="outline" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Exams
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-slate-900 text-base">{exam.name}</h3>
            <Badge variant="primary">{exam.classes?.name || "Assigned Class"}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-7">
            Enter marks obtained and maximum marks per subject. Grade is auto-computed.
          </p>
        </div>

        <Button onClick={handleSaveAll} disabled={isSaving} icon={<Save className="w-4 h-4" />}>
          {isSaving ? "Saving..." : "Save All Marks"}
        </Button>
      </div>

      {/* Grid Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5 sticky left-0 bg-slate-50 z-10">Student</th>
                {classSubjects.map((sub) => (
                  <th key={sub.id} className="px-4 py-3.5 text-center border-l border-slate-200">
                    <div>
                      <span>{sub.name}</span>
                      <span className="block text-[10px] text-indigo-600 font-normal">({sub.code})</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 sticky left-0 bg-white z-10 border-r border-slate-100">
                    <div className="flex items-center gap-3">
                      <Avatar name={student.full_name} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-900">{student.full_name}</p>
                        <p className="text-[11px] text-slate-400">Adm: {student.admission_number}</p>
                      </div>
                    </div>
                  </td>

                  {classSubjects.map((sub) => {
                    const key = `${student.id}_${sub.id}`;
                    const val = gridData[key] || { obtained: 0, max: 100 };
                    const grade = calculateGrade(val.obtained, val.max || 100);

                    return (
                      <td key={sub.id} className="px-4 py-3 text-center border-l border-slate-100">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-20">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Score</span>
                            <input
                              type="number"
                              min="0"
                              max={val.max || 100}
                              value={val.obtained}
                              onChange={(e) =>
                                handleCellChange(
                                  student.id,
                                  sub.id,
                                  "obtained",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full text-center py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 bg-white"
                            />
                          </div>

                          <span className="text-slate-300 font-light mt-3">/</span>

                          <div className="w-16">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Max</span>
                            <input
                              type="number"
                              min="1"
                              value={val.max}
                              onChange={(e) =>
                                handleCellChange(
                                  student.id,
                                  sub.id,
                                  "max",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full text-center py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 bg-slate-50"
                            />
                          </div>

                          <div className="ml-1 mt-3">
                            <Badge variant={grade.startsWith("A") ? "success" : grade === "F" ? "danger" : "primary"}>
                              {grade}
                            </Badge>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
