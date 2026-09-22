import React, { useEffect } from "react";
import { StudentFormData, ClassOption } from "@/types/student";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertCircle, KeyRound } from "lucide-react";

export interface StudentFormProps {
  formData: StudentFormData;
  onChange: (newData: StudentFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  classesList: ClassOption[];
  isSaving: boolean;
  formError?: string;
  isEditMode?: boolean;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  classesList,
  isSaving,
  formError,
  isEditMode = false,
}) => {
  const updateField = (field: keyof StudentFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  // Auto-generate suggested DDMM parent password if DOB is set and adding new student
  const handleDobChange = (dobValue: string) => {
    let suggestedPassword = formData.parent_password;

    if (!isEditMode && dobValue) {
      // Format YYYY-MM-DD -> DDMM
      const parts = dobValue.split("-");
      if (parts.length === 3) {
        const [, mm, dd] = parts;
        suggestedPassword = `${dd}${mm}`;
      }
    }

    onChange({
      ...formData,
      date_of_birth: dobValue,
      parent_password: suggestedPassword,
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {formError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {formError}
        </div>
      )}

      {/* Section 1: Student Information */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          1. Student Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Admission Number *"
            placeholder="e.g. ADM-2026-001"
            value={formData.admission_number}
            onChange={(e) => updateField("admission_number", e.target.value)}
            required
          />
          <Input
            label="Full Name *"
            placeholder="e.g. John Doe"
            value={formData.full_name}
            onChange={(e) => updateField("full_name", e.target.value)}
            required
          />
          <Input
            label="Date of Birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleDobChange(e.target.value)}
          />
          <Select
            label="Gender"
            value={formData.gender}
            onChange={(e) => updateField("gender", e.target.value)}
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" },
            ]}
          />
          <Select
            label="Assigned Class"
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
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => updateField("status", e.target.value)}
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
          />
        </div>
      </div>

      {/* Section 2: Parent / Guardian & Login Credentials */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            2. Parent / Guardian & Auth Setup
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Parent / Guardian Name"
            placeholder="e.g. Robert Doe"
            value={formData.parent_name}
            onChange={(e) => updateField("parent_name", e.target.value)}
          />
          <Input
            label="Parent Phone Number (Login ID)"
            placeholder="e.g. 9876543210"
            value={formData.parent_phone}
            onChange={(e) => updateField("parent_phone", e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label={isEditMode ? "Reset Parent Password (Optional)" : "Parent Password *"}
              type="password"
              placeholder={isEditMode ? "Leave blank to keep existing password" : "Enter password or pre-filled DDMM"}
              value={formData.parent_password}
              onChange={(e) => updateField("parent_password", e.target.value)}
            />
            <p className="mt-1 text-[11px] text-slate-500 font-medium">
              {isEditMode
                ? "Enter a new password only if resetting. Otherwise leave blank."
                : "Parent uses their Phone Number + this Password to log into the Parent Portal."}
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Additional Contact & Address */}
      <div className="border-t border-slate-100 pt-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          3. Additional Contact & Address
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Student Phone"
            placeholder="Optional"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
          <Input
            label="Residential Address"
            placeholder="Street, City, State"
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : isEditMode ? "Update Student" : "Save Student"}
        </Button>
      </div>
    </form>
  );
};
