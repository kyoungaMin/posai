"use client";

import { Loader2, BarChart3, TrendingUp, LayoutDashboard, Package } from "lucide-react";
import { usePOSData } from "@/hooks/usePOSData";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import AIPrediction from "@/components/dashboard/AIPrediction";
import RankList from "@/components/dashboard/RankList";
import InventoryStatus from "@/components/dashboard/InventoryStatus";

export default function DashboardPage() {
  const { dashboard, loading } = usePOSData();

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
      <Header title="사장님, 어서오세요!" />
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="누적 매출"
            value={`₩${dashboard.totalSales.toLocaleString()}`}
            change="+12.5%"
            icon={BarChart3}
            trend="up"
          />
          <StatCard
            title="일일 평균 매출"
            value={`₩${Math.round(dashboard.totalSales / 30).toLocaleString()}`}
            change="-2.1%"
            icon={TrendingUp}
            trend="down"
          />
          <StatCard title="인기 카테고리" value="커피류" icon={LayoutDashboard} />
          <StatCard title="재고 건전성" value="94%" change="+4%" icon={Package} trend="up" />
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
