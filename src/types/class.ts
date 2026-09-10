export interface ClassItem {
  id: string;
  name: string;
  division?: string | null;
  academic_year?: string | null;
  class_teacher_id?: string | null;
  created_at?: string;
  teachers?: { id: string; full_name: string; employee_id?: string } | null;
}

export interface ClassFormData {
  name: string;
  division: string;
  academic_year: string;
  class_teacher_id: string;
}
