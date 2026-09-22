"use client";

import React, { useState } from "react";

import { CalendarCheck, Save, CheckCircle2, UserCheck, AlertCircle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

interface StudentRecord {
  id: string;
  admission_number: string;
  full_name: string;
  status: string;
}

interface TeacherAttendanceClientProps {
  assignedClasses: any[];
  initialClassId: string;
  initialStudents: StudentRecord[];
  initialAttendanceMap: Record<string, string>;
}

export function TeacherAttendanceClient({
  assignedClasses,
  initialClassId,
  initialStudents,
  initialAttendanceMap,
}: TeacherAttendanceClientProps) {


  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>(
    initialAttendanceMap
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleClassOrDateChange = async (classId: string, dateStr: string) => {
    setSelectedClassId(classId);
    setSelectedDate(dateStr);

    if (!classId) {
      setStudents([]);
      setAttendanceMap({});
      return;
    }

    setIsLoading(true);
    try {
      // Fetch students and attendance via server API (bypasses RLS)
      const res = await fetch(`/api/teacher/attendance?classId=${classId}&date=${dateStr}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load class attendance.");
      }

      const stList = data.students || [];
      setStudents(stList);

      const map: Record<string, string> = { ...(data.attendanceMap || {}) };

      // Default unmarked students to "present"
      stList.forEach((s: StudentRecord) => {
        if (!map[s.id]) {
          map[s.id] = "present";
        }
      });

      setAttendanceMap(map);
    } catch (err: any) {
      showToast(err.message || "Failed to load class attendance.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const setAllStatus = (status: string) => {
    const updated = { ...attendanceMap };
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const setStudentStatus = (studentId: string, status: string) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId || students.length === 0) return;

    setIsSaving(true);
    try {
      const records = students.map((s) => ({
        student_id: s.id,
        status: attendanceMap[s.id] || "present",
      }));

      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records,
          classId: selectedClassId,
          date: selectedDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save attendance.");
      }

      showToast("Attendance roll call saved successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to save attendance.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedClass = assignedClasses.find((c) => c.id === selectedClassId);
  const classNameStr = selectedClass
    ? `${selectedClass.name}${selectedClass.division ? ` (${selectedClass.division})` : ""}`
    : "Select Class";

  const presentCount = Object.values(attendanceMap).filter((s) => s === "present").length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === "absent").length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === "late").length;
  const leaveCount = Object.values(attendanceMap).filter((s) => s === "leave").length;

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Class Attendance Register
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Mark daily attendance for your assigned class <span className="font-bold text-indigo-700">{classNameStr}</span>
          </p>
        </div>

        <Button
          onClick={handleSaveAttendance}
          disabled={isSaving || students.length === 0}
          icon={<Save className="w-4 h-4" />}
          size="md"
        >
          {isSaving ? "Saving Register..." : "Submit Attendance"}
        </Button>
      </div>

      {/* Class & Date Selector Bar */}
      <Card padding="sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Assigned Class *
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => handleClassOrDateChange(e.target.value, selectedDate)}
              className="w-full px-3 py-2.5 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              Attendance Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleClassOrDateChange(selectedClassId, e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Card>

      {/* Attendance Summary Bar & Set All Actions */}
      {students.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              Present: {presentCount}
            </span>
            <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
              Absent: {absentCount}
            </span>
            <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
              Late: {lateCount}
            </span>
            <span className="text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
              Leave: {leaveCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Quick Mark All:</span>
            <button
              onClick={() => setAllStatus("present")}
              className="text-xs font-bold text-emerald-700 hover:bg-emerald-100 bg-emerald-50 px-2.5 py-1 rounded-lg transition"
            >
              All Present
            </button>
            <button
              onClick={() => setAllStatus("absent")}
              className="text-xs font-bold text-rose-700 hover:bg-rose-100 bg-rose-50 px-2.5 py-1 rounded-lg transition"
            >
              All Absent
            </button>
          </div>
        </div>
      )}

      {/* Roll Call Table */}
      <Card>
        <CardHeader
          title={`Roll Call Register — ${classNameStr}`}
          subtitle={`Date: ${new Date(selectedDate).toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
          })} (${students.length} students)`}
        />

        {isLoading ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400">
            Loading class students...
          </div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Adm #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {students.map((s) => {
                  const status = attendanceMap[s.id] || "present";

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-500">
                        {s.admission_number || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{s.full_name}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.id, "present")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition min-h-[36px] ${
                              status === "present"
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.id, "absent")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition min-h-[36px] ${
                              status === "absent"
                                ? "bg-rose-600 text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.id, "late")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition min-h-[36px] ${
                              status === "late"
                                ? "bg-amber-500 text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.id, "leave")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition min-h-[36px] ${
                              status === "leave"
                                ? "bg-sky-600 text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
            <CalendarCheck className="w-8 h-8 mx-auto text-slate-300" />
            <p>No students enrolled in this class division.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
