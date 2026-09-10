export interface HomeworkItem {
  id: string | number;
  title: string;
  description?: string | null;
  class_id?: string | number | null;
  subject_id?: string | number | null;
  teacher_id?: string | null;
  due_date: string;
  attachment_url?: string | null;
  created_at?: string;
  classes?: { id: string | number; name: string; division?: string | null } | null;
  subjects?: { id: string | number; name: string; code: string } | null;
  teachers?: { id: string; full_name: string } | null;
}

export interface HomeworkFormData {
  title: string;
  description: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  due_date: string;
  attachment_url: string;
}
