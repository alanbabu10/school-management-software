"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, Building2, LogOut, UserCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export interface StudentChildOption {
  id: string;
  full_name: string;
  admission_number: string;
  date_of_birth?: string | null;
  status: string;
  classNameStr?: string | null;
}

export default function SelectChildClient({
  childrenList,
  parentPhone,
}: {
  childrenList: StudentChildOption[];
  parentPhone: string;
}) {
  const router = useRouter();
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSelectChild = async (childId: string) => {
    setSelectingId(childId);
    setError("");

    try {
      const res = await fetch("/api/parent/select-child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to select student.");
        setSelectingId(null);
        return;
      }

      router.refresh();
      router.push("/parent/dashboard");
    } catch {
      setError("An unexpected error occurred.");
      setSelectingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/parent/logout", { method: "POST" });
    } catch {}
    router.refresh();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-50/80 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 leading-tight">
                St MARY&apos;s L P School
              </h1>
              <p className="text-xs text-slate-500 font-semibold">Pallippuram — Parent Portal</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition cursor-pointer min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Title Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-1">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Select Student Profile</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Multiple student profiles found registered under parent phone number{" "}
            <span className="font-bold text-slate-900">{parentPhone}</span>. Select a child to view their dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 text-center">
            {error}
          </div>
        )}

        {/* Children Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {childrenList.map((child) => {
            const isSelecting = selectingId === child.id;

            return (
              <div
                key={child.id}
                onClick={() => !isSelecting && handleSelectChild(child.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-indigo-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-4 min-h-[140px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={child.full_name} size="md" />
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {child.full_name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Adm #: {child.admission_number || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                    {child.classNameStr || "Unassigned Class"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 group-hover:translate-x-0.5 transition-transform min-h-[44px]">
                    {isSelecting ? "Opening..." : "Select Profile"} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
