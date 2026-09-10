export interface AttendanceRecord {
  id?: string | number;
  student_id: string;
  class_id?: string | number | null;
  attendance_date: string;
  status: "present" | "absent" | "late" | "leave";
  marked_by?: string | null;
  created_at?: string;
}

export interface StudentAttendanceItem {
  student_id: string;
  admission_number: string;
  full_name: string;
  class_id?: string | null;
  class_name?: string;
  status: "present" | "absent" | "late" | "leave";
}

export interface AttendanceSummary {
  student_id: string;
  admission_number: string;
  full_name: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  total: number;
  percentage: number;
}
