import React from "react";
import { FeeItem } from "@/types/fee";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Table, Column } from "@/components/ui/Table";
import { Button } from "@/components/ui/button";
import { CreditCard, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export interface FeeTableProps {
  feeRecords: FeeItem[];
  onRecordPayment: (fee: FeeItem) => void;
  onDeleteFee: (fee: FeeItem) => void;
  isLoading?: boolean;
}

export const FeeTable: React.FC<FeeTableProps> = ({
  feeRecords,
  onRecordPayment,
  onDeleteFee,
  isLoading = false,
}) => {
  const columns: Column<FeeItem>[] = [
    {
      header: "Student",
      cell: (f) => (
        <div className="flex items-center gap-3">
          <Avatar name={f.students?.full_name || "Student"} size="sm" />
          <div>
            <p className="font-bold text-slate-900">
              {f.students?.full_name || "Unassigned Student"}
            </p>
            {f.students?.admission_number && (
              <p className="text-[11px] text-slate-500">
                Adm #: {f.students.admission_number}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Class",
      cell: (f) =>
        f.students?.classes?.name ? (
          <Badge variant="primary">
            {f.students.classes.name}{" "}
            {f.students.classes.division ? `(${f.students.classes.division})` : ""}
          </Badge>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      header: "Fee Type",
      cell: (f) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs">{f.fee_type}</span>
          {f.remarks && (
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{f.remarks}</p>
          )}
        </div>
      ),
    },
    {
      header: "Amount",
      cell: (f) => (
        <span className="font-bold text-slate-900">
          ₹{Number(f.amount).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Paid",
      cell: (f) => (
        <span className="font-semibold text-emerald-600">
          ₹{Number(f.paid_amount || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Balance",
      cell: (f) => {
        const balance = Number(f.amount) - Number(f.paid_amount || 0);
        return (
          <span
            className={`font-semibold ${
              balance <= 0 ? "text-slate-400" : "text-rose-600"
            }`}
          >
            ₹{balance.toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      header: "Due Date",
      cell: (f) => (
        <span className="text-xs font-semibold text-slate-600">{f.due_date}</span>
      ),
    },
    {
      header: "Status",
      cell: (f) => {
        let variant: "success" | "warning" | "danger" | "primary" = "primary";
        if (f.status === "paid") variant = "success";
        else if (f.status === "partial") variant = "warning";
        else if (f.status === "overdue") variant = "danger";

        return (
          <Badge variant={variant} size="sm">
            {f.status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (f) => (
        <div className="flex items-center justify-end gap-2">
          {f.status !== "paid" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRecordPayment(f)}
              icon={<CreditCard className="w-3.5 h-3.5" />}
            >
              Collect
            </Button>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Settled
            </span>
          )}

          <button
            onClick={() => onDeleteFee(f)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Fee Record"
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
      data={feeRecords}
      keyExtractor={(f) => String(f.id)}
      emptyMessage="No fee records found."
      isLoading={isLoading}
    />
  );
};
