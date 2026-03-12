"use client";

import Link from "next/link";
import { ChevronRight, AlertCircle } from "lucide-react";
import type { InventoryStatusItem } from "@/types/pos";

interface InventoryStatusProps {
  items: InventoryStatusItem[];
}

export default function InventoryStatus({ items }: InventoryStatusProps) {
  return (
    <div className="bg-white p-8 rounded-4xl border border-orange-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-xl text-slate-800">재고 현황</h3>
        <Link
          href="/inventory"
          className="text-xs font-black text-orange-400 hover:text-orange-600 flex items-center gap-1"
        >
          전체보기 <ChevronRight size={14} />
        </Link>
      </div>
      <div className="space-y-5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  item.stock_qty < 5 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                }`}
              />
              <span className="text-sm font-bold text-slate-700">{item.item_name}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.stock_qty < 5 ? "bg-rose-500" : "bg-orange-400"}`}
                  style={{ width: `${Math.min((item.stock_qty / 20) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-black w-14 text-right text-slate-500">
                {item.stock_qty}
                {item.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
      {items.some((i) => i.stock_qty < 5) && (
        <div className="mt-8 p-5 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-4">
          <div className="p-2 bg-rose-100 rounded-xl">
            <AlertCircle className="text-rose-500" size={24} />
          </div>
          <p className="text-xs text-rose-700 font-bold leading-relaxed">
            사장님, 재고가 부족한 품목이 있어요!
            <br />
            AI가 지금 바로 발주를 추천드려요.
          </p>
        </div>
      )}
    </div>
  );
}
