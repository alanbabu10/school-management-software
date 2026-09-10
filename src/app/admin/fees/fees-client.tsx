"use client";

import React, { useState, useMemo } from "react";
import { Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FeeStatCards } from "@/components/fees/FeeStatCards";
import { FeeFilters } from "@/components/fees/FeeFilters";
import { FeeTable } from "@/components/fees/FeeTable";
import { FeeForm } from "@/components/fees/FeeForm";
import { PaymentModal } from "@/components/fees/PaymentModal";
import { FeeItem, FeeFormData, PaymentFormData, StudentFeeOption } from "@/types/fee";
import { ClassOption } from "@/types/student";
import { feeService } from "@/services/feeService";

export interface FeesClientProps {
  initialFees: FeeItem[];
  classesList: ClassOption[];
  studentsList: StudentFeeOption[];
}

export default function FeesClient({
  initialFees = [],
  classesList = [],
  studentsList = [],
}: FeesClientProps) {
  const [feeRecords, setFeeRecords] = useState<FeeItem[]>(initialFees);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedFeeType, setSelectedFeeType] = useState("ALL");

  // Modals state
  const [isFeeFormOpen, setIsFeeFormOpen] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<FeeItem | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<FeeItem | null>(null);

  // Status state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const refreshFees = async () => {
    setIsLoading(true);
    try {
      const data = await feeService.fetchFees();
      setFeeRecords(data);
    } catch (err) {
      console.error("Error refreshing fees:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Distinct list of fee types for filter dropdown
  const feeTypesList = useMemo(() => {
    const set = new Set<string>();
    feeRecords.forEach((f) => {
      if (f.fee_type) set.add(f.fee_type);
    });
    return Array.from(set);
  }, [feeRecords]);

  // Filtered fee records
  const filteredRecords = useMemo(() => {
    return feeRecords.filter((f) => {
      // Class filter
      if (selectedClass !== "ALL") {
        if (String(f.students?.class_id) !== String(selectedClass)) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== "ALL") {
        if (f.status !== selectedStatus) {
          return false;
        }
      }

      // Fee Type filter
      if (selectedFeeType !== "ALL") {
        if (f.fee_type !== selectedFeeType) {
          return false;
        }
      }

      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const studentMatch = f.students?.full_name?.toLowerCase().includes(query);
        const admMatch = f.students?.admission_number?.toLowerCase().includes(query);
        const feeTypeMatch = f.fee_type?.toLowerCase().includes(query);
        const remarksMatch = f.remarks?.toLowerCase().includes(query);

        if (!studentMatch && !admMatch && !feeTypeMatch && !remarksMatch) {
          return false;
        }
      }

      return true;
    });
  }, [feeRecords, selectedClass, selectedStatus, selectedFeeType, searchTerm]);

  // Summary Metrics
  const totalExpected = useMemo(
    () => filteredRecords.reduce((sum, r) => sum + Number(r.amount || 0), 0),
    [filteredRecords]
  );
  const totalCollected = useMemo(
    () => filteredRecords.reduce((sum, r) => sum + Number(r.paid_amount || 0), 0),
    [filteredRecords]
  );
  const totalPending = Math.max(0, totalExpected - totalCollected);
  const overdueCount = useMemo(
    () => filteredRecords.filter((r) => r.status === "overdue").length,
    [filteredRecords]
  );

  // Handle Add Fee Submit (Single or Bulk)
  const handleCreateFeeSubmit = async (formData: FeeFormData) => {
    setIsSaving(true);
    try {
      let targetStudents: Array<{ id: string | number }> = [];

      if (formData.assignment_type === "bulk" && formData.class_id) {
        targetStudents = studentsList.filter(
          (s) => String(s.class_id) === String(formData.class_id)
        );
      }

      const count = await feeService.createFeeRecords(formData, targetStudents);
      showToast(
        count > 1
          ? `Successfully assigned fee to ${count} students in class!`
          : "Fee invoice created successfully!"
      );

      setIsFeeFormOpen(false);
      await refreshFees();
    } catch (err: any) {
      console.error("Create fee error:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Record Payment Submit
  const handlePaymentSubmit = async (formData: PaymentFormData, totalAmount: number) => {
    setIsSaving(true);
    try {
      await feeService.recordPayment(formData, totalAmount);
      showToast("Payment recorded successfully!");
      setPaymentRecord(null);
      await refreshFees();
    } catch (err: any) {
      console.error("Record payment error:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Confirm Delete Fee
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setIsDeleting(true);
    try {
      await feeService.deleteFeeRecord(deletingRecord.id);
      showToast("Fee record deleted successfully.");
      setDeletingRecord(null);
      await refreshFees();
    } catch (err: any) {
      console.error("Delete fee error:", err);
      showToast(err.message || "Failed to delete fee record.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Fee Management & Billing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor student fee collections, assign term tuition/bus fees, and record payments
          </p>
        </div>

        <Button onClick={() => setIsFeeFormOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Assign / Add Fee
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <FeeStatCards
        totalExpected={totalExpected}
        totalCollected={totalCollected}
        totalPending={totalPending}
        overdueCount={overdueCount}
      />

      {/* Filters Bar */}
      <FeeFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedFeeType={selectedFeeType}
        onFeeTypeChange={setSelectedFeeType}
        classesList={classesList}
        feeTypesList={feeTypesList}
      />

      {/* Fees Table */}
      <FeeTable
        feeRecords={filteredRecords}
        onRecordPayment={(f) => setPaymentRecord(f)}
        onDeleteFee={(f) => setDeletingRecord(f)}
        isLoading={isLoading}
      />

      {/* Create / Assign Fee Form Modal */}
      <FeeForm
        isOpen={isFeeFormOpen}
        onClose={() => setIsFeeFormOpen(false)}
        onSubmit={handleCreateFeeSubmit}
        classesList={classesList}
        studentsList={studentsList}
        isSaving={isSaving}
      />

      {/* Record Payment Modal */}
      <PaymentModal
        isOpen={Boolean(paymentRecord)}
        onClose={() => setPaymentRecord(null)}
        onSubmit={handlePaymentSubmit}
        feeRecord={paymentRecord}
        isSaving={isSaving}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingRecord)}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Fee Record"
        description={`Are you sure you want to delete the ${deletingRecord?.fee_type} record for ${deletingRecord?.students?.full_name || "Student"}? This action cannot be undone.`}
        confirmText="Delete Record"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
