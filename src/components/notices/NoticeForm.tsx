"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NoticeItem, NoticeFormData, TARGET_ROLE_OPTIONS } from "@/types/notice";
import { ClassOption } from "@/types/student";
import { AlertCircle, Megaphone, Users, BookOpen, Calendar, Link as LinkIcon, FileText } from "lucide-react";

export interface NoticeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NoticeFormData) => Promise<void>;
  initialData?: NoticeItem | null;
  classesList: ClassOption[];
  isSaving: boolean;
}

export const NoticeForm: React.FC<NoticeFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  classesList,
  isSaving,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState<"all" | "teacher" | "parent" | "student">("all");
  const [classId, setClassId] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || "");
        setContent(initialData.content || "");
        setTargetRole(initialData.target_role || "all");
        setClassId(initialData.class_id ? String(initialData.class_id) : "");
        const pubDate = initialData.published_at
          ? initialData.published_at.split("T")[0]
          : new Date().toISOString().split("T")[0];
        setPublishedAt(pubDate);
        setAttachmentUrl(initialData.attachment_url || "");
      } else {
        setTitle("");
        setContent("");
        setTargetRole("all");
        setClassId("");
        setPublishedAt(new Date().toISOString().split("T")[0]);
        setAttachmentUrl("");
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a notice title.");
      return;
    }
    if (!content.trim()) {
      setError("Please write the notice content.");
      return;
    }
    if (!publishedAt) {
      setError("Please select a publication date.");
      return;
    }

    try {
      setError(null);
      await onSubmit({
        title,
        content,
        target_role: targetRole,
        class_id: classId,
        published_at: publishedAt,
        attachment_url: attachmentUrl,
      });
    } catch (err: any) {
      setError(err.message || "Failed to save notice.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Notice / Announcement" : "Publish Official Notice"}
      subtitle={
        initialData
          ? "Update details for this published circular or notice"
          : "Broadcast official announcements to students, teachers, or parents"
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
          label="Notice Title *"
          placeholder="e.g. Mid-Term Examination Schedule & Guidelines"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Target Audience & Class Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" /> Target Audience *
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              required
            >
              {TARGET_ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Target Class (Optional)
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="">All Classes (School-Wide)</option>
              {classesList.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} {c.division ? `(${c.division})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Published Date & Attachment URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Publish Date *"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            required
          />

          <Input
            label="Attachment URL (Optional)"
            placeholder="https://example.com/circular.pdf"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
          />
        </div>

        {/* Content Body */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" /> Notice Content / Details *
          </label>
          <textarea
            rows={4}
            placeholder="Write official notice details, instructions, or guidelines here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? "Publishing..."
              : initialData
              ? "Update Notice"
              : "Publish Notice"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
