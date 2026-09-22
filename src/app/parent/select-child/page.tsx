import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import SelectChildClient from "./select-child-client";

export default async function SelectChildPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("parent_session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  let parentPhone = "";
  let phoneDigits = "";
  try {
    const session = JSON.parse(sessionCookie);
    parentPhone = session.parent_phone;
    phoneDigits = session.parent_phone_digits || parentPhone.replace(/\D/g, "").slice(-10);
  } catch {
    redirect("/login");
  }

  if (!parentPhone && !phoneDigits) {
    redirect("/login");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let query = supabase
    .from("students")
    .select(`
      id,
      admission_number,
      full_name,
      date_of_birth,
      status,
      classes (
        name,
        division
      )
    `);

  if (phoneDigits) {
    query = query.or(`parent_phone.eq.${parentPhone},parent_phone.ilike.%${phoneDigits}`);
  } else {
    query = query.eq("parent_phone", parentPhone);
  }

  const { data: students, error } = await query.order("created_at", { ascending: false });

  if (error || !students || students.length === 0) {
    redirect("/login");
  }

  const childrenList = students.map((s) => {
    const classObj = Array.isArray(s.classes) ? s.classes[0] : s.classes;
    const classNameStr = classObj?.name
      ? `${classObj.name}${classObj.division ? ` (${classObj.division})` : ""}`
      : "Unassigned Class";

    return {
      id: s.id,
      full_name: s.full_name,
      admission_number: s.admission_number,
      date_of_birth: s.date_of_birth,
      status: s.status || "active",
      classNameStr,
    };
  });

  return <SelectChildClient childrenList={childrenList} parentPhone={parentPhone} />;
}
