"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LeaveRequestFormData, StudentLeaveOption } from "@/types/leave";
import { ClassOption } from "@/types/student";
import { AlertCircle, User, Calendar, BookOpen, FileText } from "lucide-react";

export interface LeaveFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveRequestFormData) => Promise<void>;
  classesList: ClassOption[];
  studentsList: StudentLeaveOption[];
  isSaving: boolean;
}

export const LeaveForm: React.FC<LeaveFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  classesList,
  studentsList,
  isSaving,
}) => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const defaultClass = classesList[0]?.id ? String(classesList[0].id) : "";
      setSelectedClassId(defaultClass);
      setStudentId("");
      const todayStr = new Date().toISOString().split("T")[0];
      setFromDate(todayStr);
      setToDate(todayStr);
      setReason("");
      setError(null);
    }
  }, [isOpen, classesList]);

  // Filter students based on selected class
  const filteredStudents = useMemo(() => {
    if (!selectedClassId || selectedClassId === "ALL") return studentsList;
    return studentsList.filter((s) => String(s.class_id) === String(selectedClassId));
  }, [selectedClassId, studentsList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setError("Please select a student.");
      return;
    }
    if (!fromDate) {
      setError("Please select a From Date.");
      return;
    }
    if (!toDate) {
      setError("Please select a To Date.");
      return;
    }
    if (toDate < fromDate) {
      setError("To Date cannot be earlier than From Date.");
      return;
    }
    if (!reason.trim()) {
      setError("Please enter the reason for leave.");
      return;
    }

    try {
      setError(null);
      await onSubmit({
        student_id: studentId,
        from_date: fromDate,
        to_date: toDate,
        reason: reason,
      });
    } catch (err: any) {
      setError(err.message || "Failed to submit leave request.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Leave Request (On Behalf)"
      subtitle="Submit an official leave request application for a student"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Filter Class & Student selection */}
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

        {/* From Date & To Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="From Date *"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
          />

          <Input
            type="date"
            label="To Date *"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" /> Reason for Leave *
          </label>
          <textarea
            rows={3}
            placeholder="Explain the reason for student absence (e.g. Medical illness, family event...)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Submitting..." : "Submit Leave Request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
