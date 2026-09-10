"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HomeworkItem, HomeworkFormData } from "@/types/homework";
import { ClassOption } from "@/types/student";
import { SubjectItem, ClassSubjectAssignment } from "@/types/subject";
import { AlertCircle, FileText, Calendar, BookOpen, User, Link as LinkIcon } from "lucide-react";

export interface HomeworkFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HomeworkFormData) => Promise<void>;
  initialData?: HomeworkItem | null;
  classesList: ClassOption[];
  subjectsList: SubjectItem[];
  teachersList: Array<{ id: string; full_name: string }>;
  classSubjectsList: ClassSubjectAssignment[];
  isSaving: boolean;
}

export const HomeworkForm: React.FC<HomeworkFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  classesList,
  subjectsList,
  teachersList,
  classSubjectsList,
  isSaving,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sync state with initialData when opened or changed
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setClassId(initialData.class_id ? String(initialData.class_id) : "");
        setSubjectId(initialData.subject_id ? String(initialData.subject_id) : "");
        setTeacherId(initialData.teacher_id ? String(initialData.teacher_id) : "");
        setDueDate(initialData.due_date || "");
        setAttachmentUrl(initialData.attachment_url || (initialData as any).attachment || "");
      } else {
        setTitle("");
        setDescription("");
        setClassId(classesList.length > 0 ? String(classesList[0].id) : "");
        setSubjectId("");
        setTeacherId("");
        // Default due date to tomorrow YYYY-MM-DD
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDueDate(tomorrow.toISOString().split("T")[0]);
        setAttachmentUrl("");
      }
      setError(null);
    }
  }, [isOpen, initialData, classesList]);

  // Compute available subjects for selected class
  const availableSubjects = useMemo(() => {
    if (!classId) return subjectsList;

    const assignedSubjectIds = new Set(
      classSubjectsList
        .filter((cs) => String(cs.class_id) === String(classId))
        .map((cs) => String(cs.subject_id))
    );

    if (assignedSubjectIds.size === 0) {
      return subjectsList; // Fallback to all subjects if none mapped
    }

    return subjectsList.filter((s) => assignedSubjectIds.has(String(s.id)));
  }, [classId, classSubjectsList, subjectsList]);

  // Handle Class change
  const handleClassChange = (newClassId: string) => {
    setClassId(newClassId);
    // Reset subject when class changes
    setSubjectId("");
    setTeacherId("");
  };

  // Handle Subject change with auto-teacher derivation
  const handleSubjectChange = (newSubjectId: string) => {
    setSubjectId(newSubjectId);

    if (classId && newSubjectId) {
      const assignment = classSubjectsList.find(
        (cs) =>
          String(cs.class_id) === String(classId) &&
          String(cs.subject_id) === String(newSubjectId)
      );

      if (assignment?.teacher_id) {
        setTeacherId(String(assignment.teacher_id));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a homework title.");
      return;
    }
    if (!classId) {
      setError("Please select a class.");
      return;
    }
    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }
    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }

    try {
      setError(null);
      await onSubmit({
        title,
        description,
        class_id: classId,
        subject_id: subjectId,
        teacher_id: teacherId,
        due_date: dueDate,
        attachment_url: attachmentUrl,
      });
    } catch (err: any) {
      setError(err.message || "Failed to save homework assignment.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Homework Assignment" : "Add Homework Assignment"}
      subtitle={
        initialData
          ? "Update details for this homework assignment"
          : "Create a new homework task for a class and subject"
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Title */}
        <Input
          label="Assignment Title *"
          placeholder="e.g. Chapter 4 Exercises 1-10"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Class and Subject dropdown grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Class *
            </label>
            <select
              value={classId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              required
            >
              <option value="">Select Class</option>
              {classesList.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} {c.division ? `(${c.division})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              required
              disabled={!classId}
            >
              <option value="">
                {!classId
                  ? "Select Class First"
                  : availableSubjects.length === 0
                  ? "No Subjects Assigned to Class"
                  : "Select Subject"}
              </option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Teacher and Due Date grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" /> Teacher (Optional)
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="">Unassigned / Select Teacher</option>
              {teachersList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Auto-filled based on class subject assignment if available.
            </p>
          </div>

          <div>
            <Input
              type="date"
              label="Due Date *"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Attachment URL */}
        <Input
          label="Attachment URL (Optional)"
          placeholder="https://example.com/worksheet.pdf or storage link"
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
        />

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" /> Description / Instructions
          </label>
          <textarea
            rows={3}
            placeholder="Provide instructions, homework questions, or reading assignments..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : initialData
              ? "Update Homework"
              : "Create Homework"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
