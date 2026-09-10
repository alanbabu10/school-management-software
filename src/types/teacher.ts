export interface Teacher {
  id: string;
  employee_id: string;
  full_name: string;
  phone?: string | null;
  subject?: string | null;
  joining_date?: string | null;
  status: string;
  created_at?: string;
}

export interface TeacherOption {
  id: string;
  full_name: string;
  employee_id?: string | null;
}

export interface TeacherFormData {
  employee_id: string;
  full_name: string;
  phone: string;
  subject: string;
  joining_date: string;
  status: string;
}
