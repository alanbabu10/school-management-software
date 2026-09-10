import { createClient } from "@/lib/supabase/client";
import { ClassItem } from "@/types/class";

export const classService = {
  async fetchClasses(): Promise<ClassItem[]> {
    const supabase = createClient();
    const { data: rawClasses } = await supabase
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!rawClasses || rawClasses.length === 0) return [];

    const teacherIds = rawClasses
      .map((c) => c.class_teacher_id)
      .filter((id): id is string => Boolean(id));

    let teacherMap: Record<string, { id: string; full_name: string; employee_id?: string }> = {};

    if (teacherIds.length > 0) {
      const { data: teachersData } = await supabase
        .from("teachers")
        .select("id, full_name, employee_id")
        .in("id", teacherIds);

      if (teachersData) {
        teachersData.forEach((t) => {
          teacherMap[t.id] = t;
        });
      }
    }

    return rawClasses.map((c) => ({
      ...c,
      teachers: c.class_teacher_id ? teacherMap[c.class_teacher_id] || null : null,
    }));
  },

  async createClass(payload: Omit<ClassItem, "id">): Promise<ClassItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("classes")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateClass(id: string, payload: Partial<ClassItem>): Promise<ClassItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("classes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteClass(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) throw error;
  },

  async getAssignedStudentsCount(classId: string): Promise<number> {
    const supabase = createClient();
    const { count, error } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("class_id", classId);

    if (error) throw error;
    return count ?? 0;
  },
};
