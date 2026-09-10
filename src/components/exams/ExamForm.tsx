import React from "react";
import { ExamFormData } from "@/types/exam";
import { ClassOption } from "@/types/student";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export interface ExamFormProps {
  formData: ExamFormData;
  onChange: (newData: ExamFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  classesList: ClassOption[];
  isSaving: boolean;
  formError?: string;
  isEditMode?: boolean;
}

export const ExamForm: React.FC<ExamFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  classesList,
  isSaving,
  formError,
  isEditMode = false,
}) => {
  const updateField = (field: keyof ExamFormData, value: string) => {
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
        label="Exam Title *"
        placeholder="e.g. Mid-Term Examination 2026"
        value={formData.name}
        onChange={(e) => updateField("name", e.target.value)}
        required
      />

      <Select
        label="Assigned Class *"
        value={formData.class_id}
        onChange={(e) => updateField("class_id", e.target.value)}
        options={[
          { label: "Select a Class...", value: "" },
          ...classesList.map((c) => ({
            label: `${c.name} ${c.division ? `(${c.division})` : ""}`,
            value: String(c.id),
          })),
        ]}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Exam Date"
          type="date"
          value={formData.exam_date}
          onChange={(e) => updateField("exam_date", e.target.value)}
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

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : isEditMode ? "Update Exam" : "Create Exam"}
        </Button>
      </div>
    </form>
  );
};
