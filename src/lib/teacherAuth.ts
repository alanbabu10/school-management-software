import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface TeacherSession {
  user: any;
  teacher: any;
  assignedClasses: any[];
  assignedClassSubjects: any[];
  assignedClassIds: string[];
  assignedSubjectIds: string[];
}

export async function validateTeacherSession(): Promise<TeacherSession> {
  const supabase = await createClient();
  const cookieStore = await cookies();

  let activeTeacherId: string | null = null;
  let activeUser: any = null;

  // 1. Check teacher_session cookie first if present
  const sessionCookie = cookieStore.get("teacher_session");
  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(sessionCookie.value);
      if (parsed?.authenticated && parsed?.teacher_id) {
        activeTeacherId = parsed.teacher_id;
        activeUser = { id: parsed.teacher_id, email: parsed.teacher_email || "teacher@school.com" };
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  // 2. If no cookie session, check Supabase Auth user
  if (!activeTeacherId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      activeUser = user;
      activeTeacherId = user.id;

      // Check profiles role if available
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "teacher" && profile?.role !== "admin") {
        redirect("/login");
      }
    }
  }

  if (!activeTeacherId) {
    redirect("/login");
  }

  // 3. Fetch Teacher Record
  const { data: teacher } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", activeTeacherId)
    .single();

  const teacherRecord = teacher || {
    id: activeTeacherId,
    employee_id: "T-AUTH",
    full_name: activeUser?.email || "Faculty Member",
    phone: null,
    subject: "General Subjects",
    status: "active",
  };

  // 4. Fetch Classes where this teacher is Class Teacher
  const { data: classTeacherClasses } = await supabase
    .from("classes")
    .select("id, name, division, academic_year, class_teacher_id")
    .eq("class_teacher_id", teacherRecord.id);

  // 5. Fetch Class Subjects assigned to this teacher
  const { data: rawClassSubjects } = await supabase
    .from("class_subjects")
    .select(`
      id,
      class_id,
      subject_id,
      teacher_id,
      classes (id, name, division),
      subjects (id, name, code)
    `)
    .eq("teacher_id", teacherRecord.id);

  const assignedClassSubjects = (rawClassSubjects || []).map((cs: any) => ({
    ...cs,
    classes: Array.isArray(cs.classes) ? cs.classes[0] || null : cs.classes || null,
    subjects: Array.isArray(cs.subjects) ? cs.subjects[0] || null : cs.subjects || null,
  }));

  // Consolidate unique assigned class objects
  const classMap: Record<string, any> = {};

  (classTeacherClasses || []).forEach((c: any) => {
    classMap[c.id] = c;
  });

  assignedClassSubjects.forEach((cs: any) => {
    if (cs.classes?.id && !classMap[cs.classes.id]) {
      classMap[cs.classes.id] = cs.classes;
    }
  });

  const assignedClasses = Object.values(classMap);
  const assignedClassIds = assignedClasses.map((c) => c.id);
  const assignedSubjectIds = Array.from(
    new Set(assignedClassSubjects.map((cs) => cs.subject_id).filter(Boolean))
  );

  return {
    user: activeUser,
    teacher: teacherRecord,
    assignedClasses,
    assignedClassSubjects,
    assignedClassIds,
    assignedSubjectIds,
  };
}
