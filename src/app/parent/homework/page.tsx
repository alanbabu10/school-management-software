import { validateParentSession } from "@/lib/parentAuth";
import { createClient } from "@supabase/supabase-js";
import { ClipboardList, Clock, User, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ParentAppShell } from "@/components/parent/ParentAppShell";

export default async function ParentHomeworkPage() {
  const { student, hasMultipleChildren } = await validateParentSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const classId = student.class_id;
  const classNameStr = student.classes?.name
    ? `${student.classes.name}${student.classes.division ? ` (${student.classes.division})` : ""}`
    : "Unassigned Class";

  let homeworkList: any[] = [];
  if (classId) {
    const { data: rawHomeworks } = await supabase
      .from("homework")
      .select(`
        *,
        classes (id, name, division),
        subjects (id, name, code),
        teachers (id, full_name)
      `)
      .eq("class_id", classId)
      .order("created_at", { ascending: false });

    homeworkList = (rawHomeworks || []).map((h: any) => ({
      ...h,
      subjects: Array.isArray(h.subjects) ? h.subjects[0] || null : h.subjects || null,
      teachers: Array.isArray(h.teachers) ? h.teachers[0] || null : h.teachers || null,
    }));
  }

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
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ClipboardList className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Homework Assignments
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Class homework for <span className="font-bold text-slate-900">{student.full_name}</span> in <span className="font-extrabold text-indigo-600">{classNameStr}</span>
            </p>
          </div>

          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
            {homeworkList.length} Assignment{homeworkList.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Homework Items Grid */}
        {homeworkList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {homeworkList.map((hw) => {
              const subjectName = hw.subjects?.name || "General Subject";
              const teacherName = hw.teachers?.full_name || "Subject Teacher";
              const isDueSoon =
                hw.due_date &&
                new Date(hw.due_date).getTime() - new Date().getTime() <= 86400000 * 2;

              return (
                <div
                  key={hw.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-indigo-200 transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                        {subjectName}
                      </span>
                      <span
                        className={`text-xs font-bold flex items-center gap-1.5 ${
                          isDueSoon ? "text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100" : "text-slate-500"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Due:{" "}
                        {hw.due_date
                          ? new Date(hw.due_date).toLocaleDateString("en-IN", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })
                          : "No due date"}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                      {hw.title}
                    </h3>

                    {hw.description ? (
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                        {hw.description}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No additional instructions provided.</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{teacherName}</span>
                    </div>

                    {hw.attachment_url && (
                      <a
                        href={hw.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition min-h-[44px]"
                      >
                        <Paperclip className="w-4 h-4" />
                        Attachment
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Active Homework</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              There are currently no active homework assignments for {classNameStr}. Check back later for updates from subject teachers.
            </p>
          </div>
        )}
      </div>
    </ParentAppShell>
  );
}
