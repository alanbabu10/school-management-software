"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeeItem, PaymentFormData } from "@/types/fee";
import { AlertCircle, CreditCard, DollarSign, CheckCircle2 } from "lucide-react";

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData, totalAmount: number) => Promise<void>;
  feeRecord: FeeItem | null;
  isSaving: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  feeRecord,
  isSaving,
}) => {
  const [paidAmount, setPaidAmount] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && feeRecord) {
      // Default paid amount to total amount (or current paid amount if partially paid)
      setPaidAmount(String(feeRecord.amount));
      setPaidDate(new Date().toISOString().split("T")[0]);
      setRemarks(feeRecord.remarks || "");
      setError(null);
    }
  }, [isOpen, feeRecord]);

  const totalAmount = feeRecord ? Number(feeRecord.amount) : 0;
  const numericPaid = Number(paidAmount) || 0;

  // Live status preview badge
  const previewStatus = useMemo(() => {
    if (numericPaid >= totalAmount) {
      return { label: "PAID IN FULL", variant: "success" as const };
    } else if (numericPaid > 0) {
      return { label: "PARTIAL PAYMENT", variant: "warning" as const };
    } else {
      return { label: "PENDING", variant: "primary" as const };
    }
  }, [numericPaid, totalAmount]);

  const remainingBalance = Math.max(0, totalAmount - numericPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeRecord) return;
    if (paidAmount === "" || isNaN(numericPaid) || numericPaid < 0) {
      setError("Please enter a valid paid amount.");
      return;
    }
    if (!paidDate) {
      setError("Please select a payment date.");
      return;
    }

    try {
      setError(null);
      await onSubmit(
        {
          fee_id: feeRecord.id,
          paid_amount: numericPaid,
          paid_date: paidDate,
          remarks: remarks,
        },
        totalAmount
      );
    } catch (err: any) {
      setError(err.message || "Failed to record payment.");
    }
  };

  if (!feeRecord) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Fee Payment"
      subtitle={`Record payment collection for ${feeRecord.students?.full_name || "Student"}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Invoice Summary Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Student Name:</span>
            <span className="font-bold text-slate-900">{feeRecord.students?.full_name}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Fee Type:</span>
            <span className="font-bold text-slate-900">{feeRecord.fee_type}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Billed Amount:</span>
            <span className="font-bold text-slate-900 text-sm">
              ₹{totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
            <span className="text-slate-500 font-medium">Resulting Status:</span>
            <Badge variant={previewStatus.variant}>{previewStatus.label}</Badge>
          </div>
        </div>

        {/* Quick Amount Presets */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaidAmount(String(totalAmount))}
            className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition"
          >
            Pay Full Amount (₹{totalAmount.toLocaleString("en-IN")})
          </button>
        </div>

        {/* Paid Amount Input */}
        <Input
          type="number"
          label="Paid Amount (₹) *"
          placeholder="e.g. 15000"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
          required
        />

        {remainingBalance > 0 && numericPaid > 0 && (
          <p className="text-xs text-amber-700 font-medium bg-amber-50 p-2 rounded-xl border border-amber-100">
            ⚠️ Remaining Balance after this payment will be:{" "}
            <span className="font-bold">₹{remainingBalance.toLocaleString("en-IN")}</span>
          </p>
        )}

        {/* Payment Date */}
        <Input
          type="date"
          label="Payment Date *"
          value={paidDate}
          onChange={(e) => setPaidDate(e.target.value)}
          required
        />

        {/* Payment Receipt / Remarks */}
        <Input
          label="Payment Reference / Remarks (Optional)"
          placeholder="e.g. Paid via UPI / Cheque #1042"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Record Payment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
