"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, FileText, Award, BarChart3 } from "lucide-react";
import { ExamItem, ExamFormData, MarkItem } from "@/types/exam";
import { ClassOption } from "@/types/student";
import { SubjectItem, ClassSubjectAssignment } from "@/types/subject";
import { examService } from "@/services/examService";
import { subjectService } from "@/services/subjectService";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/toast";
import { ExamTable } from "@/components/exams/ExamTable";
import { ExamForm } from "@/components/exams/ExamForm";
import { MarksEntryGrid } from "@/components/exams/MarksEntryGrid";
import { MarksReport } from "@/components/exams/MarksReport";

interface StudentItem {
  id: string;
  admission_number: string;
  full_name: string;
  class_id?: string;
}

interface ExamsClientProps {
  initialExams: ExamItem[];
  classesList: ClassOption[];
  allStudents: StudentItem[];
  allSubjects: SubjectItem[];
  allAssignments: ClassSubjectAssignment[];
}

export default function ExamsClient({
  initialExams,
  classesList,
  allStudents,
  allSubjects,
  allAssignments,
}: ExamsClientProps) {
  const [exams, setExams] = useState<ExamItem[]>(initialExams);
  const [activeTab, setActiveTab] = useState<"exams" | "entry" | "report">("exams");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<ExamFormData>({
    name: "",
    class_id: classesList[0]?.id || "",
    exam_date: new Date().toISOString().split("T")[0],
    academic_year: "2026-2027",
  });

  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deletingExam, setDeletingExam] = useState<ExamItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Marks Entry State
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const [existingMarks, setExistingMarks] = useState<MarkItem[]>([]);
  const [isLoadingMarks, setIsLoadingMarks] = useState(false);

  // Report State
  const [selectedReportExamId, setSelectedReportExamId] = useState<string>(
    initialExams[0]?.id ? String(initialExams[0].id) : ""
  );
  const [reportMarks, setReportMarks] = useState<MarkItem[]>([]);
  const [isLoadingReportMarks, setIsLoadingReportMarks] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const openAddModal = () => {
    setEditingExam(null);
    setFormData({
      name: "",
      class_id: classesList[0]?.id || "",
      exam_date: new Date().toISOString().split("T")[0],
      academic_year: "2026-2027",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (exam: ExamItem) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name || "",
      class_id: exam.class_id ? String(exam.class_id) : "",
      exam_date: exam.exam_date || "",
      academic_year: exam.academic_year || "2026-2027",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExam(null);
    setFormError("");
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Exam Title is required.");
      return;
    }
    if (!formData.class_id) {
      setFormError("Assigned Class is required.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingExam) {
        const updated = await examService.updateExam(editingExam.id, {
          name: formData.name.trim(),
          class_id: formData.class_id,
          exam_date: formData.exam_date || null,
          academic_year: formData.academic_year || "2026-2027",
        });

        const selectedClassObj = classesList.find((c) => String(c.id) === String(formData.class_id));
        const updatedItem: ExamItem = {
          ...updated,
          classes: selectedClassObj ? { id: selectedClassObj.id, name: selectedClassObj.name } : null,
        };

        setExams((prev) =>
          prev.map((ex) => (ex.id === editingExam.id ? updatedItem : ex))
        );
        showToast("Exam schedule updated successfully!");
      } else {
        const created = await examService.createExam({
          name: formData.name.trim(),
          class_id: formData.class_id,
          exam_date: formData.exam_date || null,
          academic_year: formData.academic_year || "2026-2027",
        });

        const selectedClassObj = classesList.find((c) => String(c.id) === String(formData.class_id));
        const newItem: ExamItem = {
          ...created,
          classes: selectedClassObj ? { id: selectedClassObj.id, name: selectedClassObj.name } : null,
        };

        setExams((prev) => [newItem, ...prev]);
        showToast("New exam schedule created!");
      }

      closeModal();
    } catch (err: unknown) {
      console.error("Save exam error:", err);
      const errorObj = err as { message?: string };
      setFormError(errorObj.message || "Failed to save exam schedule.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!deletingExam) return;
    setIsDeleting(true);

    try {
      await examService.deleteExam(deletingExam.id);
      setExams((prev) => prev.filter((e) => e.id !== deletingExam.id));
      showToast(`Exam "${deletingExam.name}" deleted.`);
      setDeletingExam(null);
    } catch (err: unknown) {
      console.error("Delete exam error:", err);
      const errorObj = err as { message?: string };
      showToast(errorObj.message || "Failed to delete exam.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenMarksEntry = async (exam: ExamItem) => {
    setSelectedExam(exam);
    setActiveTab("entry");
    setIsLoadingMarks(true);

    try {
      const marks = await examService.fetchMarksForExam(exam.id);
      setExistingMarks(marks);
    } catch (err) {
      console.error("Error loading marks:", err);
    } finally {
      setIsLoadingMarks(false);
    }
  };

  const handleSaveMarks = async (marksList: MarkItem[]) => {
    setIsSaving(true);
    try {
      await examService.saveMarksList(marksList);
      showToast("All student marks saved successfully!");
      setExistingMarks(marksList);
    } catch (err: unknown) {
      console.error("Save marks error:", err);
      const errorObj = err as { message?: string };
      showToast(errorObj.message || "Failed to save student marks.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Load marks for report tab
  useEffect(() => {
    if (activeTab !== "report" || !selectedReportExamId) return;

    async function loadReportMarks() {
      setIsLoadingReportMarks(true);
      try {
        const marks = await examService.fetchMarksForExam(selectedReportExamId);
        setReportMarks(marks);
      } catch (err) {
        console.error("Error loading report marks:", err);
      } finally {
        setIsLoadingReportMarks(false);
      }
    }

    loadReportMarks();
  }, [activeTab, selectedReportExamId]);

  const filteredExams = exams.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.classes?.name && e.classes.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Compute subjects assigned to class for selected entry exam
  const entryClassSubjects: SubjectItem[] = selectedExam
    ? allAssignments
        .filter((a) => String(a.class_id) === String(selectedExam.class_id))
        .map((a) => a.subjects)
        .filter((s): s is SubjectItem => Boolean(s))
    : [];

  const entryStudents = selectedExam
    ? allStudents.filter((s) => String(s.class_id) === String(selectedExam.class_id))
    : [];

  // Compute subjects assigned to class for selected report exam
  const reportExamObj = exams.find((e) => String(e.id) === String(selectedReportExamId));
  const reportClassSubjects: SubjectItem[] = reportExamObj
    ? allAssignments
        .filter((a) => String(a.class_id) === String(reportExamObj.class_id))
        .map((a) => a.subjects)
        .filter((s): s is SubjectItem => Boolean(s))
    : [];

  const reportStudents = reportExamObj
    ? allStudents.filter((s) => String(s.class_id) === String(reportExamObj.class_id))
    : [];

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />

      <PageHeader
        title="Examinations & Marksheets"
        description="Schedule school exams, enter subject-wise marks, and view report cards"
        action={
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("exams")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === "exams"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Exam Schedules
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === "report"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Marks & Results Report
            </button>
          </div>
        }
      />

      {activeTab === "exams" && (
        <>
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search exam title or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
              Create Exam
            </Button>
          </div>

          <ExamTable
            exams={filteredExams}
            onEdit={openEditModal}
            onDelete={setDeletingExam}
            onManageMarks={handleOpenMarksEntry}
          />
        </>
      )}

      {activeTab === "entry" && selectedExam && (
        <MarksEntryGrid
          exam={selectedExam}
          students={entryStudents}
          classSubjects={entryClassSubjects}
          existingMarks={existingMarks}
          onSave={handleSaveMarks}
          onBack={() => setActiveTab("exams")}
          isSaving={isSaving}
        />
      )}

      {activeTab === "report" && (
        <MarksReport
          exams={exams}
          selectedExamId={selectedReportExamId}
          onExamChange={setSelectedReportExamId}
          students={reportStudents}
          classSubjects={reportClassSubjects}
          marks={reportMarks}
          isLoading={isLoadingReportMarks}
        />
      )}

      {/* Add / Edit Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingExam ? "Edit Exam Schedule" : "Schedule New Examination"}
        subtitle="Define exam title, assigned class, and exam date"
        maxWidth="md"
      >
        <ExamForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSaveExam}
          onCancel={closeModal}
          classesList={classesList}
          isSaving={isSaving}
          formError={formError}
          isEditMode={!!editingExam}
        />
      </Modal>

      {/* Delete Exam Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingExam}
        onClose={() => setDeletingExam(null)}
        onConfirm={handleDeleteExam}
        title="Delete Examination Schedule"
        description={`Are you sure you want to delete exam "${deletingExam?.name}"? All associated marks records will also be deleted.`}
        confirmText="Delete Exam"
        isLoading={isDeleting}
      />
    </div>
  );
}
