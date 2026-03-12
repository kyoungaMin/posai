"use client";

import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down";
}

export default function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-orange-50 rounded-2xl">
          <Icon size={24} className="text-orange-500" />
        </div>
        {trend && (
          <span
            className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
              trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}
          >
            {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </span>
        )}
      </div>
      <h3 className="text-sm font-bold text-slate-400 mb-1">{title}</h3>
      <p className="text-2xl font-extrabold tracking-tight text-slate-800">{value}</p>
    </div>
  );
}
