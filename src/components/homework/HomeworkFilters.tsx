import React from "react";
import { Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ClassOption } from "@/types/student";
import { SubjectItem } from "@/types/subject";

export interface HomeworkFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedClass: string;
  onClassChange: (value: string) => void;
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  classesList: ClassOption[];
  subjectsList: SubjectItem[];
}

export const HomeworkFilters: React.FC<HomeworkFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedSubject,
  onSubjectChange,
  classesList,
  subjectsList,
}) => {
  return (
    <Card padding="sm">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assignment title or teacher..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Class Filter */}
        <div className="w-full sm:w-48 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
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

        {/* Subject Filter */}
        <div className="w-full sm:w-48 flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="ALL">All Subjects</option>
            {subjectsList.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
};
