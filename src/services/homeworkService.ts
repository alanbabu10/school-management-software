import { createClient } from "@/lib/supabase/client";
import { HomeworkItem } from "@/types/homework";

export const homeworkService = {
  async fetchHomeworks(): Promise<HomeworkItem[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("homework")
      .select(`
        *,
        classes (id, name, division),
        subjects (id, name, code),
        teachers (id, full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Fetch homework error fallback:", error.message);
      const { data: rawHomework } = await supabase
        .from("homework")
        .select("*")
        .order("created_at", { ascending: false });

      if (!rawHomework) return [];

      return rawHomework;
    }

    return (data || []).map((h: any) => ({
      ...h,
      classes: Array.isArray(h.classes) ? h.classes[0] || null : h.classes || null,
      subjects: Array.isArray(h.subjects) ? h.subjects[0] || null : h.subjects || null,
      teachers: Array.isArray(h.teachers) ? h.teachers[0] || null : h.teachers || null,
    }));
  },

  async createHomework(payload: {
    title: string;
    description?: string | null;
    class_id?: string | number | null;
    subject_id?: string | number | null;
    teacher_id?: string | null;
    due_date: string;
    attachment_url?: string | null;
  }): Promise<HomeworkItem> {
    const supabase = createClient();

    const classIdPayload = payload.class_id && !isNaN(Number(payload.class_id))
      ? Number(payload.class_id)
      : payload.class_id;

    const subjectIdPayload = payload.subject_id && !isNaN(Number(payload.subject_id))
      ? Number(payload.subject_id)
      : payload.subject_id;

    const insertPayload: any = {
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      class_id: classIdPayload || null,
      subject_id: subjectIdPayload || null,
      teacher_id: payload.teacher_id || null,
      due_date: payload.due_date,
      attachment_url: payload.attachment_url?.trim() || null,
    };

    let { data, error } = await supabase
      .from("homework")
      .insert([insertPayload])
      .select(`
        *,
        classes (id, name, division),
        subjects (id, name, code),
        teachers (id, full_name)
      `)
      .single();

    if (error) {
      // Fallback try inserting with attachment instead of attachment_url if schema column differs
      if (error.message.includes("attachment_url")) {
        delete insertPayload.attachment_url;
        insertPayload.attachment = payload.attachment_url?.trim() || null;

        const fallback = await supabase
          .from("homework")
          .insert([insertPayload])
          .select(`
            *,
            classes (id, name, division),
            subjects (id, name, code),
            teachers (id, full_name)
          `)
          .single();

        if (fallback.error) throw fallback.error;
        data = fallback.data;
      } else {
        throw error;
      }
    }

    return {
      ...data,
      classes: Array.isArray(data.classes) ? data.classes[0] || null : data.classes || null,
      subjects: Array.isArray(data.subjects) ? data.subjects[0] || null : data.subjects || null,
      teachers: Array.isArray(data.teachers) ? data.teachers[0] || null : data.teachers || null,
    };
  },

  async updateHomework(
    id: string | number,
    payload: {
      title?: string;
      description?: string | null;
      class_id?: string | number | null;
      subject_id?: string | number | null;
      teacher_id?: string | null;
      due_date?: string;
      attachment_url?: string | null;
    }
  ): Promise<HomeworkItem> {
    const supabase = createClient();
    const updatePayload: any = { ...payload };

    if (payload.class_id !== undefined && payload.class_id !== null) {
      updatePayload.class_id = !isNaN(Number(payload.class_id))
        ? Number(payload.class_id)
        : payload.class_id;
    }

    if (payload.subject_id !== undefined && payload.subject_id !== null) {
      updatePayload.subject_id = !isNaN(Number(payload.subject_id))
        ? Number(payload.subject_id)
        : payload.subject_id;
    }

    const { data, error } = await supabase
      .from("homework")
      .update(updatePayload)
      .eq("id", id)
      .select(`
        *,
        classes (id, name, division),
        subjects (id, name, code),
        teachers (id, full_name)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      classes: Array.isArray(data.classes) ? data.classes[0] || null : data.classes || null,
      subjects: Array.isArray(data.subjects) ? data.subjects[0] || null : data.subjects || null,
      teachers: Array.isArray(data.teachers) ? data.teachers[0] || null : data.teachers || null,
    };
  },

  async deleteHomework(id: string | number): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("homework").delete().eq("id", id);
    if (error) throw error;
  },
};
