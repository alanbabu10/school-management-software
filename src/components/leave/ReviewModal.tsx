"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeaveRequestItem, ReviewLeaveFormData } from "@/types/leave";
import { AlertCircle, CheckCircle2, XCircle, Calendar, User, FileText } from "lucide-react";

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewLeaveFormData) => Promise<void>;
  leaveRequest: LeaveRequestItem | null;
  isSaving: boolean;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  leaveRequest,
  isSaving,
}) => {
  const [status, setStatus] = useState<"approved" | "rejected">("approved");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && leaveRequest) {
      setStatus(leaveRequest.status === "rejected" ? "rejected" : "approved");
      setRemarks(leaveRequest.remarks || "");
      setError(null);
    }
  }, [isOpen, leaveRequest]);

  const handleSubmit = async (targetStatus: "approved" | "rejected") => {
    if (!leaveRequest) return;

    try {
      setError(null);
      await onSubmit({
        request_id: leaveRequest.id,
        status: targetStatus,
        remarks: remarks,
      });
    } catch (err: any) {
      setError(err.message || "Failed to update leave request status.");
    }
  };

  if (!leaveRequest) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Leave Application"
      subtitle={`Review application for ${leaveRequest.students?.full_name || "Student"}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Application Details Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Student Name:</span>
            <span className="font-bold text-slate-900">{leaveRequest.students?.full_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Class:</span>
            <span className="font-semibold text-slate-900">
              {leaveRequest.students?.classes?.name} {leaveRequest.students?.classes?.division ? `(${leaveRequest.students.classes.division})` : ""}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Leave Duration:</span>
            <span className="font-bold text-indigo-600">
              {leaveRequest.from_date} to {leaveRequest.to_date}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <span className="text-slate-500 font-medium block mb-1">Reason for Absence:</span>
            <p className="font-medium text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
              "{leaveRequest.reason}"
            </p>
          </div>
        </div>

        {/* Optional Review Remarks */}
        <Input
          label="Review Remarks / Admin Note (Optional)"
          placeholder="e.g. Approved medical leave with doctor's certificate"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={() => handleSubmit("rejected")}
            disabled={isSaving}
          >
            Reject Leave
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => handleSubmit("approved")}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Approve Leave
          </Button>
        </div>
      </div>
    </Modal>
  );
};
