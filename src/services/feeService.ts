import { createClient } from "@/lib/supabase/client";
import { FeeItem, FeeFormData, PaymentFormData } from "@/types/fee";

export const feeService = {
  async fetchFees(): Promise<FeeItem[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("fees")
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
      console.warn("Fetch fees error fallback:", error.message);
      const { data: rawFees } = await supabase
        .from("fees")
        .select("*")
        .order("created_at", { ascending: false });

      return (rawFees || []).map((f: any) => ({
        ...f,
        students: null,
      }));
    }

    const todayStr = new Date().toISOString().split("T")[0];

    return (data || []).map((f: any) => {
      const studentObj = Array.isArray(f.students) ? f.students[0] || null : f.students || null;
      let status = f.status || "pending";

      // Auto check overdue
      const isPastDue = f.due_date && f.due_date < todayStr;
      if (isPastDue && status !== "paid") {
        status = "overdue";
      }

      return {
        ...f,
        status,
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

  async createFeeRecords(
    payload: FeeFormData,
    studentsInClass?: Array<{ id: string | number }>
  ): Promise<number> {
    const supabase = createClient();
    const feeType =
      payload.fee_type === "Other / Custom" && payload.custom_fee_type
        ? payload.custom_fee_type.trim()
        : payload.fee_type;

    const amountNum = Number(payload.amount);
    const todayStr = new Date().toISOString().split("T")[0];
    const initialStatus = payload.due_date < todayStr ? "overdue" : "pending";

    if (payload.assignment_type === "bulk" && studentsInClass && studentsInClass.length > 0) {
      const insertPayloads = studentsInClass.map((student) => ({
        student_id: !isNaN(Number(student.id)) ? Number(student.id) : student.id,
        fee_type: feeType,
        amount: amountNum,
        due_date: payload.due_date,
        paid_amount: 0,
        status: initialStatus,
        remarks: payload.remarks?.trim() || null,
      }));

      const { error } = await supabase.from("fees").insert(insertPayloads);
      if (error) throw error;
      return studentsInClass.length;
    } else {
      if (!payload.student_id) throw new Error("Student must be selected.");

      const studentIdPayload = !isNaN(Number(payload.student_id))
        ? Number(payload.student_id)
        : payload.student_id;

      const { error } = await supabase.from("fees").insert([
        {
          student_id: studentIdPayload,
          fee_type: feeType,
          amount: amountNum,
          due_date: payload.due_date,
          paid_amount: 0,
          status: initialStatus,
          remarks: payload.remarks?.trim() || null,
        },
      ]);

      if (error) throw error;
      return 1;
    }
  },

  async recordPayment(
    payload: PaymentFormData,
    totalAmount: number
  ): Promise<FeeItem> {
    const supabase = createClient();
    const paidAmountNum = Number(payload.paid_amount);

    let status: "pending" | "partial" | "paid" = "pending";
    if (paidAmountNum >= totalAmount) {
      status = "paid";
    } else if (paidAmountNum > 0) {
      status = "partial";
    }

    const { data, error } = await supabase
      .from("fees")
      .update({
        paid_amount: paidAmountNum,
        paid_date: payload.paid_date,
        status: status,
        remarks: payload.remarks?.trim() || null,
      })
      .eq("id", payload.fee_id)
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

  async updateFeeRecord(
    id: string | number,
    payload: Partial<FeeItem>
  ): Promise<FeeItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("fees")
      .update(payload)
      .eq("id", id)
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

  async deleteFeeRecord(id: string | number): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("fees").delete().eq("id", id);
    if (error) throw error;
  },
};
