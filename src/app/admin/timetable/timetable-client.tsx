"use client";

import React, { useState } from "react";
import { CalendarDays, Clock, User, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const sampleSchedule: Record<string, { time: string; subject: string; teacher: string; room: string }[]> = {
  Monday: [
    { time: "08:30 AM - 09:30 AM", subject: "Mathematics", teacher: "Sarah Jenkins", room: "Room 101" },
    { time: "09:30 AM - 10:30 AM", subject: "Physics", teacher: "Dr. Robert Vance", room: "Lab 2" },
    { time: "10:45 AM - 11:45 AM", subject: "English Literature", teacher: "Amanda Hayes", room: "Room 101" },
    { time: "11:45 AM - 12:45 PM", subject: "Chemistry", teacher: "Dr. Alan Grant", room: "Lab 1" },
  ],
  Tuesday: [
    { time: "08:30 AM - 09:30 AM", subject: "Biology", teacher: "Dr. Ellie Sattler", room: "Lab 3" },
    { time: "09:30 AM - 10:30 AM", subject: "Mathematics", teacher: "Sarah Jenkins", room: "Room 101" },
    { time: "10:45 AM - 11:45 AM", subject: "History", teacher: "Markus Aurelius", room: "Room 104" },
  ],
  Wednesday: [
    { time: "08:30 AM - 09:30 AM", subject: "Computer Science", teacher: "Tech Staff", room: "Comp Lab A" },
    { time: "09:30 AM - 10:30 AM", subject: "Physics", teacher: "Dr. Robert Vance", room: "Lab 2" },
    { time: "10:45 AM - 11:45 AM", subject: "Physical Education", teacher: "Coach Carter", room: "Gymnasium" },
  ],
  Thursday: [
    { time: "08:30 AM - 09:30 AM", subject: "Mathematics", teacher: "Sarah Jenkins", room: "Room 101" },
    { time: "09:30 AM - 10:30 AM", subject: "English", teacher: "Amanda Hayes", room: "Room 101" },
    { time: "10:45 AM - 11:45 AM", subject: "Geography", teacher: "Markus Aurelius", room: "Room 104" },
  ],
  Friday: [
    { time: "08:30 AM - 09:30 AM", subject: "Chemistry", teacher: "Dr. Alan Grant", room: "Lab 1" },
    { time: "09:30 AM - 10:30 AM", subject: "Biology", teacher: "Dr. Ellie Sattler", room: "Lab 3" },
    { time: "10:45 AM - 11:45 AM", subject: "Art & Design", teacher: "Claire Dearing", room: "Art Studio" },
  ],
  Saturday: [
    { time: "09:00 AM - 10:30 AM", subject: "Extra Mathematics Seminar", teacher: "Sarah Jenkins", room: "Auditorium" },
    { time: "10:30 AM - 12:00 PM", subject: "Sports & Activities", teacher: "Coach Carter", room: "Sports Ground" },
  ],
};

export default function TimetableClient({ classesList }: { classesList: { id: string; name: string }[] }) {
  const [selectedClass, setSelectedClass] = useState<string>(classesList[0]?.id || "Class 10");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Class Timetable & Schedule</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Weekly class schedule grid showing period times, assigned teachers, and room locations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={classesList.map((c) => ({ label: c.name, value: c.id }))}
            className="w-48"
          />
          <Button icon={<Plus className="w-4 h-4" />}>Add Period</Button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map((day) => {
          const periods = sampleSchedule[day] || [];

          return (
            <Card key={day} padding="sm" className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">{day}</h3>
                <Badge variant="primary" size="sm">{periods.length} Periods</Badge>
              </div>

              {periods.length > 0 ? (
                <div className="space-y-2.5">
                  {periods.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{p.subject}</span>
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                          {p.time}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" /> {p.teacher}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3 h-3 text-slate-400" /> {p.room}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No scheduled periods for {day}.</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
