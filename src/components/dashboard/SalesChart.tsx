"use client";

import type { RecentSale } from "@/types/pos";

interface SalesChartProps {
  recentSales: RecentSale[];
}

export default function SalesChart({ recentSales }: SalesChartProps) {
  return (
    <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-4xl border border-orange-100 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-black text-lg md:text-xl text-slate-800">최근 매출 추이</h3>
        <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
          최근 7일
        </span>
      </div>
      <div className="h-48 md:h-64 flex items-end gap-2 md:gap-4 px-2 md:px-4">
        {recentSales.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 md:gap-3 group">
            <div
              className="w-full bg-orange-50 rounded-t-xl md:rounded-t-2xl transition-all group-hover:bg-orange-400 relative"
              style={{ height: `${(day.daily_total / 1500000) * 100}%` }}
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl shadow-xl whitespace-nowrap z-10">
                ₩{day.daily_total.toLocaleString()}
              </div>
            </div>
            <span className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase">
              {day.sales_date.split("-").slice(1).join("/")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
