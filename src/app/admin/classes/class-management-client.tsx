"use client";

import { useState } from "react";
import { Plus, Search, Filter, AlertTriangle } from "lucide-react";
import { ClassItem, ClassFormData } from "@/types/class";
import { TeacherOption } from "@/types/teacher";
import { classService } from "@/services/classService";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";
import { ClassCardGrid } from "@/components/classes/ClassCardGrid";
import { ClassForm } from "@/components/classes/ClassForm";

interface ClassManagementClientProps {
  initialClasses: ClassItem[];
  teachersList: TeacherOption[];
  academicYearsList: string[];
}

export default function ClassManagementClient({
  initialClasses,
  teachersList,
  academicYearsList,
}: ClassManagementClientProps) {
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<ClassFormData>({
    name: "",
    division: "",
    academic_year: "2026-2027",
    class_teacher_id: "",
  });

  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deletingClass, setDeletingClass] = useState<ClassItem | null>(null);
  const [checkingStudents, setCheckingStudents] = useState(false);
  const [assignedStudentsCount, setAssignedStudentsCount] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({
      name: "",
      division: "",
      academic_year: "2026-2027",
      class_teacher_id: "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (cls: ClassItem) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name || "",
      division: cls.division || "",
      academic_year: cls.academic_year || "2026-2027",
      class_teacher_id: cls.class_teacher_id || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    setFormError("");
  };

  const openDeleteModal = async (cls: ClassItem) => {
    setDeletingClass(cls);
    setCheckingStudents(true);
    setAssignedStudentsCount(null);

    try {
      const count = await classService.getAssignedStudentsCount(cls.id);
      setAssignedStudentsCount(count);
    } catch (err) {
      console.error("Error checking assigned students:", err);
      setAssignedStudentsCount(0);
    } finally {
      setCheckingStudents(false);
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Class Name is required.");
      return;
    }

    setIsSaving(true);

    try {
      const selectedTeacher = teachersList.find(
        (t) => t.id === formData.class_teacher_id
      );

      if (editingClass) {
        const updatePayload = {
          name: formData.name.trim(),
          division: formData.division.trim() || null,
          academic_year: formData.academic_year || "2026-2027",
          class_teacher_id: formData.class_teacher_id || null,
        };

        const updated = await classService.updateClass(editingClass.id, updatePayload);
        const updatedItem: ClassItem = {
          ...updated,
          teachers: selectedTeacher
            ? { id: selectedTeacher.id, full_name: selectedTeacher.full_name, employee_id: selectedTeacher.employee_id || undefined }
            : null,
        };

        setClasses((prev) =>
          prev.map((c) => (c.id === editingClass.id ? updatedItem : c))
        );
        showToast("Class details updated successfully!");
      } else {
        const insertPayload = {
          name: formData.name.trim(),
          division: formData.division.trim() || null,
          academic_year: formData.academic_year || "2026-2027",
          class_teacher_id: formData.class_teacher_id || null,
        };

        const created = await classService.createClass(insertPayload);
        const newItem: ClassItem = {
          ...created,
          teachers: selectedTeacher
            ? { id: selectedTeacher.id, full_name: selectedTeacher.full_name, employee_id: selectedTeacher.employee_id || undefined }
            : null,
        };

        setClasses((prev) => [newItem, ...prev]);
        showToast("New class created successfully!");
      }

      closeModal();
    } catch (err: unknown) {
      console.error("Save class error:", err);
      const errorObj = err as { message?: string };
      setFormError(errorObj.message || "Failed to save class record.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!deletingClass) return;
    setIsDeleting(true);

    try {
      await classService.deleteClass(deletingClass.id);
      setClasses((prev) => prev.filter((c) => c.id !== deletingClass.id));
      showToast(`Class "${deletingClass.name}" deleted.`);
      setDeletingClass(null);
    } catch (err: unknown) {
      console.error("Delete class error:", err);
      const errorObj = err as { message?: string };
      showToast(errorObj.message || "Failed to delete class.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.division && c.division.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.teachers?.full_name &&
        c.teachers.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesYear =
      selectedAcademicYear === "ALL" || c.academic_year === selectedAcademicYear;

    return matchesSearch && matchesYear;
  });

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />

      <PageHeader
        title="Classes & Divisions"
        description="Manage class structures, academic years, and assigned class teachers"
        action={
          <Button onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
            Add New Class
          </Button>
        }
      />

      <Card padding="sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by class name, division, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="w-full sm:w-56 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Academic Years</option>
              {academicYearsList.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <ClassCardGrid
        classes={filteredClasses}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingClass ? "Edit Class Details" : "Create New Class"}
        subtitle="Define class name, division, and assigned teacher"
        maxWidth="md"
      >
        <ClassForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSaveClass}
          onCancel={closeModal}
          teachersList={teachersList}
          isSaving={isSaving}
          formError={formError}
          isEditMode={!!editingClass}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingClass}
        onClose={() => setDeletingClass(null)}
        title="Delete Class"
        maxWidth="md"
      >
        <div className="space-y-4">
          {checkingStudents ? (
            <p className="text-sm text-slate-500">Checking assigned students...</p>
          ) : assignedStudentsCount && assignedStudentsCount > 0 ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Cannot Delete Class!</p>
                <p className="mt-1">
                  This class currently has <strong>{assignedStudentsCount}</strong> student(s) assigned to it. Reassign or remove students before deleting.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Are you sure you want to delete class{" "}
              <strong className="text-slate-900">{deletingClass?.name} {deletingClass?.division}</strong>? Action cannot be undone.
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setDeletingClass(null)}>
              Cancel
            </Button>
            {(!assignedStudentsCount || assignedStudentsCount === 0) && (
              <Button variant="danger" onClick={handleDeleteClass} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Class"}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
