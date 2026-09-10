"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FeeFormData, StudentFeeOption, COMMON_FEE_TYPES } from "@/types/fee";
import { ClassOption } from "@/types/student";
import { AlertCircle, CreditCard, Users, User, Calendar, BookOpen } from "lucide-react";

export interface FeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FeeFormData) => Promise<void>;
  classesList: ClassOption[];
  studentsList: StudentFeeOption[];
  isSaving: boolean;
}

export const FeeForm: React.FC<FeeFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  classesList,
  studentsList,
  isSaving,
}) => {
  const [assignmentType, setAssignmentType] = useState<"single" | "bulk">("single");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [feeType, setFeeType] = useState<string>("Tuition Fee");
  const [customFeeType, setCustomFeeType] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sync initial state on modal open
  useEffect(() => {
    if (isOpen) {
      setAssignmentType("single");
      const defaultClass = classesList[0]?.id ? String(classesList[0].id) : "";
      setSelectedClassId(defaultClass);
      setStudentId("");
      setFeeType("Tuition Fee");
      setCustomFeeType("");
      setAmount("");
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 30);
      setDueDate(defaultDue.toISOString().split("T")[0]);
      setRemarks("");
      setError(null);
    }
  }, [isOpen, classesList]);

  // Students filtered by selected class if class chosen
  const filteredStudents = useMemo(() => {
    if (!selectedClassId || selectedClassId === "ALL") return studentsList;
    return studentsList.filter((s) => String(s.class_id) === String(selectedClassId));
  }, [selectedClassId, studentsList]);

  // Students count for bulk assignment
  const bulkStudentCount = useMemo(() => {
    if (!selectedClassId) return 0;
    return studentsList.filter((s) => String(s.class_id) === String(selectedClassId)).length;
  }, [selectedClassId, studentsList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assignmentType === "single" && !studentId) {
      setError("Please select a student.");
      return;
    }
    if (assignmentType === "bulk" && !selectedClassId) {
      setError("Please select a class for bulk assignment.");
      return;
    }
    if (feeType === "Other / Custom" && !customFeeType.trim()) {
      setError("Please specify the custom fee type.");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid fee amount.");
      return;
    }
    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }

    try {
      setError(null);
      await onSubmit({
        assignment_type: assignmentType,
        student_id: studentId,
        class_id: selectedClassId,
        fee_type: feeType,
        custom_fee_type: customFeeType,
        amount: Number(amount),
        due_date: dueDate,
        remarks: remarks,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create fee record.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Fee Invoice / Assignment"
      subtitle="Assign tuition, transport, or custom fees to an individual student or an entire class"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Assignment Type Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setAssignmentType("single")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
              assignmentType === "single"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4" /> Single Student
          </button>
          <button
            type="button"
            onClick={() => setAssignmentType("bulk")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
              assignmentType === "bulk"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" /> Bulk Class Assignment
          </button>
        </div>

        {/* Single Student Selection */}
        {assignmentType === "single" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Filter Class (Optional)
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setStudentId("");
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="ALL">All Classes</option>
                {classesList.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name} {c.division ? `(${c.division})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" /> Student *
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                required
              >
                <option value="">Select Student</option>
                {filteredStudents.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.full_name} ({s.admission_number || "No Adm #"})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          /* Bulk Class Selection */
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Select Target Class *
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              required
            >
              <option value="">Select Class</option>
              {classesList.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} {c.division ? `(${c.division})` : ""}
                </option>
              ))}
            </select>
            {selectedClassId && (
              <p className="text-xs text-indigo-700 font-medium bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 mt-2">
                📢 Notice: This fee will be assigned to all{" "}
                <span className="font-bold">{bulkStudentCount}</span> students in this class.
              </p>
            )}
          </div>
        )}

        {/* Fee Type & Custom Fee Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Fee Type *
            </label>
            <select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              required
            >
              {COMMON_FEE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {feeType === "Other / Custom" ? (
            <Input
              label="Custom Fee Title *"
              placeholder="e.g. Science Fair Material Fee"
              value={customFeeType}
              onChange={(e) => setCustomFeeType(e.target.value)}
              required
            />
          ) : (
            <Input
              type="number"
              label="Amount (₹) *"
              placeholder="e.g. 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          )}
        </div>

        {feeType === "Other / Custom" && (
          <Input
            type="number"
            label="Amount (₹) *"
            placeholder="e.g. 15000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        )}

        {/* Due Date & Remarks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Due Date *"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />

          <Input
            label="Remarks / Billing Invoice Note (Optional)"
            placeholder="e.g. Term 1 installment due"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? "Assigning..."
              : assignmentType === "bulk"
              ? `Assign Fee to ${bulkStudentCount} Students`
              : "Create Fee Invoice"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
