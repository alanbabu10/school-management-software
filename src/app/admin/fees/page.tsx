import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FeesClient from "./fees-client";

export default async function AdminFeesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <FeesClient />;
}
