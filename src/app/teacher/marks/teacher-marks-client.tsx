"use client";

import React, { useState } from "react";

import { FileText, Save, CheckCircle2, Award, AlertCircle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

interface StudentRecord {
  id: string;
  admission_number: string;
  full_name: string;
}

interface TeacherMarksClientProps {
  examsList: any[];
  assignedClasses: any[];
  assignedSubjects: any[];
  initialExamId: string;
  initialClassId: string;
  initialSubjectId: string;
  initialStudents: StudentRecord[];
  initialMarksMap: Record<string, { marks_obtained: string; max_marks: string; grade: string; remarks: string }>;
}

export function TeacherMarksClient({
  examsList,
  assignedClasses,
  assignedSubjects,
  initialExamId,
  initialClassId,
  initialSubjectId,
  initialStudents,
  initialMarksMap,
}: TeacherMarksClientProps) {


  const [selectedExamId, setSelectedExamId] = useState(initialExamId);
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);

  const [students, setStudents] = useState<StudentRecord[]>(initialStudents);
  const [marksMap, setMarksMap] = useState<
    Record<string, { marks_obtained: string; max_marks: string; grade: string; remarks: string }>
  >(initialMarksMap);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleFilterChange = async (examId: string, classId: string, subjectId: string) => {
    setSelectedExamId(examId);
    setSelectedClassId(classId);
    setSelectedSubjectId(subjectId);

    if (!classId || !examId) {
      setStudents([]);
      setMarksMap({});
      return;
    }

    setIsLoading(true);
    try {
      let url = `/api/teacher/marks?examId=${examId}&classId=${classId}`;
      if (subjectId) url += `&subjectId=${subjectId}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load marks.");
      }

      const stList = data.students || [];
      setStudents(stList);

      const map: Record<string, { marks_obtained: string; max_marks: string; grade: string; remarks: string }> = { ...(data.marksMap || {}) };

      // Default unmarked
      stList.forEach((s: StudentRecord) => {
        if (!map[s.id]) {
          map[s.id] = { marks_obtained: "", max_marks: "100", grade: "", remarks: "" };
        }
      });

      setMarksMap(map);
    } catch (err: any) {
      showToast(err.message || "Failed to load class marks.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudentMark = (
    studentId: string,
    field: "marks_obtained" | "max_marks" | "grade" | "remarks",
    value: string
  ) => {
    setMarksMap((prev) => {
      const current = prev[studentId] || { marks_obtained: "", max_marks: "100", grade: "", remarks: "" };
      const updated = { ...current, [field]: value };

      // Auto compute grade if marks_obtained changes
      if (field === "marks_obtained") {
        const scored = Number(value);
        const max = Number(updated.max_marks) || 100;
        if (!isNaN(scored) && value !== "") {
          const pct = Math.round((scored / max) * 100);
          updated.grade =
            pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : "D";
        }
      }

      return { ...prev, [studentId]: updated };
    });
  };

  const handleSaveMarks = async () => {
    if (!selectedExamId || !selectedClassId || students.length === 0) return;

    setIsSaving(true);
    try {
      const recordsToUpsert: any[] = [];

      students.forEach((s) => {
        const item = marksMap[s.id];
        if (item && item.marks_obtained !== "") {
          recordsToUpsert.push({
            exam_id: selectedExamId,
            class_id: selectedClassId,
            subject_id: selectedSubjectId || null,
            student_id: s.id,
            marks_obtained: Number(item.marks_obtained) || 0,
            max_marks: Number(item.max_marks) || 100,
            grade: item.grade || null,
            remarks: item.remarks || null,
          });
        }
      });

      if (recordsToUpsert.length === 0) {
        showToast("No marks entered to submit.", "error");
        setIsSaving(false);
        return;
      }

      const res = await fetch("/api/teacher/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: recordsToUpsert }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save exam marks.");
      }

      showToast("Exam marks saved successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to save exam marks.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedClass = assignedClasses.find((c) => c.id === selectedClassId);
  const classNameStr = selectedClass
    ? `${selectedClass.name}${selectedClass.division ? ` (${selectedClass.division})` : ""}`
    : "Select Class";

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Exam Marks Entry
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Enter evaluation marks for students in your assigned class and subject
          </p>
        </div>

        <Button
          onClick={handleSaveMarks}
          disabled={isSaving || students.length === 0}
          icon={<Save className="w-4 h-4" />}
        >
          {isSaving ? "Saving Marks..." : "Save Marks Entry"}
        </Button>
      </div>

      {/* Selector Filters */}
      <Card padding="sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Examination *
            </label>
            <select
              value={selectedExamId}
              onChange={(e) =>
                handleFilterChange(e.target.value, selectedClassId, selectedSubjectId)
              }
              className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {examsList.length === 0 && <option value="">No Active Exams</option>}
              {examsList.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.academic_year || "2026-2027"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Assigned Class *
            </label>
            <select
              value={selectedClassId}
              onChange={(e) =>
                handleFilterChange(selectedExamId, e.target.value, selectedSubjectId)
              }
              className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {assignedClasses.length === 0 && <option value="">No Class Assigned</option>}
              {assignedClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.division ? `(${c.division})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Assigned Subject *
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) =>
                handleFilterChange(selectedExamId, selectedClassId, e.target.value)
              }
              className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {assignedSubjects.length === 0 && <option value="">General Subject</option>}
              {assignedSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Marks Table */}
      <Card>
        <CardHeader
          title={`Marks Evaluation Register — ${classNameStr}`}
          subtitle={`Students list for marks entry (${students.length} students)`}
        />

        {isLoading ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400">
            Loading class students...
          </div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Adm #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 text-center w-32">Marks Obtained</th>
                  <th className="py-3 px-4 text-center w-28">Max Marks</th>
                  <th className="py-3 px-4 text-center w-24">Grade</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {students.map((s) => {
                  const item = marksMap[s.id] || {
                    marks_obtained: "",
                    max_marks: "100",
                    grade: "",
                    remarks: "",
                  };

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-500">
                        {s.admission_number || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{s.full_name}</td>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="number"
                          placeholder="e.g. 85"
                          value={item.marks_obtained}
                          onChange={(e) => updateStudentMark(s.id, "marks_obtained", e.target.value)}
                          className="w-24 text-center font-extrabold text-indigo-900 py-1.5 px-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="number"
                          placeholder="100"
                          value={item.max_marks}
                          onChange={(e) => updateStudentMark(s.id, "max_marks", e.target.value)}
                          className="w-20 text-center text-slate-600 py-1.5 px-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="text"
                          placeholder="A+"
                          value={item.grade}
                          onChange={(e) => updateStudentMark(s.id, "grade", e.target.value)}
                          className="w-16 text-center font-extrabold text-emerald-800 uppercase py-1.5 px-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Teacher comments..."
                          value={item.remarks}
                          onChange={(e) => updateStudentMark(s.id, "remarks", e.target.value)}
                          className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p>No students found for this class.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
