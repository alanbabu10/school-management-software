export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  created_at?: string;
}

export interface ClassSubjectAssignment {
  id: string;
  class_id: string | number;
  subject_id: string;
  teacher_id?: string | null;
  subjects?: { id: string; name: string; code: string } | null;
  teachers?: { id: string; full_name: string; employee_id?: string | null } | null;
}
