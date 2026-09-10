import React from "react";

export interface AttendanceSummaryBarProps {
  totalCount: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
}

export const AttendanceSummaryBar: React.FC<AttendanceSummaryBarProps> = ({
  totalCount,
  presentCount,
  absentCount,
  lateCount,
  leaveCount,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
      </div>
      <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/60 shadow-2xs">
        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Present</p>
        <p className="text-2xl font-bold text-emerald-900 mt-1">{presentCount}</p>
      </div>
      <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200/60 shadow-2xs">
        <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Absent</p>
        <p className="text-2xl font-bold text-rose-900 mt-1">{absentCount}</p>
      </div>
      <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/60 shadow-2xs">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Late / Leave</p>
        <p className="text-2xl font-bold text-amber-900 mt-1">{lateCount + leaveCount}</p>
      </div>
    </div>
  );
};
