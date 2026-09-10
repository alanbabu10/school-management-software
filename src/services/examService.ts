import { createClient } from "@/lib/supabase/client";
import { ExamItem, MarkItem } from "@/types/exam";

export function calculateGrade(obtained: number, max: number): string {
  if (!max || max <= 0) return "F";
  const percentage = (obtained / max) * 100;
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

export const examService = {
  async fetchExams(): Promise<ExamItem[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("exams")
      .select(`
        *,
        classes (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback try raw query
      const { data: rawExams } = await supabase
        .from("exams")
        .select("*")
        .order("created_at", { ascending: false });

      if (!rawExams) return [];

      const classIds = rawExams
        .map((e) => e.class_id)
        .filter((id): id is string => Boolean(id));

      if (classIds.length > 0) {
        const { data: classesData } = await supabase
          .from("classes")
          .select("id, name")
          .in("id", classIds);

        const classMap: Record<string, { id: string; name: string }> = {};
        (classesData || []).forEach((c) => {
          classMap[String(c.id)] = c;
        });

        return rawExams.map((e) => ({
          ...e,
          classes: e.class_id ? classMap[String(e.class_id)] || null : null,
        }));
      }

      return rawExams;
    }

    return (data || []).map((e: any) => ({
      ...e,
      classes: Array.isArray(e.classes) ? e.classes[0] || null : e.classes || null,
    }));
  },

  async createExam(payload: {
    name: string;
    class_id: string | number;
    exam_date?: string | null;
    academic_year?: string | null;
  }): Promise<ExamItem> {
    const supabase = createClient();
    const classIdPayload = isNaN(Number(payload.class_id))
      ? payload.class_id
      : Number(payload.class_id);

    const { data, error } = await supabase
      .from("exams")
      .insert([
        {
          name: payload.name.trim(),
          class_id: classIdPayload,
          exam_date: payload.exam_date || null,
          academic_year: payload.academic_year || "2026-2027",
        },
      ])
      .select(`
        *,
        classes (id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateExam(
    id: string | number,
    payload: {
      name?: string;
      class_id?: string | number;
      exam_date?: string | null;
      academic_year?: string | null;
    }
  ): Promise<ExamItem> {
    const supabase = createClient();
    const updateData: any = { ...payload };
    if (payload.class_id !== undefined) {
      updateData.class_id = isNaN(Number(payload.class_id))
        ? payload.class_id
        : Number(payload.class_id);
    }

    const { data, error } = await supabase
      .from("exams")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        classes (id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteExam(id: string | number): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) throw error;
  },

  async fetchMarksForExam(examId: string | number): Promise<MarkItem[]> {
    const supabase = createClient();
    const examIdPayload = isNaN(Number(examId)) ? examId : Number(examId);

    const { data, error } = await supabase
      .from("marks")
      .select("*")
      .eq("exam_id", examIdPayload);

    if (error) {
      console.warn("Fetch marks error:", error.message);
      return [];
    }

    return data || [];
  },

  async saveMarksList(marksList: MarkItem[]): Promise<void> {
    const supabase = createClient();

    for (const mark of marksList) {
      const examIdPayload = isNaN(Number(mark.exam_id)) ? mark.exam_id : Number(mark.exam_id);
      const subjectIdPayload = isNaN(Number(mark.subject_id)) ? mark.subject_id : Number(mark.subject_id);

      const grade = calculateGrade(mark.marks_obtained, mark.max_marks);

      // Check if mark row exists for exam_id + student_id + subject_id
      const { data: existingRow } = await supabase
        .from("marks")
        .select("id")
        .eq("exam_id", examIdPayload)
        .eq("student_id", mark.student_id)
        .eq("subject_id", subjectIdPayload)
        .maybeSingle();

      if (existingRow) {
        // Update existing mark row
        const { error: updateError } = await supabase
          .from("marks")
          .update({
            marks_obtained: mark.marks_obtained,
            max_marks: mark.max_marks,
            grade: grade,
          })
          .eq("id", existingRow.id);

        if (updateError) {
          console.error("Update mark error:", updateError.message);
        }
      } else {
        // Insert new mark row
        const { error: insertError } = await supabase
          .from("marks")
          .insert([
            {
              exam_id: examIdPayload,
              student_id: mark.student_id,
              subject_id: subjectIdPayload,
              marks_obtained: mark.marks_obtained,
              max_marks: mark.max_marks,
              grade: grade,
            },
          ]);

        if (insertError) {
          console.error("Insert mark error:", insertError.message);
        }
      }
    }
  },
};
