"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TimetableEntry,
  TimetableFormData,
  DAYS_OF_WEEK,
  PERIOD_NUMBERS,
  DEFAULT_PERIOD_TIMES,
} from "@/types/timetable";
import { ClassOption } from "@/types/student";
import { SubjectItem, ClassSubjectAssignment } from "@/types/subject";
import { AlertCircle, Clock, MapPin, User, BookOpen, Calendar, Info } from "lucide-react";

export interface TimetableFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TimetableFormData, editId?: string | number) => Promise<void>;
  initialData?: TimetableEntry | null;
  selectedClassId?: string;
  defaultDay?: string;
  defaultPeriod?: number;
  classesList: ClassOption[];
  subjectsList: SubjectItem[];
  teachersList: Array<{ id: string; full_name: string }>;
  classSubjectsList: ClassSubjectAssignment[];
  existingEntries: TimetableEntry[];
  isSaving: boolean;
}

export const TimetableForm: React.FC<TimetableFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  selectedClassId,
  defaultDay,
  defaultPeriod,
  classesList,
  subjectsList,
  teachersList,
  classSubjectsList,
  existingEntries,
  isSaving,
}) => {
  const [classId, setClassId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<string>("Monday");
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("09:15");
  const [roomNumber, setRoomNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Capitalize first letter helper for UI display
  const capitalize = (str?: string) => {
    if (!str) return "Monday";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Sync state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setClassId(String(initialData.class_id));
        setDayOfWeek(capitalize(initialData.day_of_week));
        setPeriodNumber(Number(initialData.period_number) || 1);
        setSubjectId(initialData.subject_id ? String(initialData.subject_id) : "");
        setTeacherId(initialData.teacher_id ? String(initialData.teacher_id) : "");
        setStartTime(initialData.start_time || "08:30");
        setEndTime(initialData.end_time || "09:15");
        setRoomNumber(initialData.room_number || "");
      } else {
        const activeClass = selectedClassId || (classesList[0]?.id ? String(classesList[0].id) : "");
        const activeDay = capitalize(defaultDay) || "Monday";
        const activePeriod = defaultPeriod || 1;
        const defaultTimes = DEFAULT_PERIOD_TIMES[activePeriod] || { start: "08:30", end: "09:15" };

        setClassId(activeClass);
        setDayOfWeek(activeDay);
        setPeriodNumber(activePeriod);
        setSubjectId("");
        setTeacherId("");
        setStartTime(defaultTimes.start);
        setEndTime(defaultTimes.end);
        setRoomNumber("");
      }
      setError(null);
    }
  }, [isOpen, initialData, selectedClassId, defaultDay, defaultPeriod, classesList]);

  // Compute subjects assigned to the selected class
  const availableSubjects = useMemo(() => {
    if (!classId) return subjectsList;

    const assignedSubjectIds = new Set(
      classSubjectsList
        .filter((cs) => String(cs.class_id) === String(classId))
        .map((cs) => String(cs.subject_id))
    );

    if (assignedSubjectIds.size === 0) {
      return subjectsList;
    }

    return subjectsList.filter((s) => assignedSubjectIds.has(String(s.id)));
  }, [classId, classSubjectsList, subjectsList]);

  // Check if current Class + Day + Period selection conflicts with an existing slot
  const conflictingSlot = useMemo(() => {
    if (!classId || !dayOfWeek || !periodNumber) return null;

    return existingEntries.find((entry) => {
      const matchClass = String(entry.class_id) === String(classId);
      const matchDay = entry.day_of_week?.toLowerCase() === dayOfWeek.toLowerCase();
      const matchPeriod = Number(entry.period_number) === Number(periodNumber);
      const notCurrentEdit = initialData ? String(entry.id) !== String(initialData.id) : true;
      return matchClass && matchDay && matchPeriod && notCurrentEdit;
    });
  }, [classId, dayOfWeek, periodNumber, existingEntries, initialData]);

  // Handle Class change
  const handleClassChange = (newClassId: string) => {
    setClassId(newClassId);
    setSubjectId("");
    setTeacherId("");
  };

  // Handle Period change -> update default times
  const handlePeriodChange = (newPeriod: number) => {
    setPeriodNumber(newPeriod);
    if (!initialData && DEFAULT_PERIOD_TIMES[newPeriod]) {
      setStartTime(DEFAULT_PERIOD_TIMES[newPeriod].start);
      setEndTime(DEFAULT_PERIOD_TIMES[newPeriod].end);
    }
  };

  // Handle Subject change -> auto-populate teacher_id from class_subjects
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
    if (!classId) {
      setError("Please select a class.");
      return;
    }
    if (!dayOfWeek) {
      setError("Please select a day of the week.");
      return;
    }
    if (!periodNumber) {
      setError("Please select a period number.");
      return;
    }
    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }

    try {
      setError(null);
      await onSubmit(
        {
          class_id: classId,
          day_of_week: dayOfWeek,
          period_number: periodNumber,
          subject_id: subjectId,
          teacher_id: teacherId,
          start_time: startTime,
          end_time: endTime,
          room_number: roomNumber,
        },
        initialData?.id
      );
    } catch (err: any) {
      setError(err.message || "Failed to save timetable period entry.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Period Slot" : "Add Period Slot"}
      subtitle={
        initialData
          ? "Update timetable schedule for this period"
          : "Assign a subject and teacher to a weekly timetable slot"
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

        {/* Warning if slot will overwrite an existing entry */}
        {conflictingSlot && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Slot Overwrite Warning</p>
              <p className="mt-0.5 text-amber-700">
                Period {periodNumber} on {dayOfWeek} is currently assigned to{" "}
                <span className="font-semibold text-amber-900">
                  {conflictingSlot.subjects?.name || "Subject"}
                </span>
                . Saving will overwrite this slot.
              </p>
            </div>
          </div>
        )}

        {/* Class Selection */}
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

        {/* Day & Period Number Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Day of Week *
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              required
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> Period Number *
            </label>
            <select
              value={periodNumber}
              onChange={(e) => handlePeriodChange(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              required
            >
              {PERIOD_NUMBERS.map((p) => (
                <option key={p} value={p}>
                  Period {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject & Teacher Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  ? "No Subjects Mapped"
                  : "Select Subject"}
              </option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

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
        </div>

        {/* Start Time, End Time & Room Number */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              type="time"
              label="Start Time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="time"
              label="End Time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Room Number / Location"
              placeholder="e.g. Room 101 or Lab 2"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
          </div>
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
              ? "Update Slot"
              : conflictingSlot
              ? "Overwrite & Save Slot"
              : "Save Slot"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
