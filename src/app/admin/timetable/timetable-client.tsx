"use client";

import React, { useState, useMemo } from "react";
import { Plus, CalendarDays, LayoutGrid, LayoutList, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TimetableGrid } from "@/components/timetable/TimetableGrid";
import { TimetableForm } from "@/components/timetable/TimetableForm";
import { TimetableEntry, TimetableFormData } from "@/types/timetable";
import { ClassOption } from "@/types/student";
import { SubjectItem, ClassSubjectAssignment } from "@/types/subject";
import { timetableService } from "@/services/timetableService";

export interface TimetableClientProps {
  initialEntries: TimetableEntry[];
  classesList: ClassOption[];
  subjectsList: SubjectItem[];
  teachersList: Array<{ id: string; full_name: string }>;
  classSubjectsList: ClassSubjectAssignment[];
}

export default function TimetableClient({
  initialEntries = [],
  classesList = [],
  subjectsList = [],
  teachersList = [],
  classSubjectsList = [],
}: TimetableClientProps) {
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(initialEntries);
  const [selectedClass, setSelectedClass] = useState<string>(
    classesList.length > 0 ? String(classesList[0].id) : ""
  );
  const [viewMode, setViewMode] = useState<"matrix" | "cards">("matrix");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableEntry | null>(null);
  const [deletingSlot, setDeletingSlot] = useState<TimetableEntry | null>(null);
  const [presetDay, setPresetDay] = useState<string | undefined>(undefined);
  const [presetPeriod, setPresetPeriod] = useState<number | undefined>(undefined);

  // Status state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const refreshTimetable = async () => {
    try {
      const data = await timetableService.fetchTimetable(selectedClass);
      setTimetableEntries(data);
    } catch (err) {
      console.error("Error refreshing timetable:", err);
    }
  };

  // Filter entries by selected class
  const classFilteredEntries = useMemo(() => {
    if (!selectedClass) return timetableEntries;
    return timetableEntries.filter(
      (entry) => String(entry.class_id) === String(selectedClass)
    );
  }, [timetableEntries, selectedClass]);

  // Handle Open Create Modal
  const handleOpenAddSlot = (day?: string, period?: number) => {
    setEditingSlot(null);
    setPresetDay(day);
    setPresetPeriod(period);
    setIsFormOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEditSlot = (entry: TimetableEntry) => {
    setEditingSlot(entry);
    setPresetDay(entry.day_of_week);
    setPresetPeriod(Number(entry.period_number));
    setIsFormOpen(true);
  };

  // Handle Open Delete Modal
  const handleOpenDeleteSlot = (entry: TimetableEntry) => {
    setDeletingSlot(entry);
  };

  // Save / Update Slot submit
  const handleSaveSlot = async (formData: TimetableFormData, editId?: string | number) => {
    setIsSaving(true);
    try {
      await timetableService.saveTimetableEntry(formData, editId);
      showToast(editId ? "Timetable period updated!" : "Timetable period saved successfully!");
      setIsFormOpen(false);
      setEditingSlot(null);
      await refreshTimetable();
    } catch (err: any) {
      console.error("Save timetable error:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Delete Slot
  const handleConfirmDeleteSlot = async () => {
    if (!deletingSlot) return;
    setIsDeleting(true);
    try {
      await timetableService.deleteTimetableEntry(deletingSlot.id);
      showToast("Timetable period cleared.");
      setDeletingSlot(null);
      await refreshTimetable();
    } catch (err: any) {
      console.error("Delete timetable error:", err);
      showToast(err.message || "Failed to delete timetable entry.");
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
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            Class Timetable Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Define and schedule weekly periods, subjects, teachers, and room numbers for each class
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === "matrix"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Matrix View
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === "cards"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" /> Day Cards
            </button>
          </div>

          <Button onClick={() => handleOpenAddSlot()} icon={<Plus className="w-4 h-4" />}>
            Add Period
          </Button>
        </div>
      </div>

      {/* Class Selector Filter Card */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Select Class:
            </span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 w-full sm:w-64"
            >
              {classesList.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} {c.division ? `(${c.division})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Scheduled Periods for Class:{" "}
            <Badge variant="primary" size="sm">
              {classFilteredEntries.length} Slots
            </Badge>
          </div>
        </div>
      </Card>

      {/* Timetable Grid View */}
      <TimetableGrid
        entries={classFilteredEntries}
        onAddSlot={handleOpenAddSlot}
        onEditSlot={handleOpenEditSlot}
        onDeleteSlot={handleOpenDeleteSlot}
        viewMode={viewMode}
      />

      {/* Add / Edit Form Modal */}
      <TimetableForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSlot(null);
        }}
        onSubmit={handleSaveSlot}
        initialData={editingSlot}
        selectedClassId={selectedClass}
        defaultDay={presetDay}
        defaultPeriod={presetPeriod}
        classesList={classesList}
        subjectsList={subjectsList}
        teachersList={teachersList}
        classSubjectsList={classSubjectsList}
        existingEntries={timetableEntries}
        isSaving={isSaving}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingSlot)}
        onClose={() => setDeletingSlot(null)}
        onConfirm={handleConfirmDeleteSlot}
        title="Clear Timetable Period"
        description={`Are you sure you want to remove ${deletingSlot?.subjects?.name || "this period"} from ${deletingSlot?.day_of_week}, Period ${deletingSlot?.period_number}?`}
        confirmText="Clear Slot"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
