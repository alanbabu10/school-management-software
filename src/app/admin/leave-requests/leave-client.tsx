"use client";

import React, { useState } from "react";
import { CalendarOff, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Toast } from "@/components/ui/toast";

export interface LeaveRequest {
  id: string;
  student_name: string;
  class_name: string;
  from_date: string;
  to_date: string;
  reason: string;
  requested_by: string;
  status: "pending" | "approved" | "rejected";
}

export default function LeaveClient() {
  const [requests, setRequests] = useState<LeaveRequest[]>([
    {
      id: "1",
      student_name: "Test Student",
      class_name: "Class 10 - A",
      from_date: "2026-09-10",
      to_date: "2026-09-12",
      reason: "Family wedding out of town.",
      requested_by: "Robert Student (Parent)",
      status: "pending",
    },
    {
      id: "2",
      student_name: "Alice Johnson",
      class_name: "Class 9 - B",
      from_date: "2026-09-02",
      to_date: "2026-09-03",
      reason: "Fever and doctor recommended rest.",
      requested_by: "Mary Johnson (Parent)",
      status: "approved",
    },
  ]);

  const [toastMessage, setToastMessage] = useState("");

  const handleStatusChange = (id: string, newStatus: "approved" | "rejected") => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    setToastMessage(`Leave request marked as ${newStatus}.`);
    setTimeout(() => setToastMessage(""), 4000);
  };

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Leave Requests</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and approve leave applications submitted by parents and guardians
          </p>
        </div>
      </div>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Class</th>
                <th className="px-6 py-3.5">Leave Duration</th>
                <th className="px-6 py-3.5">Reason</th>
                <th className="px-6 py-3.5">Requested By</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.student_name} size="sm" />
                      <span className="font-semibold text-slate-900">{r.student_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge variant="primary">{r.class_name}</Badge></td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700">
                    {r.from_date} <span className="text-slate-400">to</span> {r.to_date}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">{r.reason}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{r.requested_by}</td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        r.status === "approved"
                          ? "success"
                          : r.status === "pending"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {r.status === "pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                          onClick={() => handleStatusChange(r.id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                          onClick={() => handleStatusChange(r.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
