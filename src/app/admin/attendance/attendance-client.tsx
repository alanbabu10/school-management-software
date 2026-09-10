"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Save, CalendarCheck, BarChart3, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { AttendanceSummaryBar } from "@/components/attendance/AttendanceSummaryBar";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { AttendanceReport } from "@/components/attendance/AttendanceReport";
import { attendanceService } from "@/services/attendanceService";
import { AttendanceSummary } from "@/types/attendance";
import { createClient } from "@/lib/supabase/client";

interface StudentItem {
  id: string;
  admission_number: string;
  full_name: string;
  class_id?: string;
  classes?: { name: string } | null;
}

interface AttendanceClientProps {
  initialStudents: StudentItem[];
  classesList: { id: string; name: string; division?: string | null }[];
}

export default function AttendanceClient({ initialStudents, classesList }: AttendanceClientProps) {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"mark" | "report">("mark");

  // Filter States
  const [selectedClass, setSelectedClass] = useState<string>(classesList[0]?.id || "ALL");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Attendance Marking Map
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "present" | "absent" | "late" | "leave">>(() => {
    const map: Record<string, "present" | "absent" | "late" | "leave"> = {};
    initialStudents.forEach((s) => {
      map[s.id] = "present";
    });
    return map;
  });

  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Report States
  const [reportStartDate, setReportStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // 1st of current month
    return d.toISOString().split("T")[0];
  });
  const [reportEndDate, setReportEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [reportsData, setReportsData] = useState<AttendanceSummary[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Load existing attendance from Supabase when selectedClass or selectedDate changes
  useEffect(() => {
    async function loadAttendance() {
      setIsLoadingAttendance(true);
      try {
        const savedMap = await attendanceService.fetchAttendanceForClassAndDate(
          selectedClass,
          selectedDate
        );

        setAttendanceMap((prev) => {
          const nextMap = { ...prev };
          initialStudents.forEach((s) => {
            if (savedMap[s.id]) {
              nextMap[s.id] = savedMap[s.id];
            } else {
              nextMap[s.id] = "present";
            }
          });
          return nextMap;
        });
      } catch (err) {
        console.error("Error loading attendance:", err);
      } finally {
        setIsLoadingAttendance(false);
      }
    }

    loadAttendance();
  }, [selectedClass, selectedDate, initialStudents]);

  // Load report data when report parameters change
  useEffect(() => {
    if (activeTab !== "report") return;

    async function loadReport() {
      setIsLoadingReport(true);
      try {
        const classStudents = initialStudents.filter(
          (s) => selectedClass === "ALL" || s.class_id === selectedClass
        );
        const report = await attendanceService.fetchAttendanceReport(
          classStudents,
          reportStartDate,
          reportEndDate
        );
        setReportsData(report);
      } catch (err) {
        console.error("Error loading report:", err);
      } finally {
        setIsLoadingReport(false);
      }
    }

    loadReport();
  }, [activeTab, selectedClass, reportStartDate, reportEndDate, initialStudents]);

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late" | "leave") => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    setAttendanceMap((prev) => {
      const nextMap = { ...prev };
      filteredStudents.forEach((s) => {
        nextMap[s.id] = "present";
      });
      return nextMap;
    });
    showToast("All visible students marked Present!");
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const adminId = user?.id || null;

      const recordsToSave = filteredStudents.map((s) => ({
        student_id: s.id,
        status: attendanceMap[s.id] || "present",
      }));

      await attendanceService.saveAttendanceRecords(
        recordsToSave,
        selectedDate,
        adminId
      );

      showToast(`Attendance records saved for ${selectedDate}!`);
    } catch (err: unknown) {
      console.error("Save attendance error:", err);
      const errorObj = err as { message?: string };
      showToast(errorObj.message || "Failed to save attendance records.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = initialStudents.filter((s) => {
    const matchesClass =
      selectedClass === "ALL" ||
      (s.class_id != null && String(s.class_id) === String(selectedClass));
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Calculate summary stats
  const totalCount = filteredStudents.length;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let leaveCount = 0;

  filteredStudents.forEach((s) => {
    const st = attendanceMap[s.id] || "present";
    if (st === "present") presentCount++;
    else if (st === "absent") absentCount++;
    else if (st === "late") lateCount++;
    else if (st === "leave") leaveCount++;
  });

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />

      <PageHeader
        title="Student Attendance Management"
        description="Mark daily attendance, track absent records, and generate class reports"
        action={
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("mark")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === "mark"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" /> Mark Daily Attendance
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === "report"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Attendance Report
            </button>
          </div>
        }
      />

      {activeTab === "mark" ? (
        <>
          {/* Controls Bar */}
          <Card padding="sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
                <Select
                  label="Select Class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  options={[
                    { label: "All Classes", value: "ALL" },
                    ...classesList.map((c) => ({
                      label: `${c.name} ${c.division ? `(${c.division})` : ""}`,
                      value: String(c.id),
                    })),
                  ]}
                />
                <Input
                  label="Select Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <Input
                  label="Search Student"
                  placeholder="Search name or adm no..."
                  icon={<Search className="w-4 h-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleMarkAllPresent}
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                >
                  Mark All Present
                </Button>
                <Button
                  onClick={handleSaveAttendance}
                  disabled={isSaving}
                  icon={<Save className="w-4 h-4" />}
                >
                  {isSaving ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Attendance Summary Stat Bar */}
          <AttendanceSummaryBar
            totalCount={totalCount}
            presentCount={presentCount}
            absentCount={absentCount}
            lateCount={lateCount}
            leaveCount={leaveCount}
          />

          {/* Student Marking Table */}
          <AttendanceTable
            students={filteredStudents}
            attendanceMap={attendanceMap}
            onStatusChange={handleStatusChange}
            isLoading={isLoadingAttendance}
          />
        </>
      ) : (
        /* Attendance Report View */
        <AttendanceReport
          reports={reportsData}
          classesList={classesList}
          selectedClass={selectedClass === "ALL" ? classesList[0]?.id || "" : selectedClass}
          onClassChange={setSelectedClass}
          startDate={reportStartDate}
          onStartDateChange={setReportStartDate}
          endDate={reportEndDate}
          onEndDateChange={setReportEndDate}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLoading={isLoadingReport}
        />
      )}
    </div>
  );
}
