import React from "react";
import { AttendanceSummary } from "@/types/attendance";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search } from "lucide-react";

export interface AttendanceReportProps {
  reports: AttendanceSummary[];
  classesList: { id: string; name: string }[];
  selectedClass: string;
  onClassChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
}

export const AttendanceReport: React.FC<AttendanceReportProps> = ({
  reports,
  classesList,
  selectedClass,
  onClassChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  searchTerm,
  onSearchChange,
  isLoading = false,
}) => {
  const filteredReports = reports.filter(
    (r) =>
      r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Controls Card */}
      <Card padding="sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <Select
            label="Select Class"
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            options={classesList.map((c) => ({ label: c.name, value: c.id }))}
          />
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
          <Input
            label="Search Student"
            placeholder="Search name or adm no..."
            icon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </Card>

      {/* Summary Table Card */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Admission No</th>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5 text-center">Present</th>
                <th className="px-6 py-3.5 text-center">Absent</th>
                <th className="px-6 py-3.5 text-center">Late</th>
                <th className="px-6 py-3.5 text-center">Leave</th>
                <th className="px-6 py-3.5 text-center">Total Sessions</th>
                <th className="px-6 py-3.5 text-right">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    Generating attendance summary report...
                  </td>
                </tr>
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.student_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {report.admission_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={report.full_name} size="sm" />
                        <span className="font-semibold text-slate-900">{report.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-600">
                      {report.present}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-rose-600">
                      {report.absent}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-amber-600">
                      {report.late}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-sky-600">
                      {report.leave}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 font-semibold">
                      {report.total}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge
                        variant={
                          report.percentage >= 90
                            ? "success"
                            : report.percentage >= 75
                            ? "warning"
                            : "danger"
                        }
                      >
                        {report.percentage}% Rate
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No attendance records found for selected class & date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
