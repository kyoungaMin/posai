"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { usePOSData } from "@/hooks/usePOSData";
import Header from "@/components/layout/Header";
import InventoryTable from "@/components/inventory/InventoryTable";
import AddItemModal from "@/components/inventory/AddItemModal";

export default function InventoryPage() {
  const { dashboard, loading, updateStock, addItem } = usePOSData();
  const [showAddModal, setShowAddModal] = useState(false);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  if (!dashboard) return null;

  const handleUpdateStock = async (itemId: number, newQty: number) => {
    if (newQty < 0) return;
    await updateStock(itemId, newQty);
  };

  const handleAddItem = async (item: { item_name: string; stock_qty: number; unit: string }) => {
    await addItem(item);
  };

  return (
    <>
      <Header title="꼼꼼한 재고 관리" />
      <div className="bg-white rounded-4xl border border-orange-100 shadow-sm overflow-hidden">
        <div className="p-5 md:p-8 border-b border-orange-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="font-black text-lg md:text-xl text-slate-800">재고 및 발주 관리</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto bg-orange-500 text-white px-6 py-3 rounded-xl md:rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
          >
            <Plus size={20} /> 품목 추가
          </button>
        </div>

        <InventoryTable items={dashboard.inventoryStatus} onUpdateStock={handleUpdateStock} />
      </div>

      <AddItemModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddItem} />
    </>
  );
}
