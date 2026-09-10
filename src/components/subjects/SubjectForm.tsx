import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export interface SubjectFormProps {
  formData: { name: string; code: string };
  onChange: (newData: { name: string; code: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
  formError?: string;
  isEditMode?: boolean;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSaving,
  formError,
  isEditMode = false,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {formError}
        </div>
      )}

      <Input
        label="Subject Name *"
        placeholder="e.g. Mathematics"
        value={formData.name}
        onChange={(e) => onChange({ ...formData, name: e.target.value })}
        required
      />

      <Input
        label="Subject Code *"
        placeholder="e.g. MATH-101"
        value={formData.code}
        onChange={(e) => onChange({ ...formData, code: e.target.value })}
        required
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : isEditMode ? "Update Subject" : "Create Subject"}
        </Button>
      </div>
    </form>
  );
};
