import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export interface ParentAuthResult {
  parentPhone: string;
  phoneDigits: string;
  selectedChildId: string;
  hasMultipleChildren: boolean;
  student: {
    id: string;
    admission_number: string;
    full_name: string;
    date_of_birth?: string | null;
    gender?: string | null;
    class_id?: string | null;
    parent_name?: string | null;
    parent_phone?: string | null;
    status: string;
    classes?: {
      id: string;
      name: string;
      division?: string | null;
    } | null;
  };
}

export async function validateParentSession(): Promise<ParentAuthResult> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("parent_session")?.value;
  const selectedChildId = cookieStore.get("selected_child_id")?.value;

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

  if (!selectedChildId) {
    redirect("/parent/select-child");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch all children belonging to this parent phone
  let childrenQuery = supabase.from("students").select("id");
  if (phoneDigits) {
    childrenQuery = childrenQuery.or(`parent_phone.eq.${parentPhone},parent_phone.ilike.%${phoneDigits}`);
  } else {
    childrenQuery = childrenQuery.eq("parent_phone", parentPhone);
  }

  const { data: allChildren } = await childrenQuery;
  const childrenIds = (allChildren || []).map((c) => String(c.id));

  // Security Check: Verify selectedChildId actually belongs to this parent's phone!
  if (!childrenIds.includes(String(selectedChildId))) {
    console.warn(`SECURITY ALERT: Parent phone ${parentPhone} attempted to access unauthorized childId ${selectedChildId}`);
    redirect("/parent/select-child");
  }

  // 2. Fetch full student details for the validated selected child
  const { data: rawStudent, error } = await supabase
    .from("students")
    .select(`
      id,
      admission_number,
      full_name,
      date_of_birth,
      gender,
      class_id,
      parent_name,
      parent_phone,
      status,
      classes (
        id,
        name,
        division
      )
    `)
    .eq("id", selectedChildId)
    .single();

  if (error || !rawStudent) {
    redirect("/parent/select-child");
  }

  let classObj = Array.isArray(rawStudent.classes)
    ? rawStudent.classes[0] || null
    : rawStudent.classes || null;

  // Fallback: If class_id exists on student but classes join returned null, query classes directly
  if (!classObj && rawStudent.class_id) {
    const { data: directClass } = await supabase
      .from("classes")
      .select("id, name, division")
      .eq("id", rawStudent.class_id)
      .single();

    if (directClass) {
      classObj = directClass;
    }
  }

  return {
    parentPhone,
    phoneDigits,
    selectedChildId,
    hasMultipleChildren: childrenIds.length > 1,
    student: {
      ...rawStudent,
      classes: classObj,
    },
  };
}
