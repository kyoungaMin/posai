"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: { item_name: string; stock_qty: number; unit: string }) => Promise<void>;
}

export default function AddItemModal({ isOpen, onClose, onAdd }: AddItemModalProps) {
  const [itemName, setItemName] = useState("");
  const [stockQty, setStockQty] = useState(0);
  const [unit, setUnit] = useState("L");
  const [adding, setAdding] = useState(false);

  const handleSubmit = async () => {
    if (!itemName || !unit || adding) return;
    setAdding(true);
    try {
      await onAdd({ item_name: itemName, stock_qty: stockQty, unit });
      setItemName("");
      setStockQty(0);
      setUnit("L");
      onClose();
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="새로운 품목 추가"
      subtitle="Add New Inventory Item"
      footer={
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl text-sm font-black text-slate-400 hover:bg-slate-100 transition-all"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={adding || !itemName || !unit}
            className="flex-1 py-4 bg-orange-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-orange-200 hover:opacity-90 transition-all disabled:opacity-30"
          >
            {adding ? <Loader2 className="animate-spin mx-auto" size={20} /> : "추가하기"}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-black text-orange-400 uppercase mb-2">품목명</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="예: 우유, 원두, 설탕 등"
            className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-orange-400 uppercase mb-2">초기 재고</label>
            <input
              type="number"
              value={stockQty}
              onChange={(e) => setStockQty(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-orange-400 uppercase mb-2">단위</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="L, kg, pcs 등"
              className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
