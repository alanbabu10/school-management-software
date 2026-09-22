import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Users,
  CalendarCheck,
  Megaphone,
  ChevronRight,
  CalendarOff,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCardGrid } from "@/components/dashboard/StatCardGrid";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Core Counts
  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });

  const { count: teacherCount } = await supabase
    .from("teachers")
    .select("*", { count: "exact", head: true });

  const { count: classCount } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true });

  // 2. Fetch Fee Metrics
  const { data: feeData } = await supabase
    .from("fees")
    .select("amount, paid_amount, status");

  const pendingFeeRecords = (feeData || []).filter((f) => f.status !== "paid");
  const pendingFeeAmount = pendingFeeRecords.reduce(
    (sum, f) => sum + (Number(f.amount) - Number(f.paid_amount || 0)),
    0
  );
  const pendingFeeCount = pendingFeeRecords.length;

  // 3. Fetch Today's Attendance Overview
  const todayStr = new Date().toISOString().split("T")[0];
  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("status")
    .eq("attendance_date", todayStr);

  const todayPresentCount = (todayAttendance || []).filter((a) => a.status === "present").length;
  const todayAbsentCount = (todayAttendance || []).filter((a) => a.status === "absent").length;
  const todayLateCount = (todayAttendance || []).filter((a) => a.status === "late").length;
  const todayLeaveCount = (todayAttendance || []).filter((a) => a.status === "leave").length;
  const todayTotalMarked = (todayAttendance || []).length;

  const attendanceRate =
    todayTotalMarked > 0
      ? Math.round((todayPresentCount / todayTotalMarked) * 100)
      : 0;

  // 4. Fetch Pending Leave Requests Count
  const { count: pendingLeaveCount } = await supabase
    .from("leave_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // 5. Fetch Recent 5 Students
  const { data: recentStudents } = await supabase
    .from("students")
    .select(`
      id,
      admission_number,
      full_name,
      status,
      created_at,
      classes (
        name,
        division
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  // 6. Fetch Recent 5 Notices
  const { data: recentNotices } = await supabase
    .from("notices")
    .select(`
      id,
      title,
      content,
      target_role,
      published_at,
      created_at,
      classes (
        name,
        division
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  const getRoleBadge = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "teacher":
        return <Badge variant="success" size="sm">Teachers</Badge>;
      case "parent":
        return <Badge variant="warning" size="sm">Parents</Badge>;
      case "student":
        return <Badge variant="danger" size="sm">Students</Badge>;
      default:
        return <Badge variant="primary" size="sm">All School</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Banner */}
      <DashboardHeader />

      {/* Primary Key Metrics Grid (Spacious 4-Card Layout) */}
      <StatCardGrid
        studentCount={studentCount ?? 0}
        teacherCount={teacherCount ?? 0}
        classCount={classCount ?? 0}
        pendingFeeAmount={pendingFeeAmount}
        pendingFeeCount={pendingFeeCount}
      />

      {/* Quick Actions Bar - Un-congested, Spacious & Direct */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Quick Administrative Actions
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-400">Frequently used shortcuts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/students"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-indigo-50/60 hover:border-indigo-200/80 transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <UserPlus className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                Add Student
              </span>
              <span className="text-[10px] text-slate-500">Register new pupil</span>
            </div>
          </Link>

          <Link
            href="/admin/teachers"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-emerald-50/60 hover:border-emerald-200/80 transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                Add Teacher
              </span>
              <span className="text-[10px] text-slate-500">Add faculty member</span>
            </div>
          </Link>

          <Link
            href="/admin/attendance"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-sky-50/60 hover:border-sky-200/80 transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800 group-hover:text-sky-900">
                Mark Attendance
              </span>
              <span className="text-[10px] text-slate-500">Daily class register</span>
            </div>
          </Link>

          <Link
            href="/admin/notices"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-amber-50/60 hover:border-amber-200/80 transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Megaphone className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800 group-hover:text-amber-900">
                Add Notice
              </span>
              <span className="text-[10px] text-slate-500">Publish circular</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Operational Section - 2 Column Clean Layout */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left / Main Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Attendance Overview */}
          <Card>
            <CardHeader
              title="Today's Attendance Overview"
              subtitle={`Daily attendance record for ${new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}`}
              action={
                <Link
                  href="/admin/attendance"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                >
                  Mark Attendance <ChevronRight className="w-4 h-4" />
                </Link>
              }
            />

            {todayTotalMarked > 0 ? (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-emerald-50/90 border border-emerald-200/70 rounded-2xl p-4 text-center">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Present Rate
                    </span>
                    <p className="text-3xl font-extrabold text-emerald-900 mt-1">{attendanceRate}%</p>
                    <p className="text-xs text-emerald-700 font-semibold mt-1">
                      {todayPresentCount} Students
                    </p>
                  </div>

                  <div className="bg-rose-50/90 border border-rose-200/70 rounded-2xl p-4 text-center">
                    <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                      Absent
                    </span>
                    <p className="text-3xl font-extrabold text-rose-900 mt-1">{todayAbsentCount}</p>
                    <p className="text-xs text-rose-700 font-semibold mt-1">Students</p>
                  </div>

                  <div className="bg-amber-50/90 border border-amber-200/70 rounded-2xl p-4 text-center">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                      Late Arrival
                    </span>
                    <p className="text-3xl font-extrabold text-amber-900 mt-1">{todayLateCount}</p>
                    <p className="text-xs text-amber-700 font-semibold mt-1">Students</p>
                  </div>

                  <div className="bg-sky-50/90 border border-sky-200/70 rounded-2xl p-4 text-center">
                    <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
                      On Leave
                    </span>
                    <p className="text-3xl font-extrabold text-sky-900 mt-1">{todayLeaveCount}</p>
                    <p className="text-xs text-sky-700 font-semibold mt-1">Approved</p>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="bg-slate-100 rounded-full h-3 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${attendanceRate}%` }}
                    title={`Present: ${attendanceRate}%`}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{
                      width: `${Math.round((todayAbsentCount / todayTotalMarked) * 100)}%`,
                    }}
                    title={`Absent: ${todayAbsentCount}`}
                  />
                  <div
                    className="bg-amber-400 h-full transition-all duration-500"
                    style={{
                      width: `${Math.round((todayLateCount / todayTotalMarked) * 100)}%`,
                    }}
                    title={`Late: ${todayLateCount}`}
                  />
                </div>
              </div>
            ) : (
              <div className="py-8 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Today&apos;s Attendance Not Recorded Yet
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                    Select a class division and mark present/absent statuses for today&apos;s roll call.
                  </p>
                </div>
                <Link
                  href="/admin/attendance"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs transition"
                >
                  Take Today&apos;s Attendance <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </Card>

          {/* Recent Enrolled Students */}
          <Card>
            <CardHeader
              title="Recent Enrolments"
              subtitle="Newly registered student profiles"
              action={
                <Link
                  href="/admin/students"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  View All Students <ChevronRight className="w-4 h-4" />
                </Link>
              }
            />

            {recentStudents && recentStudents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentStudents.map((s) => {
                  const classObj = Array.isArray(s.classes) ? s.classes[0] : s.classes;
                  const classNameStr = classObj?.name
                    ? `${classObj.name}${classObj.division ? ` (${classObj.division})` : ""}`
                    : null;

                  return (
                    <div key={s.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={s.full_name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {s.full_name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Adm #: {s.admission_number || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {classNameStr && <Badge variant="primary">{classNameStr}</Badge>}
                        <Badge variant={s.status === "active" ? "success" : "neutral"}>
                          {s.status || "active"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                No recent student records found.
              </div>
            )}
          </Card>
        </div>

        {/* Right / Sidebar Area (1/3 width) */}
        <div className="space-y-8">
          {/* Pending Leave Requests Widget */}
          <Card>
            <CardHeader
              title="Pending Requests"
              subtitle="Requires administrative action"
            />
            <div className="pt-1">
              <Link
                href="/admin/leave-requests"
                className="flex items-center justify-between p-4 rounded-2xl border border-violet-100 bg-violet-50/50 hover:bg-violet-100/60 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
                    <CalendarOff className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-violet-950">Leave Applications</p>
                    <p className="text-[11px] text-violet-700 font-medium">
                      {pendingLeaveCount ?? 0} application{(pendingLeaveCount ?? 0) === 1 ? "" : "s"} pending
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-violet-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </Card>

          {/* School Announcements & Circulars */}
          <Card>
            <CardHeader
              title="Official Notice Board"
              subtitle="Latest published announcements"
              action={
                <Link
                  href="/admin/notices"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  All Notices <ChevronRight className="w-4 h-4" />
                </Link>
              }
            />

            {recentNotices && recentNotices.length > 0 ? (
              <div className="space-y-3 pt-1">
                {recentNotices.map((n) => {
                  const dateStr = n.published_at
                    ? n.published_at.split("T")[0]
                    : n.created_at
                    ? n.created_at.split("T")[0]
                    : "Today";

                  return (
                    <div
                      key={n.id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-200 transition space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        {getRoleBadge(n.target_role)}
                        <span className="text-[10px] font-semibold text-slate-400">
                          {dateStr}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                        {n.title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {n.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                No official notices published yet.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}