import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LeaveClient from "./leave-client";

export default async function AdminLeaveRequestsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <LeaveClient />;
}
