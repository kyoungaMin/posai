"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardData, AnalyticsData } from "@/types/pos";

export function usePOSData() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/pos/dashboard");
      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await fetch(`/api/pos/analytics?${params}`);
      const data = await res.json();
      setAnalytics(data);
      return data as AnalyticsData;
    } catch (err) {
      console.error("Analytics fetch error:", err);
      return null;
    }
  }, []);

  const updateStock = useCallback(async (itemId: number, stockQty: number) => {
    try {
      const res = await fetch("/api/pos/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", item_id: itemId, stock_qty: stockQty }),
      });
      const data = await res.json();
      if (data.success) {
        setDashboard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            inventoryStatus: prev.inventoryStatus.map((item) =>
              item.item_id === itemId ? { ...item, stock_qty: stockQty } : item
            ),
          };
        });
      }
      return data.success;
    } catch (err) {
      console.error("Stock update error:", err);
      return false;
    }
  }, []);

  const addItem = useCallback(async (item: { item_name: string; stock_qty: number; unit: string }) => {
    try {
      const res = await fetch("/api/pos/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", ...item }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchDashboard();
      }
      return data.success;
    } catch (err) {
      console.error("Add item error:", err);
      return false;
    }
  }, [fetchDashboard]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, analytics, loading, fetchDashboard, fetchAnalytics, updateStock, addItem };
}
