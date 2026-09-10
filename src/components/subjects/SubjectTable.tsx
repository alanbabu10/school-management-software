import React from "react";
import { SubjectItem } from "@/types/subject";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import { Table, Column } from "@/components/ui/Table";

export interface SubjectTableProps {
  subjects: SubjectItem[];
  onEdit: (subject: SubjectItem) => void;
  onDelete: (subject: SubjectItem) => void;
  isLoading?: boolean;
}

export const SubjectTable: React.FC<SubjectTableProps> = ({
  subjects,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const columns: Column<SubjectItem>[] = [
    {
      header: "Code",
      cell: (s) => <Badge variant="primary">{s.code}</Badge>,
      className: "font-bold text-indigo-600",
    },
    {
      header: "Subject Name",
      accessorKey: "name",
      className: "font-semibold text-slate-900",
    },
    {
      header: "Actions",
      align: "right",
      cell: (s) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(s)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
            title="Edit Subject"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(s)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Subject"
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
      data={subjects}
      keyExtractor={(s) => s.id}
      emptyMessage="No subject codes found matching search."
      isLoading={isLoading}
    />
  );
};
