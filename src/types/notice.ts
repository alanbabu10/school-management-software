export interface NoticeItem {
  id: string | number;
  title: string;
  content: string;
  target_role: "all" | "teacher" | "parent" | "student";
  class_id?: string | number | null;
  created_by?: string | null;
  published_at?: string | null;
  attachment_url?: string | null;
  created_at?: string;
  classes?: { id: string | number; name: string; division?: string | null } | null;
}

export interface NoticeFormData {
  title: string;
  content: string;
  target_role: "all" | "teacher" | "parent" | "student";
  class_id?: string;
  published_at: string;
  attachment_url?: string;
}

export const TARGET_ROLE_OPTIONS = [
  { label: "All School (Everyone)", value: "all" },
  { label: "Teachers Only", value: "teacher" },
  { label: "Parents Only", value: "parent" },
  { label: "Students Only", value: "student" },
] as const;
