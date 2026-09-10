import React from "react";
import { Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ClassOption } from "@/types/student";

export interface FeeFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedClass: string;
  onClassChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedFeeType: string;
  onFeeTypeChange: (val: string) => void;
  classesList: ClassOption[];
  feeTypesList: string[];
}

export const FeeFilters: React.FC<FeeFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedStatus,
  onStatusChange,
  selectedFeeType,
  onFeeTypeChange,
  classesList,
  feeTypesList,
}) => {
  return (
    <Card padding="sm">
      <div className="flex flex-col lg:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name or admission number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-40">
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

          {/* Status Filter */}
          <div className="w-full sm:w-36">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Fee Type Filter */}
          <div className="w-full sm:w-44">
            <select
              value={selectedFeeType}
              onChange={(e) => onFeeTypeChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="ALL">All Fee Types</option>
              {feeTypesList.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
};
