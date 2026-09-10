import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TimetableClient from "./timetable-client";

export default async function AdminTimetablePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: classesData } = await supabase
    .from("classes")
    .select("id, name")
    .order("name", { ascending: true });

  return <TimetableClient classesList={classesData || []} />;
}
