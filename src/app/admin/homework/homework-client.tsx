"use client";

import React, { useState, useMemo } from "react";
import { Plus, BookOpen, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { HomeworkFilters } from "@/components/homework/HomeworkFilters";
import { HomeworkTable } from "@/components/homework/HomeworkTable";
import { HomeworkForm } from "@/components/homework/HomeworkForm";
import { HomeworkItem, HomeworkFormData } from "@/types/homework";
import { ClassOption } from "@/types/student";
import { SubjectItem, ClassSubjectAssignment } from "@/types/subject";
import { homeworkService } from "@/services/homeworkService";

export interface HomeworkClientProps {
  initialHomeworks: HomeworkItem[];
  initialClasses: ClassOption[];
  initialSubjects: SubjectItem[];
  initialTeachers: Array<{ id: string; full_name: string }>;
  initialClassSubjects: ClassSubjectAssignment[];
}

export default function HomeworkClient({
  initialHomeworks = [],
  initialClasses = [],
  initialSubjects = [],
  initialTeachers = [],
  initialClassSubjects = [],
}: HomeworkClientProps) {
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>(initialHomeworks);
  const [classesList] = useState<ClassOption[]>(initialClasses);
  const [subjectsList] = useState<SubjectItem[]>(initialSubjects);
  const [teachersList] = useState<Array<{ id: string; full_name: string }>>(initialTeachers);
  const [classSubjectsList] = useState<ClassSubjectAssignment[]>(initialClassSubjects);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedSubject, setSelectedSubject] = useState("ALL");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<HomeworkItem | null>(null);
  const [deletingHomework, setDeletingHomework] = useState<HomeworkItem | null>(null);

  // Loading & Toast state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const refreshHomeworks = async () => {
    setIsLoading(true);
    try {
      const data = await homeworkService.fetchHomeworks();
      setHomeworks(data);
    } catch (err) {
      console.error("Error refreshing homeworks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered homework list
  const filteredHomeworks = useMemo(() => {
    return homeworks.filter((h) => {
      // Class filter
      if (selectedClass !== "ALL") {
        if (String(h.class_id) !== String(selectedClass)) {
          return false;
        }
      }

      // Subject filter
      if (selectedSubject !== "ALL") {
        if (String(h.subject_id) !== String(selectedSubject)) {
          return false;
        }
      }

      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const titleMatch = h.title?.toLowerCase().includes(query);
        const descMatch = h.description?.toLowerCase().includes(query);
        const teacherMatch = h.teachers?.full_name?.toLowerCase().includes(query);
        const subjectMatch = h.subjects?.name?.toLowerCase().includes(query);
        const classMatch = h.classes?.name?.toLowerCase().includes(query);

        if (!titleMatch && !descMatch && !teacherMatch && !subjectMatch && !classMatch) {
          return false;
        }
      }

      return true;
    });
  }, [homeworks, selectedClass, selectedSubject, searchTerm]);

  // Handle Add / Edit submit
  const handleFormSubmit = async (formData: HomeworkFormData) => {
    setIsSaving(true);
    try {
      if (editingHomework) {
        await homeworkService.updateHomework(editingHomework.id, formData);
        showToast("Homework assignment updated successfully!");
      } else {
        await homeworkService.createHomework(formData);
        showToast("Homework assignment created successfully!");
      }
      setIsFormOpen(false);
      setEditingHomework(null);
      await refreshHomeworks();
    } catch (err: any) {
      console.error("Save homework error:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Open Create Form
  const handleOpenCreate = () => {
    setEditingHomework(null);
    setIsFormOpen(true);
  };

  // Handle Open Edit Form
  const handleOpenEdit = (homework: HomeworkItem) => {
    setEditingHomework(homework);
    setIsFormOpen(true);
  };

  // Handle Open Delete Dialog
  const handleOpenDelete = (homework: HomeworkItem) => {
    setDeletingHomework(homework);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingHomework) return;
    setIsDeleting(true);
    try {
      await homeworkService.deleteHomework(deletingHomework.id);
      showToast("Homework assignment deleted successfully.");
      setDeletingHomework(null);
      await refreshHomeworks();
    } catch (err: any) {
      console.error("Delete homework error:", err);
      showToast(err.message || "Failed to delete homework.");
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
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            Homework Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, assign, and view daily homework assignments for classes and subjects
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
          Add Homework
        </Button>
      </div>

      {/* Filters Bar */}
      <HomeworkFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        classesList={classesList}
        subjectsList={subjectsList}
      />

      {/* Homework Table */}
      <HomeworkTable
        homeworks={filteredHomeworks}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        isLoading={isLoading}
      />

      {/* Homework Modal Form */}
      <HomeworkForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingHomework(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingHomework}
        classesList={classesList}
        subjectsList={subjectsList}
        teachersList={teachersList}
        classSubjectsList={classSubjectsList}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingHomework)}
        onClose={() => setDeletingHomework(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Homework Assignment"
        description={`Are you sure you want to delete "${deletingHomework?.title}"? This action cannot be undone.`}
        confirmText="Delete Homework"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
