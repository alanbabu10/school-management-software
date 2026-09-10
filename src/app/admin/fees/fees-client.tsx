"use client";

import React, { useState } from "react";
import { CreditCard, DollarSign, AlertCircle, CheckCircle2, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Toast } from "@/components/ui/toast";

export interface FeeRecord {
  id: string;
  student_name: string;
  fee_type: string;
  amount: number;
  paid: number;
  due_date: string;
  status: "paid" | "partial" | "pending" | "overdue";
}

export default function FeesClient() {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([
    {
      id: "1",
      student_name: "Test Student",
      fee_type: "Tuition Fee - Term 1",
      amount: 15000,
      paid: 15000,
      due_date: "2026-08-30",
      status: "paid",
    },
    {
      id: "2",
      student_name: "Alice Johnson",
      fee_type: "Annual Sports & Lab Fee",
      amount: 4500,
      paid: 2000,
      due_date: "2026-09-15",
      status: "partial",
    },
    {
      id: "3",
      student_name: "Michael Smith",
      fee_type: "Transport Fee - Q2",
      amount: 5000,
      paid: 0,
      due_date: "2026-09-01",
      status: "overdue",
    },
  ]);

  const [toastMessage, setToastMessage] = useState("");

  const totalFees = feeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = feeRecords.reduce((sum, r) => sum + r.paid, 0);
  const totalPending = totalFees - totalPaid;
  const overdueCount = feeRecords.filter((r) => r.status === "overdue").length;

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fee Management & Billing</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor student fee collections, pending balances, and overdue invoices
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>Collect Fee</Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Expected Fees"
          value={`₹${totalFees.toLocaleString()}`}
          description="Total billed amount"
          icon={<CreditCard className="w-6 h-6" />}
          accentColor="indigo"
        />
        <StatCard
          title="Total Collected"
          value={`₹${totalPaid.toLocaleString()}`}
          description="Paid by students"
          icon={<CheckCircle2 className="w-6 h-6" />}
          accentColor="emerald"
        />
        <StatCard
          title="Pending Balance"
          value={`₹${totalPending.toLocaleString()}`}
          description="Outstanding dues"
          icon={<Clock className="w-6 h-6" />}
          accentColor="amber"
        />
        <StatCard
          title="Overdue Accounts"
          value={overdueCount}
          description="Past due deadline"
          icon={<AlertCircle className="w-6 h-6" />}
          accentColor="rose"
        />
      </div>

      {/* Fee Records Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Fee Type</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Paid</th>
                <th className="px-6 py-3.5">Balance</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {feeRecords.map((record) => {
                const balance = record.amount - record.paid;

                return (
                  <tr key={record.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={record.student_name} size="sm" />
                        <span className="font-semibold text-slate-900">{record.student_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-800">{record.fee_type}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{record.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-emerald-600 font-semibold">₹{record.paid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-rose-600 font-semibold">₹{balance.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{record.due_date}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          record.status === "paid"
                            ? "success"
                            : record.status === "partial"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm">
                        Record Payment
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
