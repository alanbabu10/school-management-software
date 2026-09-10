import { createClient } from "@/lib/supabase/client";
import { SubjectItem, ClassSubjectAssignment } from "@/types/subject";

export const subjectService = {
  async fetchSubjects(): Promise<SubjectItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createSubject(payload: Omit<SubjectItem, "id">): Promise<SubjectItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("subjects")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSubject(id: string, payload: Partial<SubjectItem>): Promise<SubjectItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("subjects")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSubject(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) throw error;
  },

  async fetchClassAssignments(): Promise<ClassSubjectAssignment[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from("class_subjects").select(`
      *,
      subjects(id, name, code),
      teachers(id, full_name, employee_id)
    `);

    if (error) return [];
    return data || [];
  },

  async assignSubjectToClass(classId: string | number, subjectId: string, teacherId?: string): Promise<ClassSubjectAssignment> {
    const supabase = createClient();
    const classIdPayload = isNaN(Number(classId)) ? classId : Number(classId);

    const { data, error } = await supabase
      .from("class_subjects")
      .insert([
        {
          class_id: classIdPayload,
          subject_id: subjectId,
          teacher_id: teacherId || null,
        },
      ])
      .select(`
        *,
        subjects(id, name, code),
        teachers(id, full_name, employee_id)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async removeAssignment(assignmentId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("class_subjects")
      .delete()
      .eq("id", assignmentId);

    if (error) throw error;
  },
};
