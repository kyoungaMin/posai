"use client";

import { memo } from "react";
import {
  AreaChart, Area, XAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";

interface DayOfWeekSale {
  day_of_week: string;
  total_amount: number;
}

function DayOfWeekChart({ data }: { data: DayOfWeekSale[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="day_of_week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: "#94a3b8" }} />
          <RechartsTooltip
            contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontWeight: 800 }}
            formatter={(value: number) => [`₩${value.toLocaleString()}`, "매출액"]}
          />
          <Area type="monotone" dataKey="total_amount" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(DayOfWeekChart);
