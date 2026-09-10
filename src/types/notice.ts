export interface NoticeItem {
  id: string;
  title: string;
  target: "All" | "Students" | "Teachers" | "Parents";
  class_name?: string | null;
  published_date: string;
  created_by: string;
  content: string;
}
