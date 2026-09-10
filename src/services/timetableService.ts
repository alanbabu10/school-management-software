import { createClient } from "@/lib/supabase/client";
import { TimetableEntry, TimetableFormData } from "@/types/timetable";

export const timetableService = {
  async fetchTimetable(classId?: string | number): Promise<TimetableEntry[]> {
    const supabase = createClient();
    let query = supabase
      .from("timetable")
      .select(`
        *,
        classes (id, name, division),
        subjects (id, name, code),
        teachers (id, full_name)
      `)
      .order("period_number", { ascending: true });

    if (classId && classId !== "ALL") {
      const classIdPayload = !isNaN(Number(classId)) ? Number(classId) : classId;
      query = query.eq("class_id", classIdPayload);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Fetch timetable fallback:", error.message);
      const { data: rawData } = await supabase.from("timetable").select("*");
      return (rawData || []).map((t: any) => ({
        ...t,
        classes: null,
        subjects: null,
        teachers: null,
      }));
    }

    return (data || []).map((t: any) => ({
      ...t,
      classes: Array.isArray(t.classes) ? t.classes[0] || null : t.classes || null,
      subjects: Array.isArray(t.subjects) ? t.subjects[0] || null : t.subjects || null,
      teachers: Array.isArray(t.teachers) ? t.teachers[0] || null : t.teachers || null,
    }));
  },

  async saveTimetableEntry(
    payload: TimetableFormData,
    editId?: string | number
  ): Promise<TimetableEntry> {
    const supabase = createClient();

    const classIdPayload = !isNaN(Number(payload.class_id))
      ? Number(payload.class_id)
      : payload.class_id;

    const subjectIdPayload = !isNaN(Number(payload.subject_id))
      ? Number(payload.subject_id)
      : payload.subject_id;

    const periodNumberPayload = Number(payload.period_number);
    const dayOfWeekPayload = payload.day_of_week.toLowerCase().trim();

    const recordPayload: any = {
      class_id: classIdPayload,
      day_of_week: dayOfWeekPayload,
      period_number: periodNumberPayload,
      subject_id: subjectIdPayload,
      teacher_id: payload.teacher_id || null,
      start_time: payload.start_time?.trim() || null,
      end_time: payload.end_time?.trim() || null,
      room_number: payload.room_number?.trim() || null,
    };

    // If editId is provided, directly update by ID
    if (editId) {
      const { data, error } = await supabase
        .from("timetable")
        .update(recordPayload)
        .eq("id", editId)
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
    }

    // Check for existing record matching class_id + day_of_week + period_number
    const { data: existingSlot } = await supabase
      .from("timetable")
      .select("id")
      .eq("class_id", classIdPayload)
      .eq("day_of_week", dayOfWeekPayload)
      .eq("period_number", periodNumberPayload)
      .maybeSingle();

    if (existingSlot) {
      // Upsert/Update existing slot
      const { data, error } = await supabase
        .from("timetable")
        .update(recordPayload)
        .eq("id", existingSlot.id)
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
    } else {
      // Insert new slot
      const { data, error } = await supabase
        .from("timetable")
        .insert([recordPayload])
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
    }
  },

  async deleteTimetableEntry(id: string | number): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("timetable").delete().eq("id", id);
    if (error) throw error;
  },
};
