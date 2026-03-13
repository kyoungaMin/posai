"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { DashboardData, AnalyticsData } from "@/types/pos";

// Simple in-memory cache for dashboard data
let dashboardCache: { data: DashboardData | null; timestamp: number } | null = null;
const CACHE_TTL = 60_000; // 1 minute

export function usePOSData() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(dashboardCache?.data ?? null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(!dashboardCache?.data);
  const abortRef = useRef<AbortController | null>(null);

  const fetchDashboard = useCallback(async (force = false) => {
    // Return cached data if still fresh
    if (!force && dashboardCache && Date.now() - dashboardCache.timestamp < CACHE_TTL) {
      setDashboard(dashboardCache.data);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/pos/dashboard");
      const data = await res.json();
      dashboardCache = { data, timestamp: Date.now() };
      setDashboard(data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (startDate?: string, endDate?: string) => {
    // Cancel previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await fetch(`/api/pos/analytics?${params}`, { signal: controller.signal });
      const data = await res.json();
      setAnalytics(data);
      return data as AnalyticsData;
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Analytics fetch error:", err);
      }
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
          const updated = {
            ...prev,
            inventoryStatus: prev.inventoryStatus.map((item) =>
              item.item_id === itemId ? { ...item, stock_qty: stockQty } : item
            ),
          };
          dashboardCache = { data: updated, timestamp: Date.now() };
          return updated;
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
        await fetchDashboard(true);
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
