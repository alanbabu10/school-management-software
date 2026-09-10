import { createClient } from "@/lib/supabase/client";
import { LeaveRequestItem, LeaveRequestFormData, ReviewLeaveFormData } from "@/types/leave";

export const leaveService = {
  async fetchLeaveRequests(): Promise<LeaveRequestItem[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("leave_requests")
      .select(`
        *,
        students (
          id,
          full_name,
          admission_number,
          class_id,
          classes (
            id,
            name,
            division
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Fetch leave requests fallback:", error.message);
      const { data: rawData } = await supabase
        .from("leave_requests")
        .select("*")
        .order("created_at", { ascending: false });

      return (rawData || []).map((l: any) => ({
        ...l,
        students: null,
      }));
    }

    return (data || []).map((l: any) => {
      const studentObj = Array.isArray(l.students) ? l.students[0] || null : l.students || null;
      return {
        ...l,
        students: studentObj
          ? {
              ...studentObj,
              classes: Array.isArray(studentObj.classes)
                ? studentObj.classes[0] || null
                : studentObj.classes || null,
            }
          : null,
      };
    });
  },

  async createLeaveRequest(
    payload: LeaveRequestFormData,
    currentUserId?: string
  ): Promise<LeaveRequestItem> {
    const supabase = createClient();

    const studentIdPayload = !isNaN(Number(payload.student_id))
      ? Number(payload.student_id)
      : payload.student_id;

    const { data, error } = await supabase
      .from("leave_requests")
      .insert([
        {
          student_id: studentIdPayload,
          from_date: payload.from_date,
          to_date: payload.to_date,
          reason: payload.reason.trim(),
          status: "pending",
          requested_by: currentUserId || "Admin",
        },
      ])
      .select(`
        *,
        students (
          id,
          full_name,
          admission_number,
          class_id,
          classes (
            id,
            name,
            division
          )
        )
      `)
      .single();

    if (error) throw error;

    const studentObj = Array.isArray(data.students) ? data.students[0] || null : data.students || null;
    return {
      ...data,
      students: studentObj
        ? {
            ...studentObj,
            classes: Array.isArray(studentObj.classes)
              ? studentObj.classes[0] || null
              : studentObj.classes || null,
          }
        : null,
    };
  },

  async reviewLeaveRequest(
    payload: ReviewLeaveFormData,
    reviewerId?: string
  ): Promise<LeaveRequestItem> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("leave_requests")
      .update({
        status: payload.status,
        reviewed_by: reviewerId || null,
        reviewed_at: new Date().toISOString(),
        remarks: payload.remarks?.trim() || null,
      })
      .eq("id", payload.request_id)
      .select(`
        *,
        students (
          id,
          full_name,
          admission_number,
          class_id,
          classes (
            id,
            name,
            division
          )
        )
      `)
      .single();

    if (error) throw error;

    const studentObj = Array.isArray(data.students) ? data.students[0] || null : data.students || null;
    return {
      ...data,
      students: studentObj
        ? {
            ...studentObj,
            classes: Array.isArray(studentObj.classes)
              ? studentObj.classes[0] || null
              : studentObj.classes || null,
          }
        : null,
    };
  },

  async deleteLeaveRequest(id: string | number): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("leave_requests").delete().eq("id", id);
    if (error) throw error;
  },
};
