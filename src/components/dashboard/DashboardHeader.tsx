import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DashboardHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <Badge variant="primary" className="bg-white/10 text-white border-white/20 mb-2">
          Academic Year 2026-2027
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Good morning, Admin 👋
        </h2>
        <p className="text-indigo-100 text-sm mt-1 max-w-xl">
          Here is what&apos;s happening across Apex Academy today. Manage students, teachers, and school operations seamlessly.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 bg-white text-indigo-900 hover:bg-indigo-50 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xs transition"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </Link>
        <Link
          href="/admin/teachers"
          className="inline-flex items-center gap-2 bg-indigo-600/80 text-white hover:bg-indigo-600 border border-indigo-400/40 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          Add Teacher
        </Link>
      </div>
    </div>
  );
};
