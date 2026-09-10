"use client";

import React, { useState, useMemo } from "react";
import { Megaphone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { NoticeFilters } from "@/components/notices/NoticeFilters";
import { NoticeTable } from "@/components/notices/NoticeTable";
import { NoticeForm } from "@/components/notices/NoticeForm";
import { NoticeItem, NoticeFormData } from "@/types/notice";
import { ClassOption } from "@/types/student";
import { noticeService } from "@/services/noticeService";

export interface NoticesClientProps {
  initialNotices: NoticeItem[];
  classesList: ClassOption[];
  currentUserId?: string;
}

export default function NoticesClient({
  initialNotices = [],
  classesList = [],
  currentUserId,
}: NoticesClientProps) {
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedClass, setSelectedClass] = useState("ALL");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [deletingNotice, setDeletingNotice] = useState<NoticeItem | null>(null);

  // Status state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const refreshNotices = async () => {
    setIsLoading(true);
    try {
      const data = await noticeService.fetchNotices();
      setNotices(data);
    } catch (err) {
      console.error("Error refreshing notices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered notices
  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      // Role filter
      if (selectedRole !== "ALL") {
        if (n.target_role?.toLowerCase() !== selectedRole.toLowerCase()) {
          return false;
        }
      }

      // Class filter
      if (selectedClass !== "ALL") {
        if (String(n.class_id) !== String(selectedClass)) {
          return false;
        }
      }

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const titleMatch = n.title?.toLowerCase().includes(query);
        const contentMatch = n.content?.toLowerCase().includes(query);
        const classMatch = n.classes?.name?.toLowerCase().includes(query);

        if (!titleMatch && !contentMatch && !classMatch) {
          return false;
        }
      }

      return true;
    });
  }, [notices, selectedRole, selectedClass, searchTerm]);

  // Handle Add / Edit Notice submit
  const handleFormSubmit = async (formData: NoticeFormData) => {
    setIsSaving(true);
    try {
      if (editingNotice) {
        await noticeService.updateNotice(editingNotice.id, formData);
        showToast("Notice updated successfully!");
      } else {
        await noticeService.createNotice(formData, currentUserId);
        showToast("Notice published successfully!");
      }
      setIsFormOpen(false);
      setEditingNotice(null);
      await refreshNotices();
    } catch (err: any) {
      console.error("Save notice error:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Open Create Modal
  const handleOpenCreate = () => {
    setEditingNotice(null);
    setIsFormOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setIsFormOpen(true);
  };

  // Handle Open Delete Modal
  const handleOpenDelete = (notice: NoticeItem) => {
    setDeletingNotice(notice);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingNotice) return;
    setIsDeleting(true);
    try {
      await noticeService.deleteNotice(deletingNotice.id);
      showToast("Notice deleted successfully.");
      setDeletingNotice(null);
      await refreshNotices();
    } catch (err: any) {
      console.error("Delete notice error:", err);
      showToast(err.message || "Failed to delete notice.");
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
            <Megaphone className="w-5 h-5 text-indigo-600" />
            Notices & Announcements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast official circulars to students, teachers, parents, or specific classes
          </p>
        </div>

        <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
          Publish Notice
        </Button>
      </div>

      {/* Filters Bar */}
      <NoticeFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        classesList={classesList}
      />

      {/* Notices Table */}
      <NoticeTable
        notices={filteredNotices}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        isLoading={isLoading}
      />

      {/* Notice Form Modal */}
      <NoticeForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingNotice(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingNotice}
        classesList={classesList}
        isSaving={isSaving}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingNotice)}
        onClose={() => setDeletingNotice(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Notice"
        description={`Are you sure you want to delete "${deletingNotice?.title}"? This action cannot be undone.`}
        confirmText="Delete Notice"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
