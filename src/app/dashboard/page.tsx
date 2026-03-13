"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Loader2, BarChart3, TrendingUp, LayoutDashboard, Package } from "lucide-react";
import { usePOSData } from "@/hooks/usePOSData";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import RankList from "@/components/dashboard/RankList";
import InventoryStatus from "@/components/dashboard/InventoryStatus";

const AIPrediction = dynamic(() => import("@/components/dashboard/AIPrediction"), {
  loading: () => (
    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-4xl shadow-2xl shadow-orange-200 flex items-center justify-center min-h-[300px]">
      <Loader2 className="animate-spin" size={32} />
    </div>
  ),
  ssr: false,
});

export default function DashboardPage() {
  const { dashboard, loading } = usePOSData();
  const { user } = useAuth();

  const dailyAvg = useMemo(() => {
    if (!dashboard || dashboard.recentSales.length === 0) return 0;
    return Math.round(
      dashboard.recentSales.reduce((s, d) => s + d.daily_total, 0) / dashboard.recentSales.length
    );
  }, [dashboard]);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-500 mb-4 mx-auto" size={48} />
          <p className="font-bold text-orange-600">데이터를 불러오고 있어요!</p>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <>
      <Header
        title="사장님, 어서오세요!"
        storeName={user ? `${user.storeName} 사장님` : undefined}
      />
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="이번달 매출"
            value={`₩${dashboard.totalSales.toLocaleString()}`}
            icon={BarChart3}
          />
          <StatCard
            title="일일 평균 매출"
            value={`₩${dailyAvg.toLocaleString()}`}
            icon={TrendingUp}
          />
          <StatCard
            title="인기 메뉴"
            value={dashboard.topMenus[0]?.menu_name || "-"}
            icon={LayoutDashboard}
          />
          <StatCard
            title="재고 품목 수"
            value={`${dashboard.inventoryStatus.length}종`}
            icon={Package}
          />
        </div>

        {/* Chart + AI Prediction */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <SalesChart recentSales={dashboard.recentSales} />
          <AIPrediction recentSales={dashboard.recentSales} />
        </div>

        {/* Rank + Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RankList topMenus={dashboard.topMenus} />
          <InventoryStatus items={dashboard.inventoryStatus} />
        </div>
      </div>
    </>
  );
}
