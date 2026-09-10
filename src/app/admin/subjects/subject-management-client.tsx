"use client";

import { useState } from "react";
import { Plus, Search, AlertCircle, Trash } from "lucide-react";
import { SubjectItem, ClassSubjectAssignment } from "@/types/subject";
import { ClassOption } from "@/types/student";
import { TeacherOption } from "@/types/teacher";
import { subjectService } from "@/services/subjectService";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/toast";
import { SubjectTable } from "@/components/subjects/SubjectTable";
import { SubjectForm } from "@/components/subjects/SubjectForm";

interface SubjectManagementClientProps {
  initialSubjects: SubjectItem[];
  classesList: ClassOption[];
  teachersList: TeacherOption[];
  initialAssignments: ClassSubjectAssignment[];
}

export default function SubjectManagementClient({
  initialSubjects,
  classesList,
  teachersList,
  initialAssignments,
}: SubjectManagementClientProps) {
  const [activeTab, setActiveTab] = useState<"directory" | "assignments">("directory");

  // Directory State
  const [subjects, setSubjects] = useState<SubjectItem[]>(initialSubjects);
  const [searchTerm, setSearchTerm] = useState("");

  // Subject Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deletingSubject, setDeletingSubject] = useState<SubjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Assignments State
  const [assignments, setAssignments] = useState<ClassSubjectAssignment[]>(initialAssignments);
  const [selectedClassId, setSelectedClassId] = useState<string>(classesList[0]?.id || "");
  const [assignSubjectId, setAssignSubjectId] = useState("");
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({ name: "", code: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (subject: SubjectItem) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name || "", code: subject.code || "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setFormError("");
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Subject Name is required.");
      return;
    }
    if (!formData.code.trim()) {
      setFormError("Subject Code is required.");
      return;
    }

    const codeDuplicate = subjects.find(
      (s) =>
        s.code.trim().toLowerCase() === formData.code.trim().toLowerCase() &&
        s.id !== editingSubject?.id
    );

    if (codeDuplicate) {
      setFormError(`Subject Code "${formData.code}" is already in use.`);
      return;
    }

    setIsSaving(true);

    try {
      if (editingSubject) {
        const updatePayload = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
        };

        const updated = await subjectService.updateSubject(editingSubject.id, updatePayload);
        setSubjects((prev) =>
          prev.map((s) => (s.id === editingSubject.id ? updated : s))
        );
        showToast("Subject details updated successfully!");
      } else {
        const insertPayload = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
        };

        const created = await subjectService.createSubject(insertPayload);
        setSubjects((prev) => [...prev, created]);
        showToast("New subject created successfully!");
      }

      closeModal();
    } catch (err: unknown) {
      console.error("Save subject error:", err);
      const errorObj = err as { message?: string };
      setFormError(errorObj.message || "Failed to save subject record.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;
    setIsDeleting(true);

    try {
      await subjectService.deleteSubject(deletingSubject.id);
      setSubjects((prev) => prev.filter((s) => s.id !== deletingSubject.id));
      showToast(`Subject "${deletingSubject.name}" deleted.`);
      setDeletingSubject(null);
    } catch (err: unknown) {
      console.error("Delete subject error:", err);
      const errorObj = err as { message?: string };
      showToast(errorObj.message || "Failed to delete subject.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAssignSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError("");

    if (!selectedClassId) {
      setAssignError("Please select a class first.");
      return;
    }
    if (!assignSubjectId) {
      setAssignError("Please select a subject to assign.");
      return;
    }

    const alreadyAssigned = assignments.some(
      (a) =>
        String(a.class_id) === String(selectedClassId) &&
        String(a.subject_id) === String(assignSubjectId)
    );

    if (alreadyAssigned) {
      setAssignError("This subject is already assigned to the selected class.");
      return;
    }

    setIsAssigning(true);

    try {
      const createdAssignment = await subjectService.assignSubjectToClass(
        selectedClassId,
        assignSubjectId,
        assignTeacherId
      );

      setAssignments((prev) => [createdAssignment, ...prev]);
      setAssignSubjectId("");
      setAssignTeacherId("");
      showToast("Subject assigned to class successfully!");
    } catch (err: unknown) {
      console.error("Assign error:", err);
      const errorObj = err as { message?: string };
      setAssignError(errorObj.message || "Failed to assign subject to class.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await subjectService.removeAssignment(assignmentId);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      showToast("Subject unassigned from class.");
    } catch (err: unknown) {
      console.error("Remove assignment error:", err);
      const errorObj = err as { message?: string };
      showToast(errorObj.message || "Failed to unassign subject.", "error");
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentClassAssignments = assignments.filter(
    (a) => String(a.class_id) === String(selectedClassId)
  );

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />

      <PageHeader
        title="Subjects & Curriculum"
        description="Manage global subject codes and class subject teacher assignments"
        action={
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("directory")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === "directory"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Subject Directory
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === "assignments"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Class-Subject Mapping
            </button>
          </div>
        }
      />

      {activeTab === "directory" ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
              Add Subject
            </Button>
          </div>

          <SubjectTable
            subjects={filteredSubjects}
            onEdit={openEditModal}
            onDelete={setDeletingSubject}
          />
        </>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-1 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Assign Subject to Class
            </h3>

            <form onSubmit={handleAssignSubject} className="space-y-4">
              {assignError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {assignError}
                </div>
              )}

              <Select
                label="Select Target Class *"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                options={classesList.map((c) => ({
                  label: `${c.name} ${c.division ? `(${c.division})` : ""}`,
                  value: c.id,
                }))}
              />

              <Select
                label="Select Subject *"
                value={assignSubjectId}
                onChange={(e) => setAssignSubjectId(e.target.value)}
                options={[
                  { label: "Choose a subject...", value: "" },
                  ...subjects.map((s) => ({
                    label: `${s.name} (${s.code})`,
                    value: s.id,
                  })),
                ]}
              />

              <Select
                label="Assigned Teacher (Optional)"
                value={assignTeacherId}
                onChange={(e) => setAssignTeacherId(e.target.value)}
                options={[
                  { label: "Unassigned", value: "" },
                  ...teachersList.map((t) => ({
                    label: `${t.full_name} (${t.employee_id || "No ID"})`,
                    value: t.id,
                  })),
                ]}
              />

              <Button type="submit" className="w-full" disabled={isAssigning}>
                {isAssigning ? "Assigning..." : "Assign Subject"}
              </Button>
            </form>
          </Card>

          <Card className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assigned Subjects for Class
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Currently configured subjects and teaching faculty
                </p>
              </div>
              <Badge variant="primary">
                {currentClassAssignments.length} Subject(s)
              </Badge>
            </div>

            {currentClassAssignments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {currentClassAssignments.map((a) => (
                  <div key={a.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {a.subjects?.code || "SUB"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {a.subjects?.name || "Subject"}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Teacher: {a.teachers?.full_name || "Unassigned"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveAssignment(a.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove Assignment"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No subjects assigned to this class yet. Select a subject on the left to assign.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSubject ? "Edit Subject Code" : "Add New Subject"}
        subtitle="Define subject title and code"
        maxWidth="md"
      >
        <SubjectForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSaveSubject}
          onCancel={closeModal}
          isSaving={isSaving}
          formError={formError}
          isEditMode={!!editingSubject}
        />
      </Modal>

      {/* Delete Subject Dialog */}
      <ConfirmDialog
        isOpen={!!deletingSubject}
        onClose={() => setDeletingSubject(null)}
        onConfirm={handleDeleteSubject}
        title="Delete Subject"
        description={`Are you sure you want to delete subject "${deletingSubject?.name}" (Code: ${deletingSubject?.code})? This will also remove any class subject assignments.`}
        confirmText="Delete Subject"
        isLoading={isDeleting}
      />
    </div>
  );
}
