import { createClient } from "@/lib/supabase/client";
import { NoticeItem, NoticeFormData } from "@/types/notice";

export const noticeService = {
  async fetchNotices(): Promise<NoticeItem[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("notices")
      .select(`
        *,
        classes (
          id,
          name,
          division
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Fetch notices error fallback:", error.message);
      const { data: rawData } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false });

      return (rawData || []).map((n: any) => ({
        ...n,
        classes: null,
      }));
    }

    return (data || []).map((n: any) => ({
      ...n,
      classes: Array.isArray(n.classes) ? n.classes[0] || null : n.classes || null,
    }));
  },

  async createNotice(
    payload: NoticeFormData,
    currentUserId?: string
  ): Promise<NoticeItem> {
    const supabase = createClient();

    const classIdPayload =
      payload.class_id && payload.class_id !== "ALL" && !isNaN(Number(payload.class_id))
        ? Number(payload.class_id)
        : payload.class_id || null;

    const publishedAtPayload = payload.published_at || new Date().toISOString();

    const insertPayload: any = {
      title: payload.title.trim(),
      content: payload.content.trim(),
      target_role: payload.target_role,
      class_id: classIdPayload || null,
      created_by: currentUserId || null,
      published_at: publishedAtPayload,
      attachment_url: payload.attachment_url?.trim() || null,
    };

    let { data, error } = await supabase
      .from("notices")
      .insert([insertPayload])
      .select(`
        *,
        classes (id, name, division)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      classes: Array.isArray(data.classes) ? data.classes[0] || null : data.classes || null,
    };
  },

  async updateNotice(
    id: string | number,
    payload: Partial<NoticeFormData>
  ): Promise<NoticeItem> {
    const supabase = createClient();
    const updatePayload: any = { ...payload };

    if (payload.class_id !== undefined) {
      updatePayload.class_id =
        payload.class_id && payload.class_id !== "ALL" && !isNaN(Number(payload.class_id))
          ? Number(payload.class_id)
          : payload.class_id || null;
    }

    const { data, error } = await supabase
      .from("notices")
      .update(updatePayload)
      .eq("id", id)
      .select(`
        *,
        classes (id, name, division)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      classes: Array.isArray(data.classes) ? data.classes[0] || null : data.classes || null,
    };
  },

  async deleteNotice(id: string | number): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) throw error;
  },
};
