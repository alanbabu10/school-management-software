import React from "react";
import { ExamItem } from "@/types/exam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, Column } from "@/components/ui/Table";
import { Edit2, Trash2, Award } from "lucide-react";

export interface ExamTableProps {
  exams: ExamItem[];
  onEdit: (exam: ExamItem) => void;
  onDelete: (exam: ExamItem) => void;
  onManageMarks: (exam: ExamItem) => void;
  isLoading?: boolean;
}

export const ExamTable: React.FC<ExamTableProps> = ({
  exams,
  onEdit,
  onDelete,
  onManageMarks,
  isLoading = false,
}) => {
  const columns: Column<ExamItem>[] = [
    {
      header: "Exam Title",
      accessorKey: "name",
      className: "font-semibold text-slate-900",
    },
    {
      header: "Assigned Class",
      cell: (e) =>
        e.classes?.name ? (
          <Badge variant="primary">
            {e.classes.name} {(e.classes as any).division ? `(${(e.classes as any).division})` : ""}
          </Badge>
        ) : (
          <span className="text-slate-400 text-xs">All Classes</span>
        ),
    },
    {
      header: "Exam Date",
      cell: (e) => e.exam_date || "—",
      className: "text-slate-600 text-xs font-medium",
    },
    {
      header: "Academic Year",
      cell: (e) => e.academic_year || "2026-2027",
      className: "text-slate-600 text-xs",
    },
    {
      header: "Actions",
      align: "right",
      cell: (e) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManageMarks(e)}
            icon={<Award className="w-3.5 h-3.5 text-indigo-600" />}
          >
            Marks & Results
          </Button>
          <button
            onClick={() => onEdit(e)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
            title="Edit Exam"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(e)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Exam"
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
      data={exams}
      keyExtractor={(e) => e.id}
      emptyMessage="No examination schedules found."
      isLoading={isLoading}
    />
  );
};
