export interface LeaveRequestItem {
  id: string | number;
  student_id: string | number;
  from_date: string;
  to_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requested_by?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  remarks?: string | null;
  created_at?: string;
  students?: {
    id: string | number;
    full_name: string;
    admission_number?: string | null;
    class_id?: string | number | null;
    classes?: {
      id: string | number;
      name: string;
      division?: string | null;
    } | null;
  } | null;
}

export interface StudentLeaveOption {
  id: string | number;
  full_name: string;
  admission_number?: string | null;
  class_id?: string | number | null;
}

export interface LeaveRequestFormData {
  student_id: string;
  from_date: string;
  to_date: string;
  reason: string;
}

export interface ReviewLeaveFormData {
  request_id: string | number;
  status: "approved" | "rejected";
  remarks?: string;
}
