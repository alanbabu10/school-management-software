"use client";

import React, { useState, useMemo } from "react";
import { Plus, CalendarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LeaveFilters } from "@/components/leave/LeaveFilters";
import { LeaveTable } from "@/components/leave/LeaveTable";
import { LeaveForm } from "@/components/leave/LeaveForm";
import { ReviewModal } from "@/components/leave/ReviewModal";
import { LeaveRequestItem, LeaveRequestFormData, ReviewLeaveFormData, StudentLeaveOption } from "@/types/leave";
import { ClassOption } from "@/types/student";
import { leaveService } from "@/services/leaveService";

export interface LeaveClientProps {
  initialRequests: LeaveRequestItem[];
  classesList: ClassOption[];
  studentsList: StudentLeaveOption[];
  currentUserId?: string;
}

export default function LeaveClient({
  initialRequests = [],
  classesList = [],
  studentsList = [],
  currentUserId,
}: LeaveClientProps) {
  const [requests, setRequests] = useState<LeaveRequestItem[]>(initialRequests);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedClass, setSelectedClass] = useState("ALL");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState<LeaveRequestItem | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<LeaveRequestItem | null>(null);

  // Status state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const refreshRequests = async () => {
    setIsLoading(true);
    try {
      const data = await leaveService.fetchLeaveRequests();
      setRequests(data);
    } catch (err) {
      console.error("Error refreshing leave requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Status filter
      if (selectedStatus !== "ALL") {
        if (r.status !== selectedStatus) {
          return false;
        }
      }

      // Class filter
      if (selectedClass !== "ALL") {
        if (String(r.students?.class_id) !== String(selectedClass)) {
          return false;
        }
      }

      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const studentMatch = r.students?.full_name?.toLowerCase().includes(query);
        const admMatch = r.students?.admission_number?.toLowerCase().includes(query);
        const reasonMatch = r.reason?.toLowerCase().includes(query);

        if (!studentMatch && !admMatch && !reasonMatch) {
          return false;
        }
      }

      return true;
    });
  }, [requests, selectedStatus, selectedClass, searchTerm]);

  // Handle Admin Submit Leave Request (On Behalf)
  const handleCreateLeaveSubmit = async (formData: LeaveRequestFormData) => {
    setIsSaving(true);
    try {
      await leaveService.createLeaveRequest(formData, currentUserId);
      showToast("Leave request submitted successfully!");
      setIsFormOpen(false);
      await refreshRequests();
    } catch (err: any) {
      console.error("Create leave request error:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Quick Approve
  const handleQuickApprove = async (request: LeaveRequestItem) => {
    setIsSaving(true);
    try {
      await leaveService.reviewLeaveRequest(
        {
          request_id: request.id,
          status: "approved",
          remarks: "Approved by Admin",
        },
        currentUserId
      );
      showToast("Leave request approved!");
      await refreshRequests();
    } catch (err: any) {
      console.error("Quick approve error:", err);
      showToast(err.message || "Failed to approve leave request.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Quick Reject
  const handleQuickReject = async (request: LeaveRequestItem) => {
    setIsSaving(true);
    try {
      await leaveService.reviewLeaveRequest(
        {
          request_id: request.id,
          status: "rejected",
          remarks: "Rejected by Admin",
        },
        currentUserId
      );
      showToast("Leave request rejected.");
      await refreshRequests();
    } catch (err: any) {
      console.error("Quick reject error:", err);
      showToast(err.message || "Failed to reject leave request.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Detailed Review Submit (with remarks)
  const handleReviewSubmit = async (data: ReviewLeaveFormData) => {
    setIsSaving(true);
    try {
      await leaveService.reviewLeaveRequest(data, currentUserId);
      showToast(`Leave request ${data.status} successfully!`);
      setReviewingRequest(null);
      await refreshRequests();
    } catch (err: any) {
      console.error("Review leave error:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Confirm Delete Request
  const handleConfirmDelete = async () => {
    if (!deletingRequest) return;
    setIsDeleting(true);
    try {
      await leaveService.deleteLeaveRequest(deletingRequest.id);
      showToast("Leave request deleted.");
      setDeletingRequest(null);
      await refreshRequests();
    } catch (err: any) {
      console.error("Delete leave error:", err);
      showToast(err.message || "Failed to delete leave request.");
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
            <CalendarOff className="w-5 h-5 text-indigo-600" />
            Student Leave Requests
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and approve leave applications submitted by parents or create leave entries on behalf of students
          </p>
        </div>

        <Button onClick={() => setIsFormOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Submit Leave Request
        </Button>
      </div>

      {/* Filters Bar */}
      <LeaveFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        classesList={classesList}
      />

      {/* Leave Requests Table */}
      <LeaveTable
        requests={filteredRequests}
        onQuickApprove={handleQuickApprove}
        onQuickReject={handleQuickReject}
        onOpenReview={(r) => setReviewingRequest(r)}
        onDeleteRequest={(r) => setDeletingRequest(r)}
        isLoading={isLoading}
      />

      {/* Submit Leave Request Modal */}
      <LeaveForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateLeaveSubmit}
        classesList={classesList}
        studentsList={studentsList}
        isSaving={isSaving}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={Boolean(reviewingRequest)}
        onClose={() => setReviewingRequest(null)}
        onSubmit={handleReviewSubmit}
        leaveRequest={reviewingRequest}
        isSaving={isSaving}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingRequest)}
        onClose={() => setDeletingRequest(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Leave Request"
        description={`Are you sure you want to delete the leave request for ${deletingRequest?.students?.full_name || "Student"}? This action cannot be undone.`}
        confirmText="Delete Request"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
