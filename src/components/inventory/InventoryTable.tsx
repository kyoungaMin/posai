"use client";

import { useState } from "react";
import { PackagePlus, PackageMinus, AlertTriangle, Check, X } from "lucide-react";
import type { InventoryStatusItem } from "@/types/pos";

interface InventoryTableProps {
  items: InventoryStatusItem[];
  onStockIn: (item: InventoryStatusItem) => void;
  onStockOut: (item: InventoryStatusItem) => void;
  onUpdateSafetyStock: (itemId: number, safetyStock: number) => Promise<void>;
}

function getStatus(item: InventoryStatusItem) {
  if (item.stock_qty <= 0) return { label: "재고 없음", color: "bg-rose-100 text-rose-600" };
  const threshold = item.safety_stock ?? 5;
  if (item.stock_qty < threshold) return { label: "부족", color: "bg-amber-100 text-amber-600" };
  return { label: "정상", color: "bg-emerald-100 text-emerald-600" };
}

export default function InventoryTable({ items, onStockIn, onStockOut, onUpdateSafetyStock }: InventoryTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState(0);

  const startEdit = (item: InventoryStatusItem) => {
    setEditingId(item.item_id);
    setEditValue(item.safety_stock ?? 0);
  };

  const saveEdit = async (itemId: number) => {
    await onUpdateSafetyStock(itemId, editValue);
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden divide-y divide-orange-50">
        {items.map((item) => {
          const status = getStatus(item);
          const isEditing = editingId === item.item_id;
          return (
            <div key={item.item_id} className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-slate-800">{item.item_name}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {item.stock_qty} {item.unit}
                  </p>
                  <div className="mt-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">안전재고:</span>
                        <input type="number" value={editValue} onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                          className="w-14 bg-white border border-orange-200 rounded-lg px-2 py-0.5 text-xs font-bold text-center outline-none" autoFocus />
                        <button onClick={() => saveEdit(item.item_id)} className="text-emerald-500"><Check size={14} /></button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400"><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(item)} className="text-[10px] text-slate-400 hover:text-orange-500 transition-colors">
                        안전재고: {item.safety_stock ?? <span className="text-orange-400 underline">설정</span>}
                      </button>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onStockIn(item)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 transition-all"
                >
                  <PackagePlus size={16} /> 입고
                </button>
                <button
                  onClick={() => onStockOut(item)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-50 text-orange-600 text-xs font-black hover:bg-orange-100 transition-all"
                >
                  <PackageMinus size={16} /> 출고
                </button>
              </div>
              {item.stock_qty > 0 && item.safety_stock && item.stock_qty < item.safety_stock && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-bold">
                  <AlertTriangle size={12} /> 안전재고 미만 — 발주를 고려해보세요
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-orange-50/50 text-[10px] uppercase tracking-widest font-black text-orange-400">
              <th className="px-8 py-5">품목명</th>
              <th className="px-8 py-5">현재 재고</th>
              <th className="px-8 py-5">안전재고</th>
              <th className="px-8 py-5">상태</th>
              <th className="px-8 py-5 text-center">입출고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-50">
            {items.map((item) => {
              const status = getStatus(item);
              return (
                <tr key={item.item_id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-800">{item.item_name}</td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-slate-700">
                      {item.stock_qty} <span className="text-slate-400 text-xs">{item.unit}</span>
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {editingId === item.item_id ? (
                      <div className="flex items-center gap-2">
                        <input type="number" value={editValue} onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                          className="w-16 bg-white border border-orange-200 rounded-lg px-2 py-1 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-orange-200" autoFocus
                          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(item.item_id); if (e.key === "Escape") setEditingId(null); }} />
                        <button onClick={() => saveEdit(item.item_id)} className="text-emerald-500 hover:text-emerald-600"><Check size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(item)} className="text-sm text-slate-400 font-medium hover:text-orange-500 transition-colors cursor-pointer">
                        {item.safety_stock ?? <span className="text-orange-400 underline text-xs">설정</span>}
                      </button>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onStockIn(item)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 transition-all"
                      >
                        <PackagePlus size={14} /> 입고
                      </button>
                      <button
                        onClick={() => onStockOut(item)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-black hover:bg-orange-100 transition-all"
                      >
                        <PackageMinus size={14} /> 출고
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
