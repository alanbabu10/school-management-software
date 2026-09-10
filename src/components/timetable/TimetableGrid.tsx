"use client";

import React from "react";
import {
  TimetableEntry,
  DAYS_OF_WEEK,
  PERIOD_NUMBERS,
  DEFAULT_PERIOD_TIMES,
} from "@/types/timetable";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2, Plus, Clock, MapPin, User, BookOpen } from "lucide-react";

export interface TimetableGridProps {
  entries: TimetableEntry[];
  onAddSlot: (day?: string, period?: number) => void;
  onEditSlot: (entry: TimetableEntry) => void;
  onDeleteSlot: (entry: TimetableEntry) => void;
  viewMode?: "matrix" | "cards";
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  entries,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
  viewMode = "matrix",
}) => {
  // Helper to find entry matching (day, period) case-insensitively
  const getEntry = (day: string, period: number): TimetableEntry | undefined => {
    return entries.find(
      (e) =>
        e.day_of_week?.toLowerCase() === day.toLowerCase() &&
        Number(e.period_number) === Number(period)
    );
  };

  if (viewMode === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayEntries = entries
            .filter((e) => e.day_of_week?.toLowerCase() === day.toLowerCase())
            .sort((a, b) => Number(a.period_number) - Number(b.period_number));

          return (
            <Card key={day} padding="sm" className="space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <h3 className="font-bold text-slate-900 text-sm">{day}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {dayEntries.length} Periods
                    </Badge>
                    <button
                      onClick={() => onAddSlot(day)}
                      className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title={`Add period slot for ${day}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {dayEntries.length > 0 ? (
                  <div className="space-y-2.5">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/40 hover:border-indigo-200 transition group relative"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                P{entry.period_number}
                              </span>
                              <span className="font-bold text-slate-900 text-xs">
                                {entry.subjects?.name || "Subject"}
                              </span>
                              {entry.subjects?.code && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({entry.subjects.code})
                                </span>
                              )}
                            </div>
                            {(entry.start_time || entry.end_time) && (
                              <p className="text-[10px] font-semibold text-indigo-600 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-indigo-500" />
                                {entry.start_time} - {entry.end_time}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => onEditSlot(entry)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                              title="Edit slot"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteSlot(entry)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Delete slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          {entry.teachers?.full_name ? (
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <User className="w-3 h-3 text-slate-400" /> {entry.teachers.full_name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned Teacher</span>
                          )}

                          {entry.room_number ? (
                            <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                              <MapPin className="w-3 h-3 text-amber-500" /> {entry.room_number}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-xs text-slate-400 mb-2">No periods scheduled</p>
                    <button
                      onClick={() => onAddSlot(day)}
                      className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Slot
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  // Default: Matrix View (Period Numbers as Rows, Days as Columns)
  return (
    <Card padding="none" className="overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
              <th className="p-3.5 w-32 border-r border-slate-200 text-center bg-slate-100/70">
                Period / Time
              </th>
              {DAYS_OF_WEEK.map((day) => (
                <th key={day} className="p-3.5 text-center border-r last:border-r-0 border-slate-200">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {PERIOD_NUMBERS.map((period) => {
              const defaultTime = DEFAULT_PERIOD_TIMES[period];

              return (
                <tr key={period} className="hover:bg-slate-50/40 transition">
                  {/* Period Header Column */}
                  <td className="p-3 font-bold text-center bg-slate-50/80 border-r border-slate-200 text-slate-900">
                    <div className="text-xs font-bold">Period {period}</div>
                    {defaultTime && (
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {defaultTime.start} - {defaultTime.end}
                      </div>
                    )}
                  </td>

                  {/* Day Columns */}
                  {DAYS_OF_WEEK.map((day) => {
                    const entry = getEntry(day, period);

                    return (
                      <td
                        key={day}
                        className="p-2 border-r last:border-r-0 border-slate-200 vertical-top h-24 relative group"
                      >
                        {entry ? (
                          <div className="h-full p-2 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-bold text-slate-900 text-xs line-clamp-1">
                                  {entry.subjects?.name || "Subject"}
                                </span>

                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                                  <button
                                    onClick={() => onEditSlot(entry)}
                                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                    title="Edit slot"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteSlot(entry)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                    title="Delete slot"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {entry.subjects?.code && (
                                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                  {entry.subjects.code}
                                </span>
                              )}
                            </div>

                            <div className="mt-1.5 pt-1.5 border-t border-slate-100 space-y-0.5 text-[10px] text-slate-500">
                              {entry.teachers?.full_name && (
                                <div className="flex items-center gap-1 font-medium text-slate-700 truncate">
                                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{entry.teachers.full_name}</span>
                                </div>
                              )}

                              {entry.room_number && (
                                <div className="flex items-center gap-1 text-amber-700 font-semibold truncate">
                                  <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span className="truncate">{entry.room_number}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddSlot(day, period)}
                            className="w-full h-full min-h-[70px] rounded-xl border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-400 hover:text-indigo-600 flex flex-col items-center justify-center gap-1 transition group-hover:border-slate-300"
                          >
                            <Plus className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                            <span className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition">
                              Add Slot
                            </span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
