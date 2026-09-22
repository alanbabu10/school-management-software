import React from "react";
import {
  GraduationCap,
  Users,
  School,
  CreditCard,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

export interface StatCardGridProps {
  studentCount: number;
  teacherCount: number;
  classCount: number;
  pendingFeeAmount: number;
  pendingFeeCount: number;
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({
  studentCount,
  teacherCount,
  classCount,
  pendingFeeAmount,
  pendingFeeCount,
}) => {
  return (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Students"
        value={studentCount}
        description="Active enrolled students"
        icon={<GraduationCap className="w-5 h-5" />}
        href="/admin/students"
        accentColor="indigo"
      />
      <StatCard
        title="Total Teachers"
        value={teacherCount}
        description="Active faculty staff"
        icon={<Users className="w-5 h-5" />}
        href="/admin/teachers"
        accentColor="emerald"
      />
      <StatCard
        title="Total Classes"
        value={classCount}
        description="Class divisions & rooms"
        icon={<School className="w-5 h-5" />}
        href="/admin/classes"
        accentColor="amber"
      />
      <StatCard
        title="Pending Fees"
        value={`₹${pendingFeeAmount.toLocaleString("en-IN")}`}
        description={`${pendingFeeCount} unpaid / overdue records`}
        icon={<CreditCard className="w-5 h-5" />}
        href="/admin/fees"
        accentColor="rose"
      />
    </div>
  );
};
