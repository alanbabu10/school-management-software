"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { UserPlus, Users, AlertTriangle } from "lucide-react";
import { Student, ClassOption, StudentFormData } from "@/types/student";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";
import { StudentFilters } from "@/components/students/StudentFilters";
import { StudentTable } from "@/components/students/StudentTable";
import { StudentForm } from "@/components/students/StudentForm";

interface TeacherStudentsClientProps {
  initialStudents: Student[];
  assignedClasses: ClassOption[];
}

export function TeacherStudentsClient({
  initialStudents,
  assignedClasses,
}: TeacherStudentsClientProps) {
  const searchParams = useSearchParams();
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
    class_id: assignedClasses[0]?.id ? String(assignedClasses[0].id) : "",
    parent_name: "",
    parent_phone: "",
    parent_password: "",
    phone: "",
    address: "",
    status: "active",
  });

  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Check URL query param `?add=true` to auto-open Add Student modal
  useEffect(() => {
    if (searchParams.get("add") === "true" && assignedClasses.length > 0) {
      openAddModal();
    }
  }, [searchParams, assignedClasses]);

  const openAddModal = () => {
    setEditingStudent(null);
    const defaultClassId =
      selectedClass !== "ALL"
        ? selectedClass
        : assignedClasses[0]?.id
        ? String(assignedClasses[0].id)
        : "";

    setFormData({
      admission_number: "",
      full_name: "",
      date_of_birth: "",
      gender: "male",
      class_id: defaultClassId,
      parent_name: "",
      parent_phone: "",
      parent_password: "",
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
      class_id: student.class_id ? String(student.class_id) : "",
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || "",
      parent_password: "", // Left blank unless teacher wants to reset
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

    if (!editingStudent && !formData.admission_number.trim()) {
      setFormError("Admission Number is required.");
      return;
    }
    if (!formData.full_name.trim()) {
      setFormError("Full Name is required.");
      return;
    }
    if (!formData.class_id) {
      setFormError("Please select an assigned class.");
      return;
    }

    // Client-side duplicate check
    if (!editingStudent) {
      const duplicate = students.find(
        (s) =>
          s.admission_number.trim().toLowerCase() ===
          formData.admission_number.trim().toLowerCase()
      );
      if (duplicate) {
        setFormError(`Admission Number "${formData.admission_number}" is already registered.`);
        return;
      }
    }

    setIsSaving(true);

    try {
      if (editingStudent) {
        // Teacher editing: safe fields only
        const res = await fetch("/api/teacher/students", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingStudent.id,
            full_name: formData.full_name,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            parent_name: formData.parent_name,
            parent_phone: formData.parent_phone,
            parent_password: formData.parent_password,
            phone: formData.phone,
            address: formData.address,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to update student details.");
        }

        setStudents((prev) =>
          prev.map((s) => (s.id === editingStudent.id ? data.student : s))
        );
        showToast("Student details updated successfully!");
      } else {
        // Teacher adding new student
        const res = await fetch("/api/teacher/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admission_number: formData.admission_number,
            full_name: formData.full_name,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            class_id: formData.class_id,
            parent_name: formData.parent_name,
            parent_phone: formData.parent_phone,
            parent_password: formData.parent_password,
            phone: formData.phone,
            address: formData.address,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to register student.");
        }

        setStudents((prev) => [data.student, ...prev]);
        showToast("New student registered successfully!");
      }

      closeModal();
    } catch (err: any) {
      console.error("Save student error:", err);
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter students based on search query and selected class
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.parent_name && s.parent_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.parent_phone && s.parent_phone.includes(searchTerm));

    const matchesClass =
      selectedClass === "ALL" || String(s.class_id) === selectedClass;

    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage("")}
        />
      )}

      <PageHeader
        title="Class Students"
        description="View and manage students in your assigned classes"
        action={
          <Button
            onClick={openAddModal}
            className="flex items-center gap-2"
            disabled={assignedClasses.length === 0}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </Button>
        }
      />

      {assignedClasses.length === 0 ? (
        <div className="p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-amber-900 mb-1">
            No Assigned Classes Found
          </h3>
          <p className="text-sm text-amber-700 max-w-md mx-auto">
            You have not been assigned as a Class Teacher or Subject Teacher for any
            classes yet. Please reach out to the school administrator to assign your
            classes.
          </p>
        </div>
      ) : (
        <>
          <StudentFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
            classesList={assignedClasses}
          />

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <StudentTable
              students={filteredStudents}
              onEdit={openEditModal}
              hideDelete={true}
            />

            {filteredStudents.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-base font-semibold text-slate-700">No students found</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  {searchTerm || selectedClass !== "ALL"
                    ? "No students match your current filter or search criteria."
                    : "No students have been enrolled in your assigned classes yet."}
                </p>
                {students.length === 0 && (
                  <Button
                    onClick={openAddModal}
                    variant="secondary"
                    className="mt-4 inline-flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register First Student</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingStudent ? `Edit Student — ${editingStudent.full_name}` : "Register New Student"}
        subtitle={
          editingStudent
            ? "Update student or parent contact details. Critical admission fields are read-only."
            : "Add a new student to one of your assigned classes."
        }
      >
        <StudentForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSaveStudent}
          onCancel={closeModal}
          classesList={assignedClasses}
          isSaving={isSaving}
          formError={formError}
          isEditMode={!!editingStudent}
          disableAdmissionFields={!!editingStudent}
          lockClassId={!editingStudent ? assignedClasses.length <= 1 : true}
        />
      </Modal>
    </div>
  );
}
