"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  CreditCard,
  Megaphone,
  CalendarCheck,
  FileText,
  Building2,
  LogOut,
  ArrowRightLeft,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface ParentHeaderProps {
  childName: string;
  classNameStr: string;
  hasMultipleChildren: boolean;
}

export const parentNavItems = [
  { label: "Overview", href: "/parent/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/parent/attendance", icon: CalendarCheck },
  { label: "Homework", href: "/parent/homework", icon: ClipboardList },
  { label: "Timetable", href: "/parent/timetable", icon: CalendarDays },
  { label: "Fees", href: "/parent/fees", icon: CreditCard },
  { label: "Marks", href: "/parent/marks", icon: FileText },
  { label: "Notices", href: "/parent/notices", icon: Megaphone },
];

export const ParentHeader: React.FC<ParentHeaderProps> = ({
  childName,
  classNameStr,
  hasMultipleChildren,
}) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/parent/dashboard") {
      return pathname === "/parent/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/parent/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  };

  return (
    <>
      {/* Desktop & Tablet Top Header (Clean Light Theme) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 gap-4">
          {/* Left Brand & Logo */}
          <Link href="/parent/dashboard" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 leading-tight">
                St MARY&apos;s L P School
              </h1>
              <p className="text-[11px] text-slate-500 font-semibold">Pallippuram — Parent Portal</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {parentNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-indigo-50 text-indigo-700 font-extrabold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Child Profile & Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Active Child Profile Badge */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Avatar name={childName} size="sm" />
              <div className="text-left max-w-[120px] sm:max-w-none">
                <p className="text-xs font-extrabold text-slate-900 leading-tight truncate">
                  {childName}
                </p>
                <p className="text-[10px] text-indigo-600 font-bold leading-none mt-0.5">
                  {classNameStr}
                </p>
              </div>
            </div>

            {/* Switch Child Button */}
            {hasMultipleChildren && (
              <Link
                href="/parent/select-child"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-2 rounded-xl transition min-h-[38px]"
                title="Switch Child Profile"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch Child</span>
              </Link>
            )}

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 px-3 py-2 rounded-xl transition cursor-pointer min-h-[38px]"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (48px+ High Touch Targets) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-1 py-1 flex items-center justify-around shadow-lg">
        {parentNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[48px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
                active
                  ? "text-indigo-700 font-extrabold bg-indigo-50/80"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${active ? "text-indigo-600" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
