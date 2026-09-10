"use client";

import { useState } from "react";
import { UserPlus, Search, Filter } from "lucide-react";
import { Teacher, TeacherFormData } from "@/types/teacher";
import { teacherService } from "@/services/teacherService";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/toast";
import { TeacherTable } from "@/components/teachers/TeacherTable";
import { TeacherForm } from "@/components/teachers/TeacherForm";

interface TeacherManagementClientProps {
  initialTeachers: Teacher[];
  subjectsList?: string[];
}

export default function TeacherManagementClient({
  initialTeachers,
  subjectsList = [],
}: TeacherManagementClientProps) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [formData, setFormData] = useState<TeacherFormData>({
    employee_id: "",
    full_name: "",
    phone: "",
    subject: "",
    joining_date: "",
    status: "active",
  });

  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Deactivate / Toggle Dialog State
  const [togglingTeacher, setTogglingTeacher] = useState<Teacher | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      employee_id: "",
      full_name: "",
      phone: "",
      subject: subjectsList[0] || "",
      joining_date: new Date().toISOString().split("T")[0],
      status: "active",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      employee_id: teacher.employee_id || "",
      full_name: teacher.full_name || "",
      phone: teacher.phone || "",
      subject: teacher.subject || "",
      joining_date: teacher.joining_date || "",
      status: teacher.status || "active",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
    setFormError("");
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.employee_id.trim()) {
      setFormError("Employee ID is required.");
      return;
    }
    if (!formData.full_name.trim()) {
      setFormError("Full Name is required.");
      return;
    }

    const duplicate = teachers.find(
      (t) =>
        t.employee_id.trim().toLowerCase() ===
          formData.employee_id.trim().toLowerCase() &&
        t.id !== editingTeacher?.id
    );

    if (duplicate) {
      setFormError(`Employee ID "${formData.employee_id}" already exists.`);
      return;
    }

    setIsSaving(true);

    try {
      if (editingTeacher) {
        const updated = await teacherService.updateTeacher(editingTeacher.id, {
          employee_id: formData.employee_id.trim(),
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null,
          subject: formData.subject.trim() || null,
          joining_date: formData.joining_date || null,
          status: formData.status || "active",
        });

        setTeachers((prev) =>
          prev.map((t) => (t.id === editingTeacher.id ? updated : t))
        );
        showToast("Teacher profile updated successfully!");
      } else {
        const created = await teacherService.createTeacher({
          employee_id: formData.employee_id.trim(),
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null,
          subject: formData.subject.trim() || null,
          joining_date: formData.joining_date || null,
          status: formData.status || "active",
        });

        setTeachers((prev) => [created, ...prev]);
        showToast("New teacher registered successfully!");
      }

      closeModal();
    } catch (err: unknown) {
      console.error("Save teacher error:", err);
      const errorObj = err as { message?: string };
      setFormError(errorObj.message || "Failed to save teacher record.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!togglingTeacher) return;
    setIsToggling(true);

    const newStatus = togglingTeacher.status === "active" ? "inactive" : "active";

    try {
      await teacherService.toggleTeacherStatus(togglingTeacher.id, newStatus);
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === togglingTeacher.id ? { ...t, status: newStatus } : t
        )
      );
      showToast(`Teacher status set to ${newStatus}.`);
      setTogglingTeacher(null);
    } catch (err: unknown) {
      console.error("Toggle error:", err);
      const errorObj = err as { message?: string };
      showToast(errorObj.message || "Failed to update teacher status.", "error");
    } finally {
      setIsToggling(false);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />

      <PageHeader
        title="Faculty & Teachers"
        description="Manage school teachers, subject assignments, and employment status"
        action={
          <Button onClick={openAddModal} icon={<UserPlus className="w-4 h-4" />}>
            Add New Teacher
          </Button>
        }
      />

      <Card padding="sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, employee ID, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="w-full sm:w-48 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </Card>

      <TeacherTable
        teachers={filteredTeachers}
        onEdit={openEditModal}
        onToggleStatus={setTogglingTeacher}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTeacher ? "Edit Teacher Profile" : "Register New Teacher"}
        subtitle="Enter teacher employment information"
        maxWidth="lg"
      >
        <TeacherForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSaveTeacher}
          onCancel={closeModal}
          isSaving={isSaving}
          formError={formError}
          isEditMode={!!editingTeacher}
        />
      </Modal>

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!togglingTeacher}
        onClose={() => setTogglingTeacher(null)}
        onConfirm={handleToggleStatus}
        title="Toggle Account Status"
        description={`Are you sure you want to change the status of ${togglingTeacher?.full_name} to ${togglingTeacher?.status === "active" ? "inactive" : "active"}?`}
        confirmText="Confirm Change"
        variant="primary"
        isLoading={isToggling}
      />
    </div>
  );
}
