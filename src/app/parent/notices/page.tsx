import { validateParentSession } from "@/lib/parentAuth";
import { createClient } from "@supabase/supabase-js";
import { Megaphone, Paperclip, Calendar, Bell } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParentAppShell } from "@/components/parent/ParentAppShell";

export default async function ParentNoticesPage() {
  const { student, hasMultipleChildren } = await validateParentSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const classId = student.class_id;
  const classNameStr = student.classes?.name
    ? `${student.classes.name}${student.classes.division ? ` (${student.classes.division})` : ""}`
    : "Unassigned Class";

  let query = supabase.from("notices").select("*");
  if (classId) {
    query = query.or(`class_id.eq.${classId},class_id.is.null`);
  } else {
    query = query.is("class_id", null);
  }

  const { data: noticesData } = await query.order("created_at", { ascending: false });
  const noticesList = noticesData || [];

  const getRoleBadge = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "teacher":
        return <Badge variant="success">Faculty Notice</Badge>;
      case "parent":
        return <Badge variant="warning">Parent Circular</Badge>;
      case "student":
        return <Badge variant="danger">Student Notice</Badge>;
      default:
        return <Badge variant="primary">School-Wide</Badge>;
    }
  };

  return (
    <ParentAppShell
      childName={student.full_name}
      classNameStr={classNameStr}
      hasMultipleChildren={hasMultipleChildren}
    >
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Notices & Announcements
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Official circulars and announcements for parents of <span className="font-bold text-slate-800">{classNameStr}</span>
            </p>
          </div>

          <Badge variant="primary" size="md">
            {noticesList.length} Circular{noticesList.length === 1 ? "" : "s"}
          </Badge>
        </div>

        {/* Notices List */}
        {noticesList.length > 0 ? (
          <div className="space-y-4">
            {noticesList.map((notice) => {
              const dateStr = notice.published_at
                ? new Date(notice.published_at).toLocaleDateString("en-IN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : notice.created_at
                ? new Date(notice.created_at).toLocaleDateString("en-IN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Today";

              return (
                <div
                  key={notice.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md hover:border-indigo-200 transition space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getRoleBadge(notice.target_role)}
                    </div>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {dateStr}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{notice.title}</h3>

                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {notice.content}
                  </p>

                  {notice.attachment_url && (
                    <div className="pt-2 flex justify-end">
                      <a
                        href={notice.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        Download Official Attachment
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Notices Published</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no official circulars or notices for {classNameStr}. Check back later for school announcements.
            </p>
          </div>
        )}
      </div>
    </ParentAppShell>
  );
}
