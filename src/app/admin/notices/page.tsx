import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NoticesClient from "./notices-client";

export default async function AdminNoticesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch initial notices with class relation
  const { data: rawNotices } = await supabase
    .from("notices")
    .select(`
      *,
      classes (
        id,
        name,
        division
      )
    `)
    .order("created_at", { ascending: false });

  const initialNotices = (rawNotices || []).map((n: any) => ({
    ...n,
    classes: Array.isArray(n.classes) ? n.classes[0] || null : n.classes || null,
  }));

  // Fetch classes list for target class dropdown
  const { data: classesData } = await supabase
    .from("classes")
    .select("id, name, division")
    .order("name", { ascending: true });

  return (
    <NoticesClient
      initialNotices={initialNotices}
      classesList={classesData || []}
      currentUserId={user.id}
    />
  );
}
