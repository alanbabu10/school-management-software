export interface TimetableEntry {
  id: string | number;
  class_id: string | number;
  day_of_week: string;
  period_number: number;
  subject_id: string | number;
  teacher_id?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  room_number?: string | null;
  created_at?: string;
  classes?: { id: string | number; name: string; division?: string | null } | null;
  subjects?: { id: string | number; name: string; code: string } | null;
  teachers?: { id: string; full_name: string } | null;
}

export interface TimetableFormData {
  class_id: string;
  day_of_week: string;
  period_number: number | string;
  subject_id: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  room_number: string;
}

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const PERIOD_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const DEFAULT_PERIOD_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: "08:30", end: "09:15" },
  2: { start: "09:15", end: "10:00" },
  3: { start: "10:15", end: "11:00" },
  4: { start: "11:00", end: "11:45" },
  5: { start: "12:15", end: "13:00" },
  6: { start: "13:00", end: "13:45" },
  7: { start: "14:00", end: "14:45" },
  8: { start: "14:45", end: "15:30" },
};
