"use client";

import React, { useState } from "react";
import { Megaphone, Plus, Calendar, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";

export interface Notice {
  id: string;
  title: string;
  target: "All" | "Students" | "Teachers" | "Parents";
  class_name?: string | null;
  published_date: string;
  created_by: string;
  content: string;
}

export default function NoticesClient() {
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: "1",
      title: "Mid-Term Examination Schedule & Guidelines",
      target: "All",
      class_name: "All Classes",
      published_date: "2026-09-07",
      created_by: "School Administration",
      content: "The mid-term examination timetable is now published. Please consult class notice boards.",
    },
    {
      id: "2",
      title: "Annual Sports Day Registration",
      target: "Students",
      class_name: "Class 9 & 10",
      published_date: "2026-09-05",
      created_by: "Sports Department",
      content: "Register for track and field events with your class teacher by Friday.",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    target: "All" as "All" | "Students" | "Teachers" | "Parents",
    class_name: "All Classes",
    content: "",
  });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const newNotice: Notice = {
      id: String(Date.now()),
      title: formData.title,
      target: formData.target,
      class_name: formData.class_name,
      published_date: new Date().toISOString().split("T")[0],
      created_by: "School Admin",
      content: formData.content,
    };
    setNotices((prev) => [newNotice, ...prev]);
    setIsModalOpen(false);
    setToastMessage("Notice broadcasted successfully!");
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleDeleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    setToastMessage("Notice deleted.");
    setTimeout(() => setToastMessage(""), 4000);
  };

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Notices & Circulars</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast official announcements to students, teachers, and parents
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Create Notice
        </Button>
      </div>

      {/* Notices Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Target Audience</th>
                <th className="px-6 py-3.5">Target Class</th>
                <th className="px-6 py-3.5">Published Date</th>
                <th className="px-6 py-3.5">Created By</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {notices.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <div>
                      <p>{n.title}</p>
                      <p className="text-xs text-slate-500 font-normal line-clamp-1 mt-0.5">{n.content}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="primary">{n.target}</Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">{n.class_name || "All"}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{n.published_date}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{n.created_by}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Official Notice"
        maxWidth="md"
      >
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <Input
            label="Notice Title *"
            placeholder="e.g. Holiday Announcement"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Target Audience"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
              options={[
                { label: "All School", value: "All" },
                { label: "Students", value: "Students" },
                { label: "Teachers", value: "Teachers" },
                { label: "Parents", value: "Parents" },
              ]}
            />
            <Input
              label="Target Class"
              placeholder="e.g. All Classes"
              value={formData.class_name}
              onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notice Content *
            </label>
            <textarea
              rows={4}
              required
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Write notice body here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Publish Notice</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
