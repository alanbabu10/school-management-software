export interface FeeItem {
  id: string | number;
  student_id: string | number;
  fee_type: string;
  amount: number;
  due_date: string;
  paid_amount: number;
  paid_date?: string | null;
  status: "pending" | "partial" | "paid" | "overdue";
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

export interface StudentFeeOption {
  id: string | number;
  full_name: string;
  admission_number?: string | null;
  class_id?: string | number | null;
}

export interface FeeFormData {
  assignment_type: "single" | "bulk";
  student_id?: string;
  class_id?: string;
  fee_type: string;
  custom_fee_type?: string;
  amount: number | string;
  due_date: string;
  remarks?: string;
}

export interface PaymentFormData {
  fee_id: string | number;
  paid_amount: number | string;
  paid_date: string;
  remarks?: string;
}

export const COMMON_FEE_TYPES = [
  "Tuition Fee",
  "Bus / Transport Fee",
  "Exam Fee",
  "Annual Sports & Activity Fee",
  "Laboratory & Tech Fee",
  "Library Fee",
  "Uniform & Books",
  "Other / Custom",
] as const;
