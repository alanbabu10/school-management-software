import React from "react";
import { NoticeItem } from "@/types/notice";
import { Badge } from "@/components/ui/badge";
import { Table, Column } from "@/components/ui/Table";
import { Edit2, Trash2, Paperclip, ExternalLink, Megaphone } from "lucide-react";

export interface NoticeTableProps {
  notices: NoticeItem[];
  onEdit: (notice: NoticeItem) => void;
  onDelete: (notice: NoticeItem) => void;
  isLoading?: boolean;
}

export const NoticeTable: React.FC<NoticeTableProps> = ({
  notices,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "teacher":
        return <Badge variant="success">TEACHERS ONLY</Badge>;
      case "parent":
        return <Badge variant="warning">PARENTS ONLY</Badge>;
      case "student":
        return <Badge variant="danger">STUDENTS ONLY</Badge>;
      default:
        return <Badge variant="primary">ALL SCHOOL</Badge>;
    }
  };

  const columns: Column<NoticeItem>[] = [
    {
      header: "Notice Title & Summary",
      cell: (n) => (
        <div className="max-w-md">
          <p className="font-bold text-slate-900 flex items-center gap-1.5">
            <Megaphone className="w-4 h-4 text-indigo-600 shrink-0" />
            {n.title}
          </p>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 whitespace-pre-line">
            {n.content}
          </p>
        </div>
      ),
    },
    {
      header: "Target Audience",
      cell: (n) => getRoleBadge(n.target_role || "all"),
    },
    {
      header: "Class",
      cell: (n) =>
        n.classes?.name ? (
          <Badge variant="primary">
            {n.classes.name} {n.classes.division ? `(${n.classes.division})` : ""}
          </Badge>
        ) : (
          <span className="text-slate-500 text-xs font-medium">All Classes</span>
        ),
    },
    {
      header: "Published Date",
      cell: (n) => {
        const dateStr = n.published_at
          ? n.published_at.split("T")[0]
          : n.created_at
          ? n.created_at.split("T")[0]
          : "—";

        return <span className="text-xs font-semibold text-slate-600">{dateStr}</span>;
      },
    },
    {
      header: "Attachment",
      cell: (n) => {
        if (!n.attachment_url) return <span className="text-xs text-slate-400">None</span>;

        return (
          <a
            href={n.attachment_url}
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
      cell: (n) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(n)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
            title="Edit Notice"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(n)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Notice"
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
      data={notices}
      keyExtractor={(n) => String(n.id)}
      emptyMessage="No notices published yet."
      isLoading={isLoading}
    />
  );
};
