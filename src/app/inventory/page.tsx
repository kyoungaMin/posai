"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, ClipboardList, Sparkles } from "lucide-react";
import Header from "@/components/layout/Header";
import InventoryTable from "@/components/inventory/InventoryTable";
import AddItemModal from "@/components/inventory/AddItemModal";
import StockModal from "@/components/inventory/StockModal";
import TransactionHistory from "@/components/inventory/TransactionHistory";
import type { InventoryStatusItem } from "@/types/pos";

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

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryStatusItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txnLoading, setTxnLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockAction, setStockAction] = useState<"stock_in" | "stock_out">("stock_in");
  const [selectedItem, setSelectedItem] = useState<InventoryStatusItem | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch("/api/pos/inventory");
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (err) {
      console.error("Inventory fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTxnLoading(true);
    try {
      const res = await fetch("/api/pos/inventory?view=transactions");
      const data = await res.json();
      if (Array.isArray(data)) setTransactions(data);
    } catch (err) {
      console.error("Transactions fetch error:", err);
    } finally {
      setTxnLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchTransactions();
  }, [fetchInventory, fetchTransactions]);

  const handleStockIn = (item: InventoryStatusItem) => {
    setSelectedItem(item);
    setStockAction("stock_in");
    setStockModalOpen(true);
  };

  const handleStockOut = (item: InventoryStatusItem) => {
    setSelectedItem(item);
    setStockAction("stock_out");
    setStockModalOpen(true);
  };

  const handleStockSubmit = async (data: {
    item_id: number;
    qty: number;
    txn_type: string;
    note: string;
    action: "stock_in" | "stock_out";
  }) => {
    const res = await fetch("/api/pos/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: data.action,
        item_id: data.item_id,
        qty: data.qty,
        txn_type: data.txn_type,
        note: data.note || undefined,
      }),
    });
    const result = await res.json();
    if (result.success) {
      await fetchInventory();
      await fetchTransactions();
    }
  };

  const handleAddItem = async (item: { item_name: string; stock_qty: number; unit: string; safety_stock?: number }) => {
    const res = await fetch("/api/pos/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", ...item }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchInventory();
      await fetchTransactions();
    }
  };

  const handleUpdateSafetyStock = async (itemId: number, safetyStock: number) => {
    const res = await fetch("/api/pos/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_safety_stock", item_id: itemId, safety_stock: safetyStock }),
    });
    const data = await res.json();
    if (data.success) await fetchInventory();
  };

  const [recommending, setRecommending] = useState(false);
  const [recommendations, setRecommendations] = useState<{ item_id: number; item_name: string; recommended: number; reason: string }[] | null>(null);

  const handleAIRecommend = async () => {
    if (recommending) return;
    setRecommending(true);
    try {
      const res = await fetch("/api/pos/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recommend_safety_stock" }),
      });
      const data = await res.json();
      if (data.recommendations) setRecommendations(data.recommendations);
    } catch (err) {
      console.error(err);
    } finally {
      setRecommending(false);
    }
  };

  const applyRecommendation = async (itemId: number, value: number) => {
    await handleUpdateSafetyStock(itemId, value);
    setRecommendations((prev) => prev?.filter((r) => r.item_id !== itemId) ?? null);
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  return (
    <>
      <Header title="꼼꼼한 재고 관리" />

      {/* 재고 현황 */}
      <div className="bg-white rounded-4xl border border-orange-100 shadow-sm overflow-hidden">
        <div className="p-5 md:p-8 border-b border-orange-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-black text-lg md:text-xl text-slate-800">재고 현황</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              입고/출고 버튼으로 간편하게 재고를 관리하세요
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <button
              onClick={handleAIRecommend}
              disabled={recommending || items.length === 0}
              className="w-full md:w-auto bg-violet-500 text-white px-5 py-3 rounded-xl md:rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-violet-200 disabled:opacity-40"
            >
              {recommending ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              AI 안전재고 추천
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full md:w-auto bg-orange-500 text-white px-5 py-3 rounded-xl md:rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
            >
              <Plus size={18} /> 품목 추가
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm font-medium">
            등록된 품목이 없습니다. 품목을 추가해보세요!
          </div>
        ) : (
          <InventoryTable items={items} onStockIn={handleStockIn} onStockOut={handleStockOut} onUpdateSafetyStock={handleUpdateSafetyStock} />
        )}
      </div>

      {/* AI 안전재고 추천 결과 */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-violet-50 rounded-4xl border border-violet-100 shadow-sm overflow-hidden mt-6">
          <div className="p-5 md:p-8 border-b border-violet-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-violet-500" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-800">AI 안전재고 추천</h3>
                <p className="text-xs text-slate-400 font-medium">입출고 패턴을 분석한 추천입니다</p>
              </div>
            </div>
            <button onClick={() => setRecommendations(null)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">닫기</button>
          </div>
          <div className="divide-y divide-violet-100">
            {recommendations.map((rec) => (
              <div key={rec.item_id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-800">{rec.item_name}</div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{rec.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-violet-600">추천: {rec.recommended}</div>
                  <div className="text-[10px] text-slate-400">
                    현재: {items.find((i) => i.item_id === rec.item_id)?.safety_stock ?? "미설정"}
                  </div>
                </div>
                <button
                  onClick={() => applyRecommendation(rec.item_id, rec.recommended)}
                  className="px-4 py-2 bg-violet-500 text-white text-xs font-black rounded-xl hover:bg-violet-600 transition-all shrink-0"
                >
                  적용
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 입출고 이력 */}
      <div className="bg-white rounded-4xl border border-orange-100 shadow-sm overflow-hidden mt-6">
        <div className="p-5 md:p-8 border-b border-orange-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <ClipboardList size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-800">최근 입출고 이력</h3>
            <p className="text-xs text-slate-400 font-medium">최근 30건의 입출고 기록</p>
          </div>
        </div>
        <TransactionHistory transactions={transactions} loading={txnLoading} />
      </div>

      {/* Modals */}
      <AddItemModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddItem} />
      <StockModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        item={selectedItem}
        action={stockAction}
        onSubmit={handleStockSubmit}
      />
    </>
  );
}
