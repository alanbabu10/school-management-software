import React from "react";
import { GraduationCap, Users, School, BookOpen } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

export interface StatCardGridProps {
  studentCount: number;
  teacherCount: number;
  classCount: number;
  subjectCount: number;
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({
  studentCount,
  teacherCount,
  classCount,
  subjectCount,
}) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Students"
        value={studentCount}
        description="Enrolled active students"
        icon={<GraduationCap className="w-6 h-6" />}
        href="/admin/students"
        accentColor="indigo"
        trend={{ value: "+4.2%", isPositive: true }}
      />
      <StatCard
        title="Total Teachers"
        value={teacherCount}
        description="Active teaching faculty"
        icon={<Users className="w-6 h-6" />}
        href="/admin/teachers"
        accentColor="emerald"
      />
      <StatCard
        title="Active Classes"
        value={classCount}
        description="Assigned class divisions"
        icon={<School className="w-6 h-6" />}
        href="/admin/classes"
        accentColor="amber"
      />
      <StatCard
        title="Total Subjects"
        value={subjectCount}
        description="Curriculum subjects"
        icon={<BookOpen className="w-6 h-6" />}
        href="/admin/subjects"
        accentColor="sky"
      />
    </div>
  );
};
