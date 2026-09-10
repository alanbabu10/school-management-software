"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";

interface TopHeaderProps {
  onMobileMenuToggle: () => void;
}

const pageTitles: Record<string, { title: string; category?: string }> = {
  "/admin/dashboard": { title: "Dashboard", category: "Overview" },
  "/admin/students": { title: "Students", category: "Academic Management" },
  "/admin/teachers": { title: "Teachers", category: "Academic Management" },
  "/admin/classes": { title: "Classes", category: "Academic Management" },
  "/admin/subjects": { title: "Subjects", category: "Academic Management" },
  "/admin/attendance": { title: "Attendance", category: "Daily Operations" },
  "/admin/exams": { title: "Exams & Marks", category: "Academic Management" },
  "/admin/homework": { title: "Homework", category: "Daily Operations" },
  "/admin/timetable": { title: "Timetable", category: "Daily Operations" },
  "/admin/fees": { title: "Fees & Finance", category: "Financial Management" },
  "/admin/notices": { title: "Notices & Announcements", category: "Communication" },
  "/admin/leave-requests": { title: "Leave Requests", category: "Daily Operations" },
  "/admin/settings": { title: "System Settings", category: "Administration" },
};

export const TopHeader: React.FC<TopHeaderProps> = ({ onMobileMenuToggle }) => {
  const pathname = usePathname();
  const supabase = createClient();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("admin@school.com");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    }
    loadUser();
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const pageInfo = pageTitles[pathname] || {
    title: pathname.split("/").pop()?.replace("-", " ") || "Admin",
    category: "Management",
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumb / Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-600 capitalize">{pageInfo.category}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight capitalize">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search Input */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {/* Notifications Icon */}
        <button
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <Avatar name={userEmail} size="sm" />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                School Admin
              </span>
              <span className="text-[11px] text-slate-500 font-medium leading-none">
                {userEmail}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">Signed in as</p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>

              <Link
                href="/admin/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                Profile
              </Link>
              <Link
                href="/admin/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings
              </Link>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
