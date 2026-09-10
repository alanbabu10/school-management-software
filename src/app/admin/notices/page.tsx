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

  return <NoticesClient />;
}
