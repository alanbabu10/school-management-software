export interface ExamItem {
  id: string;
  name: string;
  class_id?: string | number | null;
  exam_date?: string | null;
  academic_year?: string | null;
  created_at?: string;
  classes?: { id: string | number; name: string } | null;
}

export interface ExamFormData {
  name: string;
  class_id: string;
  exam_date: string;
  academic_year: string;
}

export interface MarkItem {
  id?: string | number;
  exam_id: string | number;
  student_id: string;
  subject_id: string | number;
  marks_obtained: number;
  max_marks: number;
  grade?: string | null;
  created_at?: string;
}

export interface StudentMarksRow {
  student_id: string;
  admission_number: string;
  full_name: string;
  subjectMarks: Record<string, { marks_obtained: number; max_marks: number; grade: string }>;
  totalObtained: number;
  totalMax: number;
  overallPercentage: number;
  overallGrade: string;
}
