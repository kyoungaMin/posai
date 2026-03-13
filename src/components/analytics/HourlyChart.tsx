"use client";

import { memo } from "react";
import {
  BarChart, Bar, XAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
} from "recharts";

interface HourlySale {
  sales_time: string;
  hourly_total: number;
}

function HourlyChart({ data }: { data: HourlySale[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="sales_time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} />
          <RechartsTooltip
            contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontWeight: 800 }}
            formatter={(value: number) => [`₩${value.toLocaleString()}`, "매출액"]}
          />
          <Bar dataKey="hourly_total" radius={[8, 8, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={index % 2 === 0 ? "#f97316" : "#fb923c"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(HourlyChart);
