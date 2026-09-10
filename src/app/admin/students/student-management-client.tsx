"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Student, ClassOption, StudentFormData } from "@/types/student";
import { studentService } from "@/services/studentService";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/toast";
import { StudentFilters } from "@/components/students/StudentFilters";
import { StudentTable } from "@/components/students/StudentTable";
import { StudentForm } from "@/components/students/StudentForm";

interface StudentManagementClientProps {
  initialStudents: Student[];
  classesList: ClassOption[];
}

export default function StudentManagementClient({
  initialStudents,
  classesList,
}: StudentManagementClientProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState<StudentFormData>({
    admission_number: "",
    full_name: "",
    date_of_birth: "",
    gender: "male",
    class_id: "",
    parent_name: "",
    parent_phone: "",
    phone: "",
    address: "",
    status: "active",
  });

  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete Dialog State
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      admission_number: "",
      full_name: "",
      date_of_birth: "",
      gender: "male",
      class_id: classesList[0]?.id || "",
      parent_name: "",
      parent_phone: "",
      phone: "",
      address: "",
      status: "active",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      admission_number: student.admission_number || "",
      full_name: student.full_name || "",
      date_of_birth: student.date_of_birth || "",
      gender: student.gender || "male",
      class_id: student.class_id || "",
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || "",
      phone: student.phone || "",
      address: student.address || "",
      status: student.status || "active",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormError("");
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.admission_number.trim()) {
      setFormError("Admission Number is required.");
      return;
    }
    if (!formData.full_name.trim()) {
      setFormError("Full Name is required.");
      return;
    }

    const duplicate = students.find(
      (s) =>
        s.admission_number.trim().toLowerCase() ===
          formData.admission_number.trim().toLowerCase() &&
        s.id !== editingStudent?.id
    );

    if (duplicate) {
      setFormError(`Admission Number "${formData.admission_number}" already exists.`);
      return;
    }

    setIsSaving(true);

    try {
      const studentPayload = {
        admission_number: formData.admission_number.trim(),
        full_name: formData.full_name.trim(),
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        class_id: formData.class_id || null,
        parent_name: formData.parent_name.trim() || null,
        parent_phone: formData.parent_phone.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        status: formData.status || "active",
      };

      if (editingStudent) {
        const updated = await studentService.updateStudent(editingStudent.id, studentPayload);
        setStudents((prev) =>
          prev.map((s) => (s.id === editingStudent.id ? updated : s))
        );
        showToast("Student details updated successfully!");
      } else {
        const created = await studentService.createStudent(studentPayload);
        setStudents((prev) => [created, ...prev]);
        showToast("New student registered successfully!");
      }

      closeModal();
    } catch (err: unknown) {
      console.error("Save error:", err);
      const errorObj = err as { message?: string };
      setFormError(errorObj.message || "Failed to save student details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);

    try {
      await studentService.deleteStudent(deletingStudent.id);
      setStudents((prev) => prev.filter((s) => s.id !== deletingStudent.id));
      showToast(`Student "${deletingStudent.full_name}" deleted.`);
      setDeletingStudent(null);
    } catch (err: unknown) {
      console.error("Delete error:", err);
      const errorObj = err as { message?: string };
      showToast(errorObj.message || "Failed to delete student.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.parent_name && s.parent_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass =
      selectedClass === "ALL" ||
      (s.class_id != null && String(s.class_id) === String(selectedClass));

    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />

      <PageHeader
        title="Student Directory"
        description="Manage student enrollments, profiles, and contact details"
        action={
          <Button onClick={openAddModal} icon={<UserPlus className="w-4 h-4" />}>
            Add New Student
          </Button>
        }
      />

      <StudentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        classesList={classesList}
      />

      <StudentTable
        students={filteredStudents}
        onEdit={openEditModal}
        onDelete={setDeletingStudent}
      />

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingStudent ? "Edit Student Record" : "Register New Student"}
        subtitle="Fill in student and guardian details"
        maxWidth="2xl"
      >
        <StudentForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSaveStudent}
          onCancel={closeModal}
          classesList={classesList}
          isSaving={isSaving}
          formError={formError}
          isEditMode={!!editingStudent}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDeleteStudent}
        title="Confirm Student Deletion"
        description={`Are you sure you want to delete student "${deletingStudent?.full_name}" (Admission No: ${deletingStudent?.admission_number})? This action cannot be undone.`}
        confirmText="Delete Student"
        isLoading={isDeleting}
      />
    </div>
  );
}
