import React from "react";
import { ClassItem } from "@/types/class";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { School, UserCheck, Edit2, Trash2 } from "lucide-react";

export interface ClassCardGridProps {
  classes: ClassItem[];
  onEdit: (cls: ClassItem) => void;
  onDelete: (cls: ClassItem) => void;
}

export const ClassCardGrid: React.FC<ClassCardGridProps> = ({
  classes,
  onEdit,
  onDelete,
}) => {
  if (classes.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
        No classes found matching criteria.
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {classes.map((cls) => (
        <Card key={cls.id} className="relative flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {cls.name} {cls.division && `- ${cls.division}`}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    AY: {cls.academic_year || "2026-2027"}
                  </p>
                </div>
              </div>
              {cls.division && (
                <Badge variant="primary" size="sm">
                  Div {cls.division}
                </Badge>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <UserCheck className="w-4 h-4 text-indigo-500" /> Class Teacher:
                </span>
                <span className="font-semibold text-slate-900">
                  {cls.teachers?.full_name || "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(cls)}
              icon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(cls)}
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
