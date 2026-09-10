import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  href?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: "indigo" | "emerald" | "amber" | "sky" | "rose" | "violet";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  href,
  trend,
  accentColor = "indigo",
}) => {
  const colorStyles = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
  };

  const CardWrapper = href ? Link : "div";

  return (
    <CardWrapper
      href={href || "#"}
      className={`group relative bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 block ${
        href ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">{value}</h3>
        </div>
        <div
          className={`p-3 rounded-xl border flex items-center justify-center ${colorStyles[accentColor]}`}
        >
          {icon}
        </div>
      </div>

      {(description || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {description && <span className="text-slate-500 font-medium">{description}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive !== false ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {trend.value}
            </span>
          )}
          {href && (
            <span className="text-indigo-600 font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
              View <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
            </span>
          )}
        </div>
      )}
    </CardWrapper>
  );
};
