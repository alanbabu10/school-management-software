import React from "react";
import { ClassFormData } from "@/types/class";
import { TeacherOption } from "@/types/teacher";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export interface ClassFormProps {
  formData: ClassFormData;
  onChange: (newData: ClassFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  teachersList: TeacherOption[];
  isSaving: boolean;
  formError?: string;
  isEditMode?: boolean;
}

export const ClassForm: React.FC<ClassFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  teachersList,
  isSaving,
  formError,
  isEditMode = false,
}) => {
  const updateField = (field: keyof ClassFormData, value: string) => {
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

      <Input
        label="Class Name *"
        placeholder="e.g. Class 10"
        value={formData.name}
        onChange={(e) => updateField("name", e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Division / Section"
          placeholder="e.g. A"
          value={formData.division}
          onChange={(e) => updateField("division", e.target.value)}
        />
        <Select
          label="Academic Year"
          value={formData.academic_year}
          onChange={(e) => updateField("academic_year", e.target.value)}
          options={[
            { label: "2026-2027", value: "2026-2027" },
            { label: "2025-2026", value: "2025-2026" },
          ]}
        />
      </div>

      <Select
        label="Class Teacher"
        value={formData.class_teacher_id}
        onChange={(e) => updateField("class_teacher_id", e.target.value)}
        options={[
          { label: "Unassigned", value: "" },
          ...teachersList.map((t) => ({
            label: `${t.full_name} (${t.employee_id || "No ID"})`,
            value: t.id,
          })),
        ]}
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : isEditMode ? "Update Class" : "Create Class"}
        </Button>
      </div>
    </form>
  );
};
