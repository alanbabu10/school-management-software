import React from "react";
import { HomeworkItem } from "@/types/homework";
import { Badge } from "@/components/ui/badge";
import { Table, Column } from "@/components/ui/Table";
import { Edit2, Trash2, Paperclip, ExternalLink } from "lucide-react";

export interface HomeworkTableProps {
  homeworks: HomeworkItem[];
  onEdit: (homework: HomeworkItem) => void;
  onDelete: (homework: HomeworkItem) => void;
  isLoading?: boolean;
}

export const HomeworkTable: React.FC<HomeworkTableProps> = ({
  homeworks,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const columns: Column<HomeworkItem>[] = [
    {
      header: "Assignment Title",
      cell: (h) => (
        <div>
          <p className="font-bold text-slate-900">{h.title}</p>
          {h.description && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{h.description}</p>
          )}
        </div>
      ),
    },
    {
      header: "Class",
      cell: (h) =>
        h.classes?.name ? (
          <Badge variant="primary">
            {h.classes.name} {h.classes.division ? `(${h.classes.division})` : ""}
          </Badge>
        ) : (
          <span className="text-slate-400 text-xs">Unassigned</span>
        ),
    },
    {
      header: "Subject",
      cell: (h) =>
        h.subjects?.name ? (
          <span className="font-semibold text-slate-800 text-xs">{h.subjects.name}</span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      header: "Assigned Teacher",
      cell: (h) =>
        h.teachers?.full_name ? (
          <span className="text-xs text-slate-600 font-medium">{h.teachers.full_name}</span>
        ) : (
          <span className="text-slate-400 text-xs">Unassigned</span>
        ),
    },
    {
      header: "Due Date",
      cell: (h) => <span className="text-xs font-semibold text-amber-700">{h.due_date}</span>,
    },
    {
      header: "Attachment",
      cell: (h) => {
        const url = h.attachment_url || (h as any).attachment;
        if (!url) return <span className="text-xs text-slate-400">None</span>;

        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            <Paperclip className="w-3.5 h-3.5" /> Attachment <ExternalLink className="w-3 h-3" />
          </a>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (h) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(h)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
            title="Edit Homework"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(h)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Homework"
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
      data={homeworks}
      keyExtractor={(h) => String(h.id)}
      emptyMessage="No homework assignments found."
      isLoading={isLoading}
    />
  );
};
