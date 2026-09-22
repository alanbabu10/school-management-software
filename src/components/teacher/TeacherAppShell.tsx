"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  CalendarDays,
  FileText,
  LogOut,
  Building2,
  Menu,
  X,
  UserCheck,
  BookOpen,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TeacherAppShellProps {
  teacherName: string;
  employeeId?: string;
  subjectStr?: string;
  children: React.ReactNode;
}

export const teacherNavItems = [
  { label: "Overview", href: "/teacher/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/teacher/students", icon: Users },
  { label: "Mark Attendance", href: "/teacher/attendance", icon: CalendarCheck },
  { label: "Homework", href: "/teacher/homework", icon: ClipboardList },
  { label: "Enter Marks", href: "/teacher/marks", icon: FileText },
  { label: "Class Timetable", href: "/teacher/timetable", icon: CalendarDays },
];

export const TeacherAppShell: React.FC<TeacherAppShellProps> = ({
  teacherName,
  employeeId,
  subjectStr,
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    try {
      await fetch("/api/teacher/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  };

  const isNavActive = (href: string) => {
    if (href === "/teacher/dashboard") {
      return pathname === "/teacher/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            aria-label="Open Sidebar Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xs tracking-tight block">
                St MARY&apos;s L P School
              </span>
              <span className="text-[10px] text-indigo-700 font-semibold block truncate max-w-[150px]">
                Teacher Portal • {teacherName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out w-[260px] ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header / School Title */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 shrink-0">
          <Link href="/teacher/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold shrink-0 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-slate-900 text-xs tracking-tight leading-snug truncate">
                St MARY&apos;s L P School
              </span>
              <span className="text-[10px] text-slate-500 font-medium truncate">
                Teacher Portal • Pallippuram
              </span>
            </div>
          </Link>

          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Selected Teacher Info Badge */}
        <div className="p-4 mx-3 my-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl shrink-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-indigo-600" /> Faculty Member
            </span>
            {employeeId && (
              <span className="text-[10px] font-extrabold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                ID: {employeeId}
              </span>
            )}
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 truncate">{teacherName}</h4>
            <p className="text-xs font-semibold text-indigo-800 flex items-center gap-1 mt-0.5">
              <BookOpen className="w-3 h-3" /> {subjectStr || "Faculty Member"}
            </p>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {teacherNavItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-150 group min-h-[44px] ${
                  active
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                    active ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer / Actions */}
        <div className="p-3 border-t border-slate-100 shrink-0 bg-slate-50/50 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen lg:pl-[260px] transition-all duration-300">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
