import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CalendarCheck,
  Megaphone,
  TrendingUp,
  Clock,
  ChevronRight,
  FileText,
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

  // Fetch real counts from Supabase
  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });

  const { count: teacherCount } = await supabase
    .from("teachers")
    .select("*", { count: "exact", head: true });

  const { count: classCount } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true });

  const { count: subjectCount } = await supabase
    .from("subjects")
    .select("*", { count: "exact", head: true });

  // Fetch recent students
  const { data: recentStudents } = await supabase
    .from("students")
    .select("id, admission_number, full_name, status, created_at, classes(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <DashboardHeader />

      {/* Stat Cards Grid */}
      <StatCardGrid
        studentCount={studentCount ?? 0}
        teacherCount={teacherCount ?? 0}
        classCount={classCount ?? 0}
        subjectCount={subjectCount ?? 0}
      />

      {/* Quick Action Grid & Attendance Summary */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Attendance Summary Widget */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Today's Attendance Overview"
            subtitle="Real-time daily attendance breakdown"
            action={
              <Link
                href="/admin/attendance"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Take Attendance <ChevronRight className="w-4 h-4" />
              </Link>
            }
          />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 text-center">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Present</span>
              <p className="text-2xl font-bold text-emerald-900 mt-1">94%</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">141 Students</p>
            </div>
            <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-4 text-center">
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Absent</span>
              <p className="text-2xl font-bold text-rose-900 mt-1">4%</p>
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">6 Students</p>
            </div>
            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4 text-center">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Late</span>
              <p className="text-2xl font-bold text-amber-900 mt-1">2%</p>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5">3 Students</p>
            </div>
          </div>
        </Card>

        {/* Quick Shortcuts */}
        <Card>
          <CardHeader title="Quick Shortcuts" subtitle="Fast administrative operations" />
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Link
              href="/admin/attendance"
              className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition text-center group"
            >
              <CalendarCheck className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform mb-1.5" />
              <span className="text-xs font-semibold text-slate-800">Mark Attendance</span>
            </Link>
            <Link
              href="/admin/notices"
              className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition text-center group"
            >
              <Megaphone className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform mb-1.5" />
              <span className="text-xs font-semibold text-slate-800">Post Notice</span>
            </Link>
            <Link
              href="/admin/exams"
              className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition text-center group"
            >
              <FileText className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform mb-1.5" />
              <span className="text-xs font-semibold text-slate-800">Schedule Exam</span>
            </Link>
            <Link
              href="/admin/fees"
              className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition text-center group"
            >
              <TrendingUp className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform mb-1.5" />
              <span className="text-xs font-semibold text-slate-800">Fee Status</span>
            </Link>
          </div>
        </Card>
      </div>

      {/* Two-Column Section: Recent Students & Recent Notices */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Students Card */}
        <Card>
          <CardHeader
            title="Recent Students"
            subtitle="Newly registered students in the system"
            action={
              <Link
                href="/admin/students"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            }
          />
          {recentStudents && recentStudents.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentStudents.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.full_name} size="sm" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{s.full_name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Adm No: {s.admission_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const classNameStr = Array.isArray(s.classes) ? s.classes[0]?.name : (s.classes as any)?.name;
                      return classNameStr ? <Badge variant="primary">{classNameStr}</Badge> : null;
                    })()}
                    <Badge variant={s.status === "active" ? "success" : "neutral"}>
                      {s.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">
              No recent student records found.
            </div>
          )}
        </Card>

        {/* Notices & Announcements Widget */}
        <Card>
          <CardHeader
            title="School Announcements"
            subtitle="Important circulars & upcoming events"
            action={
              <Link
                href="/admin/notices"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                All Notices <ChevronRight className="w-4 h-4" />
              </Link>
            }
          />
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Mid-Term Exams Schedule</span>
                  <span className="text-[10px] font-medium text-slate-400">Today</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  The official schedule for Mid-Term examinations has been published.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Parent-Teacher Meeting</span>
                  <span className="text-[10px] font-medium text-slate-400">Yesterday</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  Annual PTM for Grade 9 to 12 scheduled for coming Friday.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}