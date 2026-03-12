"use client";

import { PackagePlus, PackageMinus, RotateCcw, Trash2, ShoppingCart } from "lucide-react";

interface Transaction {
  txn_id: number;
  item_id: number;
  item_name: string;
  unit: string;
  qty_change: number;
  txn_type: string;
  note: string | null;
  created_at: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  loading: boolean;
}

const TXN_CONFIG: Record<string, { label: string; icon: typeof PackagePlus; color: string }> = {
  purchase: { label: "납품/구매", icon: PackagePlus, color: "text-blue-500 bg-blue-50" },
  return: { label: "반품 입고", icon: RotateCcw, color: "text-emerald-500 bg-emerald-50" },
  sale: { label: "판매", icon: ShoppingCart, color: "text-violet-500 bg-violet-50" },
  waste: { label: "폐기", icon: Trash2, color: "text-rose-500 bg-rose-50" },
  adjustment: { label: "재고 조정", icon: PackageMinus, color: "text-orange-500 bg-orange-50" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${month}/${day} ${hours}:${mins}`;
}

export default function TransactionHistory({ transactions, loading }: TransactionHistoryProps) {
  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm font-medium">
        이력을 불러오는 중...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm font-medium">
        아직 입출고 이력이 없습니다.
      </div>
    );
  }

  return (
    <div className="divide-y divide-orange-50">
      {transactions.map((txn) => {
        const config = TXN_CONFIG[txn.txn_type] || TXN_CONFIG.adjustment;
        const Icon = config.icon;
        const isPositive = txn.qty_change > 0;

        return (
          <div key={txn.txn_id} className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50/30 transition-colors">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-800 truncate">{txn.item_name}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">{config.label}</span>
              </div>
              {txn.note && (
                <p className="text-xs text-slate-400 truncate mt-0.5">{txn.note}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className={`text-sm font-black ${isPositive ? "text-blue-600" : "text-orange-600"}`}>
                {isPositive ? "+" : ""}{txn.qty_change} {txn.unit}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">{formatDate(txn.created_at)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
