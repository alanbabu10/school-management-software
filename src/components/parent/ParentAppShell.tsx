"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  CalendarDays,
  CreditCard,
  FileText,
  Megaphone,
  LogOut,
  Building2,
  Menu,
  X,
  UserCheck,
  RefreshCw,
} from "lucide-react";

interface ParentAppShellProps {
  childName: string;
  classNameStr: string;
  hasMultipleChildren: boolean;
  children: React.ReactNode;
}

export const parentNavItems = [
  { label: "Overview", href: "/parent/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/parent/attendance", icon: CalendarCheck },
  { label: "Homework", href: "/parent/homework", icon: ClipboardList },
  { label: "Timetable", href: "/parent/timetable", icon: CalendarDays },
  { label: "Fees Statement", href: "/parent/fees", icon: CreditCard },
  { label: "Exam Marks", href: "/parent/marks", icon: FileText },
  { label: "Notices & Circulars", href: "/parent/notices", icon: Megaphone },
];

export const ParentAppShell: React.FC<ParentAppShellProps> = ({
  childName,
  classNameStr,
  hasMultipleChildren,
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/parent/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    router.refresh();
    router.push("/login");
  };

  const isNavActive = (href: string) => {
    if (href === "/parent/dashboard") {
      return pathname === "/parent/dashboard";
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
                {childName} • {classNameStr}
              </span>
            </div>
          </div>
        </div>

        {hasMultipleChildren && (
          <Link
            href="/parent/select-child"
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100"
          >
            <RefreshCw className="w-3 h-3" /> Switch
          </Link>
        )}
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
          <Link href="/parent/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold shrink-0 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-slate-900 text-xs tracking-tight leading-snug truncate">
                St MARY&apos;s L P School
              </span>
              <span className="text-[10px] text-slate-500 font-medium truncate">
                Parent Portal • Pallippuram
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

        {/* Selected Child Info Badge */}
        <div className="p-4 mx-3 my-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-indigo-600" /> Active Student
            </span>
            {hasMultipleChildren && (
              <Link
                href="/parent/select-child"
                className="text-[10px] font-extrabold text-indigo-600 hover:underline flex items-center gap-0.5"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Switch
              </Link>
            )}
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 truncate">{childName}</h4>
            <p className="text-xs font-semibold text-indigo-800">{classNameStr}</p>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {parentNavItems.map((item) => {
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
          {hasMultipleChildren && (
            <Link
              href="/parent/select-child"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition"
            >
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              <span>Switch Child Profile</span>
            </Link>
          )}

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
