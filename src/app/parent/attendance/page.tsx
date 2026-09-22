import { validateParentSession } from "@/lib/parentAuth";
import { createClient } from "@supabase/supabase-js";
import { CalendarCheck } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParentAppShell } from "@/components/parent/ParentAppShell";

export default async function ParentAttendancePage() {
  const { student, hasMultipleChildren } = await validateParentSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const classNameStr = student.classes?.name
    ? `${student.classes.name}${student.classes.division ? ` (${student.classes.division})` : ""}`
    : "Unassigned Class";

  // Fetch all attendance records for this student only
  const { data: attendanceRecords } = await supabase
    .from("attendance")
    .select("*")
    .eq("student_id", student.id)
    .order("attendance_date", { ascending: false });

  const recordsList = attendanceRecords || [];

  const totalMarked = recordsList.length;
  const presentCount = recordsList.filter((a) => a.status === "present").length;
  const absentCount = recordsList.filter((a) => a.status === "absent").length;
  const lateCount = recordsList.filter((a) => a.status === "late").length;
  const leaveCount = recordsList.filter((a) => a.status === "leave").length;

  const attendanceRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "present":
        return <Badge variant="success">Present</Badge>;
      case "absent":
        return <Badge variant="danger">Absent</Badge>;
      case "late":
        return <Badge variant="warning">Late Arrival</Badge>;
      case "leave":
        return <Badge variant="primary">On Leave</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <ParentAppShell
      childName={student.full_name}
      classNameStr={classNameStr}
      hasMultipleChildren={hasMultipleChildren}
    >
      <div className="space-y-6">
        {/* Header Title Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Attendance Record
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Daily attendance logs for <span className="font-bold text-slate-900">{student.full_name}</span> in <span className="font-extrabold text-indigo-600">{classNameStr}</span>
            </p>
          </div>

          <Badge variant={attendanceRate >= 75 ? "success" : "danger"} size="md">
            {totalMarked > 0 ? `${attendanceRate}% Overall Attendance` : "No Records Yet"}
          </Badge>
        </div>

        {/* Summary Metric Cards (4 Columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-emerald-200 bg-emerald-50/20 rounded-2xl p-4 text-center shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Present Rate
            </span>
            <p className="text-3xl font-extrabold text-emerald-900 mt-1">{attendanceRate}%</p>
            <p className="text-xs text-emerald-700 font-semibold mt-1">{presentCount} Days Present</p>
          </div>

          <div className="bg-white border border-rose-200 bg-rose-50/20 rounded-2xl p-4 text-center shadow-2xs">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
              Absent Days
            </span>
            <p className="text-3xl font-extrabold text-rose-900 mt-1">{absentCount}</p>
            <p className="text-xs text-rose-700 font-semibold mt-1">Days Unexcused</p>
          </div>

          <div className="bg-white border border-amber-200 bg-amber-50/20 rounded-2xl p-4 text-center shadow-2xs">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Late Arrivals
            </span>
            <p className="text-3xl font-extrabold text-amber-900 mt-1">{lateCount}</p>
            <p className="text-xs text-amber-700 font-semibold mt-1">Times Late</p>
          </div>

          <div className="bg-white border border-sky-200 bg-sky-50/20 rounded-2xl p-4 text-center shadow-2xs">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
              Approved Leaves
            </span>
            <p className="text-3xl font-extrabold text-sky-900 mt-1">{leaveCount}</p>
            <p className="text-xs text-sky-700 font-semibold mt-1">Sanctioned Leaves</p>
          </div>
        </div>

        {/* Detailed Attendance History */}
        <Card>
          <CardHeader
            title="Daily Attendance History"
            subtitle={`Full roll call record for ${student.full_name} (${totalMarked} total days marked)`}
          />

          {recordsList.length > 0 ? (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Day of Week</th>
                    <th className="py-3 px-4 text-center">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                  {recordsList.map((rec) => {
                    const dateObj = new Date(rec.attendance_date);
                    const formattedDate = dateObj.toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });
                    const dayOfWeek = dateObj.toLocaleDateString("en-IN", { weekday: "long" });

                    return (
                      <tr key={rec.id || rec.attendance_date} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{formattedDate}</td>
                        <td className="py-3.5 px-4 text-slate-600">{dayOfWeek}</td>
                        <td className="py-3.5 px-4 text-center">{getStatusBadge(rec.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
              <CalendarCheck className="w-8 h-8 mx-auto text-slate-300" />
              <p>No daily attendance records found for this student yet.</p>
            </div>
          )}
        </Card>
      </div>
    </ParentAppShell>
  );
}
