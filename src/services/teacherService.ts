import { createClient } from "@/lib/supabase/client";
import { Teacher } from "@/types/teacher";

export const teacherService = {
  async fetchTeachers(): Promise<Teacher[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTeacher(payload: Omit<Teacher, "id">): Promise<Teacher> {
    const supabase = createClient();
    const newId = crypto.randomUUID();

    // Upsert profile entry first
    await supabase.from("profiles").upsert(
      {
        id: newId,
        full_name: payload.full_name,
        role: "teacher",
      },
      { onConflict: "id" }
    );

    const { data, error } = await supabase
      .from("teachers")
      .insert([{ id: newId, ...payload }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTeacher(id: string, payload: Partial<Teacher>): Promise<Teacher> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("teachers")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleTeacherStatus(id: string, newStatus: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("teachers")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) throw error;
  },
};
