import { createClient } from "@/lib/supabase/client";
import { AttendanceRecord, StudentAttendanceItem, AttendanceSummary } from "@/types/attendance";

export const attendanceService = {
  /**
   * Fetch attendance status for a given class and date
   */
  async fetchAttendanceForClassAndDate(
    classId: string,
    dateStr: string
  ): Promise<Record<string, "present" | "absent" | "late" | "leave">> {
    const supabase = createClient();
    const statusMap: Record<string, "present" | "absent" | "late" | "leave"> = {};

    let { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("attendance_date", dateStr);

    if (error) {
      const fallback = await supabase
        .from("attendance")
        .select("*")
        .eq("date", dateStr);

      if (!fallback.error && fallback.data) {
        data = fallback.data;
      }
    }

    if (data && data.length > 0) {
      data.forEach((row: any) => {
        if (row.student_id && row.status) {
          statusMap[row.student_id] = row.status as "present" | "absent" | "late" | "leave";
        }
      });
    }

    return statusMap;
  },

  /**
   * Save or update attendance records for a class and date
   */
  async saveAttendanceRecords(
    records: { student_id: string; status: "present" | "absent" | "late" | "leave" }[],
    dateStr: string,
    adminId?: string | null
  ): Promise<void> {
    const supabase = createClient();
    const validMarkedBy = adminId && adminId !== "admin" ? adminId : null;

    for (const record of records) {
      // Check existing row for student_id & date
      let { data: existingRow } = await supabase
        .from("attendance")
        .select("id")
        .eq("student_id", record.student_id)
        .eq("attendance_date", dateStr)
        .maybeSingle();

      if (!existingRow) {
        const fallback = await supabase
          .from("attendance")
          .select("id")
          .eq("student_id", record.student_id)
          .eq("date", dateStr)
          .maybeSingle();
        existingRow = fallback.data;
      }

      if (existingRow) {
        // Update existing attendance record
        let { error: updateError } = await supabase
          .from("attendance")
          .update({
            status: record.status,
            marked_by: validMarkedBy,
          })
          .eq("id", existingRow.id);

        if (updateError && updateError.code === "23503") {
          // Foreign key violation fallback: set marked_by to null
          await supabase
            .from("attendance")
            .update({
              status: record.status,
              marked_by: null,
            })
            .eq("id", existingRow.id);
        }
      } else {
        // Insert new attendance record
        const insertPayload: any = {
          student_id: record.student_id,
          attendance_date: dateStr,
          date: dateStr,
          status: record.status,
          marked_by: validMarkedBy,
        };

        let { error: insertError } = await supabase
          .from("attendance")
          .insert([insertPayload]);

        if (insertError) {
          // Retry without extra date field
          const retryPayload: any = {
            student_id: record.student_id,
            attendance_date: dateStr,
            status: record.status,
            marked_by: validMarkedBy,
          };
          let { error: retryError } = await supabase
            .from("attendance")
            .insert([retryPayload]);

          if (retryError) {
            // Final fallback: set marked_by to null to satisfy FK constraint
            const safePayload: any = {
              student_id: record.student_id,
              attendance_date: dateStr,
              status: record.status,
              marked_by: null,
            };
            const { error: finalError } = await supabase
              .from("attendance")
              .insert([safePayload]);

            if (finalError) {
              console.error("Insert attendance error:", finalError.message);
              throw finalError;
            }
          }
        }
      }
    }
  },

  /**
   * Fetch aggregated attendance summary report for a class and date range
   */
  async fetchAttendanceReport(
    classStudents: { id: string; admission_number: string; full_name: string }[],
    startDate: string,
    endDate: string
  ): Promise<AttendanceSummary[]> {
    const supabase = createClient();
    const studentIds = classStudents.map((s) => s.id);

    if (studentIds.length === 0) return [];

    let { data: records } = await supabase
      .from("attendance")
      .select("*")
      .in("student_id", studentIds)
      .gte("attendance_date", startDate)
      .lte("attendance_date", endDate);

    if (!records || records.length === 0) {
      const fallback = await supabase
        .from("attendance")
        .select("*")
        .in("student_id", studentIds)
        .gte("date", startDate)
        .lte("date", endDate);
      records = fallback.data || [];
    }

    return classStudents.map((student) => {
      const studentRecords = (records || []).filter(
        (r: any) => String(r.student_id) === String(student.id)
      );

      let present = 0;
      let absent = 0;
      let late = 0;
      let leave = 0;

      studentRecords.forEach((r: any) => {
        if (r.status === "present") present++;
        else if (r.status === "absent") absent++;
        else if (r.status === "late") late++;
        else if (r.status === "leave") leave++;
      });

      const total = studentRecords.length;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

      return {
        student_id: student.id,
        admission_number: student.admission_number,
        full_name: student.full_name,
        present,
        absent,
        late,
        leave,
        total,
        percentage,
      };
    });
  },
};
