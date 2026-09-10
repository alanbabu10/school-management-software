import React from "react";
import { LeaveRequestItem } from "@/types/leave";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Table, Column } from "@/components/ui/Table";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Trash2, Calendar, FileText, Check, X } from "lucide-react";

export interface LeaveTableProps {
  requests: LeaveRequestItem[];
  onQuickApprove: (request: LeaveRequestItem) => void;
  onQuickReject: (request: LeaveRequestItem) => void;
  onOpenReview: (request: LeaveRequestItem) => void;
  onDeleteRequest: (request: LeaveRequestItem) => void;
  isLoading?: boolean;
}

export const LeaveTable: React.FC<LeaveTableProps> = ({
  requests,
  onQuickApprove,
  onQuickReject,
  onOpenReview,
  onDeleteRequest,
  isLoading = false,
}) => {
  // Compute day count between from_date and to_date
  const getDaysCount = (fromStr: string, toStr: string) => {
    if (!fromStr || !toStr) return 1;
    const from = new Date(fromStr);
    const to = new Date(toStr);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays || 1;
  };

  const columns: Column<LeaveRequestItem>[] = [
    {
      header: "Student",
      cell: (l) => (
        <div className="flex items-center gap-3">
          <Avatar name={l.students?.full_name || "Student"} size="sm" />
          <div>
            <p className="font-bold text-slate-900">
              {l.students?.full_name || "Unassigned Student"}
            </p>
            {l.students?.admission_number && (
              <p className="text-[11px] text-slate-500">
                Adm #: {l.students.admission_number}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Class",
      cell: (l) =>
        l.students?.classes?.name ? (
          <Badge variant="primary">
            {l.students.classes.name}{" "}
            {l.students.classes.division ? `(${l.students.classes.division})` : ""}
          </Badge>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      header: "Leave Duration",
      cell: (l) => {
        const days = getDaysCount(l.from_date, l.to_date);

        return (
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{l.from_date}</span>
              <span className="text-slate-400">to</span>
              <span>{l.to_date}</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 mt-1 inline-block">
              {days} {days === 1 ? "Day" : "Days"} Leave
            </span>
          </div>
        );
      },
    },
    {
      header: "Reason / Remarks",
      cell: (l) => (
        <div className="max-w-xs">
          <p className="text-xs text-slate-800 line-clamp-2 font-medium">{l.reason}</p>
          {l.remarks && (
            <p className="text-[11px] text-slate-500 italic mt-0.5">
              Review Note: {l.remarks}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Requested By",
      cell: (l) => (
        <span className="text-xs text-slate-600 font-medium">
          {l.requested_by || "Parent / Guardian"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (l) => {
        let variant: "warning" | "success" | "danger" = "warning";
        if (l.status === "approved") variant = "success";
        if (l.status === "rejected") variant = "danger";

        return (
          <Badge variant={variant} size="sm">
            {l.status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (l) => (
        <div className="flex items-center justify-end gap-1.5">
          {l.status === "pending" ? (
            <>
              <button
                onClick={() => onQuickApprove(l)}
                className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1"
                title="Approve Leave"
              >
                <Check className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                onClick={() => onQuickReject(l)}
                className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1"
                title="Reject Leave"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          ) : (
            <button
              onClick={() => onOpenReview(l)}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 underline px-2 py-1"
            >
              Update Review
            </button>
          )}

          <button
            onClick={() => onDeleteRequest(l)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Leave Request"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={requests}
      keyExtractor={(l) => String(l.id)}
      emptyMessage="No leave requests submitted."
      isLoading={isLoading}
    />
  );
};
