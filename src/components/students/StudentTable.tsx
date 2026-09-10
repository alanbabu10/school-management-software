import React from "react";
import { Student } from "@/types/student";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import { Table, Column } from "@/components/ui/Table";

export interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  isLoading?: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const columns: Column<Student>[] = [
    {
      header: "Admission No",
      accessorKey: "admission_number",
      className: "font-semibold text-slate-900",
    },
    {
      header: "Student",
      cell: (s) => (
        <div className="flex items-center gap-3">
          <Avatar name={s.full_name} size="sm" />
          <div>
            <p className="font-semibold text-slate-900">{s.full_name}</p>
            <p className="text-[11px] text-slate-400 capitalize">{s.gender || "Student"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Class",
      cell: (s) =>
        s.classes?.name ? (
          <Badge variant="primary">{s.classes.name}</Badge>
        ) : (
          <span className="text-slate-400 text-xs">Unassigned</span>
        ),
    },
    {
      header: "Parent / Contact",
      cell: (s) =>
        s.parent_name ? (
          <div>
            <p className="text-slate-900 font-medium">{s.parent_name}</p>
            <p className="text-xs text-slate-500">{s.parent_phone || s.phone || "—"}</p>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      header: "Status",
      cell: (s) => (
        <Badge variant={s.status === "active" ? "success" : "neutral"}>
          {s.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (s) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(s)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
            title="Edit Student"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(s)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Student"
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
      data={students}
      keyExtractor={(s) => s.id}
      emptyMessage="No students match your search criteria."
      isLoading={isLoading}
    />
  );
};
