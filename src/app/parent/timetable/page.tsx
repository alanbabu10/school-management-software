import { validateParentSession } from "@/lib/parentAuth";
import { createClient } from "@supabase/supabase-js";
import { CalendarDays, MapPin } from "lucide-react";
import { ParentAppShell } from "@/components/parent/ParentAppShell";

export default async function ParentTimetablePage() {
  const { student, hasMultipleChildren } = await validateParentSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const classId = student.class_id;
  const classNameStr = student.classes?.name
    ? `${student.classes.name}${student.classes.division ? ` (${student.classes.division})` : ""}`
    : "Unassigned Class";

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const maxPeriods = 8;
  const periods = Array.from({ length: maxPeriods }, (_, i) => i + 1);

  let timetableEntries: any[] = [];
  if (classId) {
    const { data: rawEntries } = await supabase
      .from("timetable")
      .select(`
        *,
        subjects (id, name, code),
        teachers (id, full_name)
      `)
      .eq("class_id", classId);

    timetableEntries = (rawEntries || []).map((t: any) => ({
      ...t,
      subjects: Array.isArray(t.subjects) ? t.subjects[0] || null : t.subjects || null,
      teachers: Array.isArray(t.teachers) ? t.teachers[0] || null : t.teachers || null,
    }));
  }

  // Lookup helper for period + day
  const getSlotEntry = (periodNum: number, day: string) => {
    return timetableEntries.find(
      (t) =>
        t.period_number === periodNum &&
        t.day_of_week?.toLowerCase() === day.toLowerCase()
    );
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
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <CalendarDays className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Weekly Class Timetable
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Class schedule for <span className="font-bold text-slate-900">{student.full_name}</span> in <span className="font-extrabold text-indigo-600">{classNameStr}</span>
            </p>
          </div>

          <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-100 px-3 py-1.5 rounded-xl">
            Read-Only Timetable
          </span>
        </div>

        {/* Timetable Grid View */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3.5 px-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-center w-24">
                    Period
                  </th>
                  {daysOfWeek.map((day) => {
                    const isToday =
                      new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() ===
                      day.toLowerCase();

                    return (
                      <th
                        key={day}
                        className={`py-3.5 px-4 text-xs font-extrabold text-center ${
                          isToday ? "bg-indigo-600 text-white" : "text-slate-800"
                        }`}
                      >
                        {day}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {periods.map((pNum) => (
                  <tr key={pNum} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-3 text-center bg-slate-50/60 border-r border-slate-100">
                      <span className="block text-xs font-extrabold text-slate-900">
                        Period {pNum}
                      </span>
                    </td>

                    {daysOfWeek.map((day) => {
                      const entry = getSlotEntry(pNum, day);
                      const subjectName = entry?.subjects?.name;
                      const teacherName = entry?.teachers?.full_name;

                      return (
                        <td
                          key={day}
                          className="py-3 px-3 border-r border-slate-100 text-center align-middle"
                        >
                          {entry ? (
                            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-2.5 space-y-1">
                              <span className="block text-xs font-extrabold text-indigo-900 leading-tight">
                                {subjectName || "Subject"}
                              </span>
                              {teacherName && (
                                <span className="block text-[11px] font-semibold text-indigo-700">
                                  {teacherName}
                                </span>
                              )}
                              {entry.room_number && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 mt-1">
                                  <MapPin className="w-3 h-3 text-slate-400" /> Room {entry.room_number}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-300 font-medium italic">
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ParentAppShell>
  );
}
