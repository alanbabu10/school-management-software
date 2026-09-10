import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, CalendarOff } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface StudentItem {
  id: string;
  admission_number: string;
  full_name: string;
  class_id?: string;
  classes?: { name: string } | null;
}

export interface AttendanceTableProps {
  students: StudentItem[];
  attendanceMap: Record<string, "present" | "absent" | "late" | "leave">;
  onStatusChange: (studentId: string, status: "present" | "absent" | "late" | "leave") => void;
  isLoading?: boolean;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  students,
  attendanceMap,
  onStatusChange,
  isLoading = false,
}) => {
  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3.5">Admission No</th>
              <th className="px-6 py-3.5">Student</th>
              <th className="px-6 py-3.5">Class</th>
              <th className="px-6 py-3.5 text-center">Attendance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  Loading attendance records...
                </td>
              </tr>
            ) : students.length > 0 ? (
              students.map((student) => {
                const currentStatus = attendanceMap[student.id] || "present";

                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {student.admission_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={student.full_name} size="sm" />
                        <span className="font-semibold text-slate-900">{student.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="primary">{student.classes?.name || "Class"}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit mx-auto">
                        <button
                          type="button"
                          onClick={() => onStatusChange(student.id, "present")}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            currentStatus === "present"
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Present
                        </button>
                        <button
                          type="button"
                          onClick={() => onStatusChange(student.id, "absent")}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            currentStatus === "absent"
                              ? "bg-rose-600 text-white shadow-2xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => onStatusChange(student.id, "late")}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            currentStatus === "late"
                              ? "bg-amber-500 text-white shadow-2xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" /> Late
                        </button>
                        <button
                          type="button"
                          onClick={() => onStatusChange(student.id, "leave")}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            currentStatus === "leave"
                              ? "bg-sky-600 text-white shadow-2xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <CalendarOff className="w-3.5 h-3.5" /> Leave
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  No student records found for selected class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
