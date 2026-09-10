import { createClient } from "@/lib/supabase/client";
import { Student } from "@/types/student";

export const studentService = {
  async fetchStudents(): Promise<Student[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("students")
      .select(`
        *,
        classes (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Fetch students warning:", error.message);
      const { data: rawData } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });
      return rawData || [];
    }

    return data || [];
  },

  async createStudent(payload: Omit<Student, "id">): Promise<Student> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("students")
      .insert([payload])
      .select(`
        *,
        classes (id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateStudent(id: string, payload: Partial<Student>): Promise<Student> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("students")
      .update(payload)
      .eq("id", id)
      .select(`
        *,
        classes (id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteStudent(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) throw error;
  },
};
