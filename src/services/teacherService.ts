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

  async createTeacher(payload: Omit<Teacher, "id"> & { password?: string }): Promise<Teacher> {
    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to create teacher account.");
    }

    return data.teacher;
  },

  async updateTeacher(id: string, payload: Partial<Teacher> & { password?: string }): Promise<Teacher> {
    const supabase = createClient();
    const { password, ...teacherPayload } = payload;

    if (password && password.trim().length > 0) {
      const resetRes = await fetch("/api/admin/teachers/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_id: id, new_password: password.trim() }),
      });
      const resetData = await resetRes.json();
      if (!resetRes.ok || !resetData.success) {
        throw new Error(resetData.error || "Failed to reset teacher password.");
      }
    }

    const { data, error } = await supabase
      .from("teachers")
      .update(teacherPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Also update profiles full_name if full_name changed
    if (payload.full_name) {
      await supabase.from("profiles").update({ full_name: payload.full_name }).eq("id", id);
    }

    return data;
  },

  async resetTeacherPassword(teacherId: string, newPassword: string): Promise<void> {
    const res = await fetch("/api/admin/teachers/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher_id: teacherId, new_password: newPassword }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to reset teacher password.");
    }
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
