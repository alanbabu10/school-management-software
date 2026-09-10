import React from "react";
import { TeacherFormData } from "@/types/teacher";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export interface TeacherFormProps {
  formData: TeacherFormData;
  onChange: (newData: TeacherFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
  formError?: string;
  isEditMode?: boolean;
}

export const TeacherForm: React.FC<TeacherFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSaving,
  formError,
  isEditMode = false,
}) => {
  const updateField = (field: keyof TeacherFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Employee ID *"
          placeholder="e.g. EMP-101"
          value={formData.employee_id}
          onChange={(e) => updateField("employee_id", e.target.value)}
          required
        />
        <Input
          label="Full Name *"
          placeholder="e.g. Sarah Jenkins"
          value={formData.full_name}
          onChange={(e) => updateField("full_name", e.target.value)}
          required
        />
        <Input
          label="Contact Phone"
          placeholder="e.g. +1 555-0199"
          value={formData.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />
        <Input
          label="Primary Subject"
          placeholder="e.g. Mathematics"
          value={formData.subject}
          onChange={(e) => updateField("subject", e.target.value)}
        />
        <Input
          label="Joining Date"
          type="date"
          value={formData.joining_date}
          onChange={(e) => updateField("joining_date", e.target.value)}
        />
        <Select
          label="Account Status"
          value={formData.status}
          onChange={(e) => updateField("status", e.target.value)}
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : isEditMode ? "Update Profile" : "Register Teacher"}
        </Button>
      </div>
    </form>
  );
};
