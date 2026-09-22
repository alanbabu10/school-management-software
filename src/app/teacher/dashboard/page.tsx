import { validateTeacherSession } from "@/lib/teacherAuth";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
  CalendarCheck,
  ClipboardList,
  FileText,
  CalendarDays,
  ChevronRight,
  BookOpen,
  UserCheck,
  Sparkles,
  School,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { TeacherAppShell } from "@/components/teacher/TeacherAppShell";

export default async function TeacherDashboardPage() {
  const { teacher, assignedClasses, assignedClassSubjects, assignedClassIds } =
    await validateTeacherSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Check Today's Attendance status for assigned classes
  const todayStr = new Date().toISOString().split("T")[0];
  let todayAttCount = 0;
  if (assignedClassIds.length > 0) {
    const { data: classStudents } = await supabase
      .from("students")
      .select("id")
      .in("class_id", assignedClassIds);

    const studentIds = (classStudents || []).map((s) => s.id);
    if (studentIds.length > 0) {
      const { count } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .in("student_id", studentIds)
        .eq("attendance_date", todayStr);
      todayAttCount = count || 0;
    }
  }

  // 2. Fetch Homework posted by this teacher
  const { count: homeworkCount } = await supabase
    .from("homework")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", teacher.id);

  // 3. Fetch Recent Homework posted by this teacher
  const { data: recentHomework } = await supabase
    .from("homework")
    .select(`
      *,
      classes (id, name, division),
      subjects (id, name, code)
    `)
    .eq("teacher_id", teacher.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // 4. Fetch Today's Timetable slots for this teacher
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = days[new Date().getDay()];
  const { data: todayTimetable } = await supabase
    .from("timetable")
    .select(`
      *,
      classes (id, name, division),
      subjects (id, name, code)
    `)
    .eq("teacher_id", teacher.id)
    .eq("day_of_week", currentDay)
    .order("period_number", { ascending: true });

  const assignedClassesStr =
    assignedClasses.length > 0
      ? assignedClasses
          .map((c) => `${c.name}${c.division ? ` (${c.division})` : ""}`)
          .join(", ")
      : "No class assigned yet";

  return (
    <TeacherAppShell
      teacherName={teacher.full_name}
      employeeId={teacher.employee_id}
      subjectStr={teacher.subject || "Faculty Member"}
    >
      <div className="space-y-6">
        {/* Welcome Hero Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={teacher.full_name} size="lg" className="border-2 border-indigo-100 shrink-0" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                  Faculty Member
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  Emp ID: {teacher.employee_id || "N/A"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome, {teacher.full_name} 👋
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Subject: <span className="font-extrabold text-indigo-600">{teacher.subject || "General"}</span> • Assigned Classes: <span className="font-bold text-slate-900">{assignedClassesStr}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Assigned Classes
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{assignedClasses.length}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
              {assignedClassesStr}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Today&apos;s Roll Call
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              {todayAttCount > 0 ? "Recorded" : "Pending"}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {todayAttCount > 0 ? `${todayAttCount} records submitted` : "Mark class register"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Homework Posted
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{homeworkCount || 0}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Total class assignments</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Today&apos;s Periods
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{(todayTimetable || []).length}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Slots on {currentDay}</p>
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Quick Faculty Actions
              </h3>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Class management</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/teacher/attendance"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-emerald-50/60 hover:border-emerald-200 transition group min-h-[48px]"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                  Mark Attendance
                </span>
                <span className="text-[10px] text-slate-500">Class roll call</span>
              </div>
            </Link>

            <Link
              href="/teacher/homework"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-sky-50/60 hover:border-sky-200 transition group min-h-[48px]"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <ClipboardList className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-800 group-hover:text-sky-900">
                  Post Homework
                </span>
                <span className="text-[10px] text-slate-500">Create assignment</span>
              </div>
            </Link>

            <Link
              href="/teacher/marks"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-indigo-50/60 hover:border-indigo-200 transition group min-h-[48px]"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                  Enter Marks
                </span>
                <span className="text-[10px] text-slate-500">Exam evaluation</span>
              </div>
            </Link>

            <Link
              href="/teacher/timetable"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-amber-50/60 hover:border-amber-200 transition group min-h-[48px]"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <CalendarDays className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-800 group-hover:text-amber-900">
                  View Timetable
                </span>
                <span className="text-[10px] text-slate-500">Weekly schedule</span>
              </div>
            </Link>
          </div>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Homework Posted */}
            <Card>
              <CardHeader
                title="Your Posted Homework"
                subtitle="Recent assignments published to students"
                action={
                  <Link
                    href="/teacher/homework"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition min-h-[36px]"
                  >
                    Manage Homework <ChevronRight className="w-4 h-4" />
                  </Link>
                }
              />
              {recentHomework && recentHomework.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {recentHomework.map((hw: any) => {
                    const classObj = Array.isArray(hw.classes) ? hw.classes[0] : hw.classes;
                    const subjectObj = Array.isArray(hw.subjects) ? hw.subjects[0] : hw.subjects;
                    const className = classObj?.name
                      ? `${classObj.name}${classObj.division ? ` (${classObj.division})` : ""}`
                      : "Class";

                    return (
                      <div
                        key={hw.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/20 transition space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="primary">{className}</Badge>
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                              {subjectObj?.name || "Subject"}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Due:{" "}
                            {hw.due_date
                              ? new Date(hw.due_date).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{hw.title}</h4>

                        {hw.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {hw.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs font-medium space-y-2">
                  <ClipboardList className="w-8 h-8 mx-auto text-slate-300" />
                  <p>You have not posted any homework assignments yet.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-6">
            {/* Today's Timetable Schedule */}
            <Card>
              <CardHeader
                title={`Today's Schedule (${currentDay})`}
                subtitle="Your timetable slots for today"
              />
              {todayTimetable && todayTimetable.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {todayTimetable.map((tt: any) => {
                    const classObj = Array.isArray(tt.classes) ? tt.classes[0] : tt.classes;
                    const subjectObj = Array.isArray(tt.subjects) ? tt.subjects[0] : tt.subjects;
                    const className = classObj?.name
                      ? `${classObj.name}${classObj.division ? ` (${classObj.division})` : ""}`
                      : "Class";

                    return (
                      <div
                        key={tt.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <div>
                          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 block w-fit mb-0.5">
                            Period {tt.period_number}
                          </span>
                          <p className="text-xs font-bold text-slate-900">
                            {subjectObj?.name || "Subject"}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-500">{className}</p>
                        </div>
                        {tt.room_number && (
                          <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200">
                            Room {tt.room_number}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs font-medium">
                  No teaching slots scheduled for {currentDay}.
                </div>
              )}
            </Card>

            {/* Assigned Classes Summary */}
            <Card>
              <CardHeader title="Your Assigned Classes" subtitle="Class & subject allocations" />
              {assignedClasses.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {assignedClasses.map((c: any) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {c.name} {c.division ? `(${c.division})` : ""}
                        </p>
                        <p className="text-[11px] text-indigo-700 font-medium">
                          Academic Year: {c.academic_year || "2026-2027"}
                        </p>
                      </div>
                      <Badge variant="success">Assigned</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs font-medium">
                  No classes assigned to your profile yet. Contact Admin.
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </TeacherAppShell>
  );
}
