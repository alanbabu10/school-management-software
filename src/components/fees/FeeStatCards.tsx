import React from "react";
import { StatCard } from "@/components/ui/stat-card";
import { CreditCard, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export interface FeeStatCardsProps {
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  overdueCount: number;
}

export const FeeStatCards: React.FC<FeeStatCardsProps> = ({
  totalExpected,
  totalCollected,
  totalPending,
  overdueCount,
}) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Expected Fees"
        value={`₹${totalExpected.toLocaleString("en-IN")}`}
        description="Total billed amount"
        icon={<CreditCard className="w-6 h-6" />}
        accentColor="indigo"
      />
      <StatCard
        title="Total Collected"
        value={`₹${totalCollected.toLocaleString("en-IN")}`}
        description="Paid by students"
        icon={<CheckCircle2 className="w-6 h-6" />}
        accentColor="emerald"
      />
      <StatCard
        title="Pending Balance"
        value={`₹${totalPending.toLocaleString("en-IN")}`}
        description="Outstanding dues"
        icon={<Clock className="w-6 h-6" />}
        accentColor="amber"
      />
      <StatCard
        title="Overdue Accounts"
        value={overdueCount}
        description="Past payment deadline"
        icon={<AlertCircle className="w-6 h-6" />}
        accentColor="rose"
      />
    </div>
  );
};
