"use client";

import { Minus, Plus } from "lucide-react";
import type { InventoryStatusItem } from "@/types/pos";

interface InventoryTableProps {
  items: InventoryStatusItem[];
  onUpdateStock: (itemId: number, newQty: number) => void;
}

export default function InventoryTable({ items, onUpdateStock }: InventoryTableProps) {
  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden divide-y divide-orange-50">
        {items.map((item) => (
          <div key={item.item_id} className="p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-black text-slate-800">{item.item_name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {item.unit} 단위
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                  item.stock_qty < 5 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {item.stock_qty < 5 ? "재고 부족" : "정상"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateStock(item.item_id, Math.max(0, item.stock_qty - 1))}
                className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 active:bg-orange-500 active:text-white transition-all"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={item.stock_qty}
                onChange={(e) => onUpdateStock(item.item_id, parseFloat(e.target.value) || 0)}
                className="w-16 bg-slate-50 border-none rounded-xl py-2 text-center font-black text-slate-700"
              />
              <button
                onClick={() => onUpdateStock(item.item_id, item.stock_qty + 1)}
                className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 active:bg-orange-500 active:text-white transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-orange-50/50 text-[10px] uppercase tracking-widest font-black text-orange-400">
              <th className="px-8 py-5">품목명</th>
              <th className="px-8 py-5">현재 재고</th>
              <th className="px-8 py-5">단위</th>
              <th className="px-8 py-5">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-50">
            {items.map((item) => (
              <tr key={item.item_id} className="hover:bg-orange-50/30 transition-colors">
                <td className="px-8 py-6 font-black text-slate-800">{item.item_name}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onUpdateStock(item.item_id, Math.max(0, item.stock_qty - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-orange-100 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={item.stock_qty}
                      onChange={(e) => onUpdateStock(item.item_id, parseFloat(e.target.value) || 0)}
                      className="w-20 bg-white border border-orange-100 rounded-lg px-3 py-1.5 text-center font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 outline-none"
                    />
                    <button
                      onClick={() => onUpdateStock(item.item_id, item.stock_qty + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-orange-100 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-slate-400">{item.unit}</td>
                <td className="px-8 py-6">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                      item.stock_qty < 5 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {item.stock_qty < 5 ? "재고 부족" : "정상"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
