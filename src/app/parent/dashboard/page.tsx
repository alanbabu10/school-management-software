import { validateParentSession } from "@/lib/parentAuth";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
  ClipboardList,
  CalendarDays,
  CreditCard,
  Megaphone,
  CalendarCheck,
  FileText,
  ChevronRight,
  Sparkles,
  ArrowRightLeft,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  UserCheck,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ParentAppShell } from "@/components/parent/ParentAppShell";

export default async function ParentDashboardPage() {
  const { student, hasMultipleChildren } = await validateParentSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const classId = student.class_id;
  const classNameStr = student.classes?.name
    ? `${student.classes.name}${student.classes.division ? ` (${student.classes.division})` : ""}`
    : "Unassigned Class";

  // 1. Fetch Homework for Child's Class
  let homeworkCount = 0;
  let recentHomework: any[] = [];
  if (classId) {
    const { data: hwData } = await supabase
      .from("homework")
      .select(`
        *,
        subjects (id, name, code),
        teachers (id, full_name)
      `)
      .eq("class_id", classId)
      .order("due_date", { ascending: true })
      .order("created_at", { ascending: false });

    homeworkCount = (hwData || []).length;
    recentHomework = (hwData || []).slice(0, 3);
  }

  // 2. Fetch Timetable for Child's Class
  let todayTimetable: any[] = [];
  if (classId) {
    const { data: ttData } = await supabase
      .from("timetable")
      .select(`
        *,
        subjects (id, name, code),
        teachers (id, full_name)
      `)
      .eq("class_id", classId)
      .order("period_number", { ascending: true });

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = days[new Date().getDay()];
    todayTimetable = (ttData || []).filter((t: any) =>
      t.day_of_week?.toLowerCase() === currentDay.toLowerCase()
    );
  }

  // 3. Fetch Fee Records for this student only
  const { data: feeRecords } = await supabase
    .from("fees")
    .select("*")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false });

  const totalFeeAmount = (feeRecords || []).reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalPaidAmount = (feeRecords || []).reduce((sum, f) => sum + (Number(f.paid_amount) || 0), 0);
  const balanceDue = totalFeeAmount - totalPaidAmount;
  const pendingFeeCount = (feeRecords || []).filter((f) => f.status !== "paid").length;

  // 4. Fetch Attendance Records for this student only
  const { data: attRecords } = await supabase
    .from("attendance")
    .select("status")
    .eq("student_id", student.id);

  const totalDaysMarked = (attRecords || []).length;
  const presentDays = (attRecords || []).filter((a) => a.status === "present").length;
  const attendanceRate = totalDaysMarked > 0 ? Math.round((presentDays / totalDaysMarked) * 100) : 0;

  // 5. Fetch Marks for this student only
  const { data: marksRecords } = await supabase
    .from("marks")
    .select(`
      *,
      exams (id, name, academic_year),
      subjects (id, name, code)
    `)
    .eq("student_id", student.id)
    .order("created_at", { ascending: false });

  const examCount = (marksRecords || []).length;

  // 6. Fetch School Notices
  let noticeQuery = supabase.from("notices").select("*");
  if (classId) {
    noticeQuery = noticeQuery.or(`class_id.eq.${classId},class_id.is.null`);
  } else {
    noticeQuery = noticeQuery.is("class_id", null);
  }
  const { data: noticesData } = await noticeQuery
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <ParentAppShell
      childName={student.full_name}
      classNameStr={classNameStr}
      hasMultipleChildren={hasMultipleChildren}
    >
      <div className="space-y-6">
        {/* Crisp Light Hero Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={student.full_name} size="lg" className="border-2 border-indigo-100 shrink-0" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                  Active Student
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  Adm #: {student.admission_number || "N/A"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome, Parent of {student.full_name} 👋
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Enrolled in <span className="font-extrabold text-indigo-600">{classNameStr}</span> • St MARY&apos;s L P School Pallippuram
              </p>
            </div>
          </div>

          {hasMultipleChildren && (
            <Link
              href="/parent/select-child"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs transition shrink-0 min-h-[44px]"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Switch Child Profile
            </Link>
          )}
        </div>

        {/* 6 Primary Metric Cards Grid (2 cols mobile, 3 tablet, 6 desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Attendance Card */}
          <Link
            href="/parent/attendance"
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-300 hover:shadow-md transition group flex flex-col justify-between min-h-[110px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Attendance
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {totalDaysMarked > 0 ? `${attendanceRate}%` : "0%"}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {presentDays} / {totalDaysMarked} Days Present
              </p>
            </div>
          </Link>

          {/* Homework Card */}
          <Link
            href="/parent/homework"
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-indigo-300 hover:shadow-md transition group flex flex-col justify-between min-h-[110px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Homework
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{homeworkCount}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Active assignment(s)</p>
            </div>
          </Link>

          {/* Timetable Card */}
          <Link
            href="/parent/timetable"
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-sky-300 hover:shadow-md transition group flex flex-col justify-between min-h-[110px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Timetable
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {todayTimetable.length > 0 ? `${todayTimetable.length} Periods` : "Grid"}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Weekly class schedule</p>
            </div>
          </Link>

          {/* Fees Card */}
          <Link
            href="/parent/fees"
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-rose-300 hover:shadow-md transition group flex flex-col justify-between min-h-[110px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Fees Due
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                ₹{balanceDue.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {pendingFeeCount > 0 ? `${pendingFeeCount} pending` : "All fees clear!"}
              </p>
            </div>
          </Link>

          {/* Marks Card */}
          <Link
            href="/parent/marks"
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-violet-300 hover:shadow-md transition group flex flex-col justify-between min-h-[110px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Marks
              </span>
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{examCount}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Published exam marks</p>
            </div>
          </Link>

          {/* Notices Card */}
          <Link
            href="/parent/notices"
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-amber-300 hover:shadow-md transition group flex flex-col justify-between min-h-[110px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Notices
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Megaphone className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{(noticesData || []).length}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Official circulars</p>
            </div>
          </Link>
        </div>

        {/* 2-Column Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Homework Card */}
            <Card>
              <CardHeader
                title="Active Homework Assignments"
                subtitle={`Current class assignments for ${classNameStr}`}
                action={
                  <Link
                    href="/parent/homework"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition min-h-[36px]"
                  >
                    View Homework <ChevronRight className="w-4 h-4" />
                  </Link>
                }
              />
              {recentHomework.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {recentHomework.map((hw: any) => {
                    const subjectObj = Array.isArray(hw.subjects) ? hw.subjects[0] : hw.subjects;

                    return (
                      <div
                        key={hw.id}
                        className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/20 transition space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                            {subjectObj?.name || "General Subject"}
                          </span>
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
                  <p>No active homework assignments found for {classNameStr}.</p>
                </div>
              )}
            </Card>

            {/* Fee Status Overview Card */}
            <Card>
              <CardHeader
                title="Fee Payment Statements"
                subtitle="Financial records for tuition & school fees"
                action={
                  <Link
                    href="/parent/fees"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition min-h-[36px]"
                  >
                    View Statement <ChevronRight className="w-4 h-4" />
                  </Link>
                }
              />
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 mb-2 text-center">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Billed
                  </span>
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                    ₹{totalFeeAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Paid
                  </span>
                  <p className="text-base sm:text-lg font-extrabold text-emerald-800 mt-0.5">
                    ₹{totalPaidAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                    Balance
                  </span>
                  <p className="text-base sm:text-lg font-extrabold text-rose-800 mt-0.5">
                    ₹{balanceDue.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-6">
            {/* Student Profile Quick Info */}
            <Card>
              <CardHeader title="Student Profile" subtitle="Official registered record" />
              <div className="space-y-3 pt-1 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Student Name:</span>
                  <span className="font-bold text-slate-900">{student.full_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Admission No:</span>
                  <span className="font-bold text-slate-900">{student.admission_number || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Assigned Class:</span>
                  <span className="font-bold text-indigo-700">{classNameStr}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Attendance Rate:</span>
                  <span className="font-bold text-emerald-700">{attendanceRate}%</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">Parent Phone:</span>
                  <span className="font-bold text-slate-900">{student.parent_phone || "N/A"}</span>
                </div>
              </div>
            </Card>

            {/* School Circulars Card */}
            <Card>
              <CardHeader
                title="School Circulars"
                subtitle="Official announcements"
                action={
                  <Link
                    href="/parent/notices"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    All Notices <ChevronRight className="w-4 h-4" />
                  </Link>
                }
              />
              {(noticesData || []).length > 0 ? (
                <div className="space-y-3 pt-1">
                  {(noticesData || []).map((n: any) => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-amber-50/30 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                          {n.target_role || "All School"}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {n.published_at
                            ? n.published_at.split("T")[0]
                            : n.created_at
                            ? n.created_at.split("T")[0]
                            : "Today"}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{n.title}</h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {n.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs font-medium">
                  No announcements published yet.
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </ParentAppShell>
  );
}
