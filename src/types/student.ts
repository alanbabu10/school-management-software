export interface Student {
  id: string;
  admission_number: string;
  full_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  class_id?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  phone?: string | null;
  address?: string | null;
  status: string;
  created_at?: string;
  classes?: { id: string; name: string } | null;
}

export interface ClassOption {
  id: string;
  name: string;
  division?: string | null;
  academic_year?: string | null;
}

export interface StudentFormData {
  admission_number: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  class_id: string;
  parent_name: string;
  parent_phone: string;
  phone: string;
  address: string;
  status: string;
}
