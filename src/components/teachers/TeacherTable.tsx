import React from "react";
import { Teacher } from "@/types/teacher";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit2, Power } from "lucide-react";
import { Table, Column } from "@/components/ui/Table";

export interface TeacherTableProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onToggleStatus: (teacher: Teacher) => void;
  isLoading?: boolean;
}

export const TeacherTable: React.FC<TeacherTableProps> = ({
  teachers,
  onEdit,
  onToggleStatus,
  isLoading = false,
}) => {
  const columns: Column<Teacher>[] = [
    {
      header: "Employee ID",
      accessorKey: "employee_id",
      className: "font-semibold text-slate-900",
    },
    {
      header: "Teacher",
      cell: (t) => (
        <div className="flex items-center gap-3">
          <Avatar name={t.full_name} size="sm" />
          <p className="font-semibold text-slate-900">{t.full_name}</p>
        </div>
      ),
    },
    {
      header: "Primary Subject",
      cell: (t) =>
        t.subject ? (
          <Badge variant="primary">{t.subject}</Badge>
        ) : (
          <span className="text-slate-400 text-xs">General</span>
        ),
    },
    {
      header: "Contact Phone",
      cell: (t) => t.phone || "—",
      className: "text-slate-600",
    },
    {
      header: "Joining Date",
      cell: (t) => t.joining_date || "—",
      className: "text-slate-600 text-xs",
    },
    {
      header: "Status",
      cell: (t) => (
        <Badge variant={t.status === "active" ? "success" : "neutral"}>
          {t.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (t) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(t)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
            title="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(t)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
            title="Toggle Status"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={teachers}
      keyExtractor={(t) => t.id}
      emptyMessage="No teacher records found."
      isLoading={isLoading}
    />
  );
};
