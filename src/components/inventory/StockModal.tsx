"use client";

import { useState } from "react";
import { Loader2, PackagePlus, PackageMinus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { InventoryStatusItem } from "@/types/pos";

type StockAction = "stock_in" | "stock_out";

const TXN_TYPES: Record<StockAction, { value: string; label: string }[]> = {
  stock_in: [
    { value: "purchase", label: "납품/구매" },
    { value: "return", label: "반품 입고" },
    { value: "adjustment", label: "재고 조정" },
  ],
  stock_out: [
    { value: "adjustment", label: "사용/소진" },
    { value: "waste", label: "폐기/파손" },
    { value: "sale", label: "판매 차감" },
  ],
};

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryStatusItem | null;
  action: StockAction;
  onSubmit: (data: {
    item_id: number;
    qty: number;
    txn_type: string;
    note: string;
    action: StockAction;
  }) => Promise<void>;
}

export default function StockModal({ isOpen, onClose, item, action, onSubmit }: StockModalProps) {
  const [qty, setQty] = useState(1);
  const [txnType, setTxnType] = useState(TXN_TYPES[action][0].value);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isIn = action === "stock_in";
  const options = TXN_TYPES[action];

  const handleSubmit = async () => {
    if (!item || qty <= 0 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ item_id: item.item_id, qty, txn_type: txnType, note, action });
      setQty(1);
      setTxnType(TXN_TYPES[action][0].value);
      setNote("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${item.item_name} ${isIn ? "입고" : "출고"}`}
      subtitle={isIn ? "Stock In" : "Stock Out"}
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
            disabled={submitting || qty <= 0}
            className={`flex-1 py-4 rounded-2xl text-sm font-black shadow-lg transition-all disabled:opacity-30 text-white ${
              isIn
                ? "bg-blue-500 shadow-blue-200 hover:bg-blue-600"
                : "bg-orange-500 shadow-orange-200 hover:bg-orange-600"
            }`}
          >
            {submitting ? (
              <Loader2 className="animate-spin mx-auto" size={20} />
            ) : (
              <span className="flex items-center justify-center gap-2">
                {isIn ? <PackagePlus size={18} /> : <PackageMinus size={18} />}
                {isIn ? "입고 처리" : "출고 처리"}
              </span>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* 현재 재고 표시 */}
        <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-500">현재 재고</span>
          <span className="text-lg font-black text-slate-800">
            {item.stock_qty} <span className="text-sm text-slate-400">{item.unit}</span>
          </span>
        </div>

        {/* 수량 입력 */}
        <div>
          <label className="block text-xs font-black text-orange-400 uppercase mb-2">
            {isIn ? "입고 수량" : "출고 수량"}
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-xl font-bold hover:bg-slate-200 transition-all"
            >
              -
            </button>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Math.max(0, parseFloat(e.target.value) || 0))}
              className="flex-1 bg-slate-50 border-2 border-transparent focus:border-orange-200 rounded-2xl px-5 py-3 text-center text-lg font-black outline-none transition-all"
              min={1}
            />
            <button
              onClick={() => setQty(qty + 1)}
              className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-xl font-bold hover:bg-slate-200 transition-all"
            >
              +
            </button>
          </div>
          {!isIn && qty > item.stock_qty && (
            <p className="text-xs text-rose-500 font-bold mt-1">
              현재 재고({item.stock_qty})보다 많습니다
            </p>
          )}
        </div>

        {/* 사유 선택 */}
        <div>
          <label className="block text-xs font-black text-orange-400 uppercase mb-2">사유</label>
          <div className="grid grid-cols-3 gap-2">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTxnType(opt.value)}
                className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                  txnType === opt.value
                    ? isIn
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-orange-500 text-white shadow-md"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-xs font-black text-orange-400 uppercase mb-2">메모 (선택)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: OO마트 납품, 유통기한 만료 등"
            className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none transition-all"
          />
        </div>
      </div>
    </Modal>
  );
}
