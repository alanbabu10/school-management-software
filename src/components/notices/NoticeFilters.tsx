import React from "react";
import { Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ClassOption } from "@/types/student";
import { TARGET_ROLE_OPTIONS } from "@/types/notice";

export interface NoticeFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedRole: string;
  onRoleChange: (val: string) => void;
  selectedClass: string;
  onClassChange: (val: string) => void;
  classesList: ClassOption[];
}

export const NoticeFilters: React.FC<NoticeFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedClass,
  onClassChange,
  classesList,
}) => {
  return (
    <Card padding="sm">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notice title or announcement details..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Role Filter */}
        <div className="w-full sm:w-48 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="ALL">All Target Roles</option>
            {TARGET_ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Class Filter */}
        <div className="w-full sm:w-48 flex items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="ALL">All Classes</option>
            {classesList.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name} {c.division ? `(${c.division})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
};
