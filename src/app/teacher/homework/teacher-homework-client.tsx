"use client";

import React, { useState } from "react";

import { ClipboardList, Plus, Trash2, Edit3, Paperclip, Clock, Save, AlertCircle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/toast";

interface TeacherHomeworkClientProps {
  teacherId: string;
  assignedClasses: any[];
  assignedSubjects: any[];
  initialHomeworks: any[];
}

export function TeacherHomeworkClient({
  teacherId,
  assignedClasses,
  assignedSubjects,
  initialHomeworks,
}: TeacherHomeworkClientProps) {


  const [homeworks, setHomeworks] = useState<any[]>(initialHomeworks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    class_id: assignedClasses[0]?.id || "",
    subject_id: assignedSubjects[0]?.id || "",
    title: "",
    description: "",
    due_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    attachment_url: "",
  });

  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deletingHw, setDeletingHw] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const openAddModal = () => {
    setEditingHomework(null);
    setFormData({
      class_id: assignedClasses[0]?.id || "",
      subject_id: assignedSubjects[0]?.id || "",
      title: "",
      description: "",
      due_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      attachment_url: "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (hw: any) => {
    setEditingHomework(hw);
    setFormData({
      class_id: hw.class_id || assignedClasses[0]?.id || "",
      subject_id: hw.subject_id || assignedSubjects[0]?.id || "",
      title: hw.title || "",
      description: hw.description || "",
      due_date: hw.due_date ? hw.due_date.split("T")[0] : "",
      attachment_url: hw.attachment_url || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHomework(null);
    setFormError("");
  };

  const handleSaveHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.class_id) {
      setFormError("Target class is required.");
      return;
    }
    if (!formData.title.trim()) {
      setFormError("Homework title is required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/teacher/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingHomework ? "update" : "create",
          homeworkId: editingHomework?.id,
          class_id: formData.class_id,
          subject_id: formData.subject_id || null,
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date,
          attachment_url: formData.attachment_url,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save homework.");
      }

      if (editingHomework) {
        setHomeworks((prev) =>
          prev.map((h) => (h.id === editingHomework.id ? data.homework : h))
        );
        showToast("Homework updated successfully!");
      } else {
        setHomeworks((prev) => [data.homework, ...prev]);
        showToast("New homework assignment posted!");
      }

      closeModal();
    } catch (err: any) {
      setFormError(err.message || "Failed to save homework.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHomework = async () => {
    if (!deletingHw) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/teacher/homework?id=${deletingHw.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete homework.");
      }

      setHomeworks((prev) => prev.filter((h) => h.id !== deletingHw.id));
      showToast("Homework deleted.");
      setDeletingHw(null);
    } catch (err: any) {
      showToast(err.message || "Failed to delete homework.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ClipboardList className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Homework Management
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Post and manage homework assignments for your assigned classes
          </p>
        </div>

        <Button onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
          Post New Homework
        </Button>
      </div>

      {/* Homework Grid */}
      {homeworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {homeworks.map((hw) => {
            const classObj = Array.isArray(hw.classes) ? hw.classes[0] : hw.classes;
            const subjectObj = Array.isArray(hw.subjects) ? hw.subjects[0] : hw.subjects;
            const className = classObj?.name
              ? `${classObj.name}${classObj.division ? ` (${classObj.division})` : ""}`
              : "Class";

            return (
              <div
                key={hw.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary">{className}</Badge>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                        {subjectObj?.name || "Subject"}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due:{" "}
                      {hw.due_date
                        ? new Date(hw.due_date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                    {hw.title}
                  </h3>

                  {hw.description && (
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                      {hw.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {hw.attachment_url ? (
                    <a
                      href={hw.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <Paperclip className="w-3.5 h-3.5" /> Attachment
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No attachment</span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(hw)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                      title="Edit Homework"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingHw(hw)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete Homework"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Homework Posted</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            You have not posted any homework assignments for your assigned classes yet.
          </p>
          <Button onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
            Post First Homework
          </Button>
        </div>
      )}

      {/* Add / Edit Homework Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingHomework ? "Edit Homework Assignment" : "Post New Homework Assignment"}
        subtitle="Scope to your assigned class and subject"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveHomework} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Class *
              </label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {assignedClasses.length === 0 && <option value="">No Assigned Classes</option>}
                {assignedClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.division ? `(${c.division})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {assignedSubjects.length === 0 && <option value="">General Subject</option>}
                {assignedSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.code ? `(${s.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Homework Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Chapter 4 Exercise 2.1 Problems 1-10"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Submission Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Instructions / Description
            </label>
            <textarea
              rows={3}
              placeholder="Write detailed instructions for students and parents..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Attachment Link / URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/... or document link"
              value={formData.attachment_url}
              onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editingHomework ? "Update Assignment" : "Post Homework"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingHw}
        onClose={() => setDeletingHw(null)}
        onConfirm={handleDeleteHomework}
        title="Delete Homework Assignment"
        description={`Are you sure you want to delete "${deletingHw?.title}"? This action cannot be undone.`}
        confirmText="Delete Homework"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
