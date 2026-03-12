// Phase 1 (MVP): 가상 데이터 - 향후 Supabase 연동 시 대체
import type { DashboardData, AnalyticsData } from "@/types/pos";

const menus = [
  { menu_id: 1, menu_name: "아메리카노", category: "커피", price: 4500 },
  { menu_id: 2, menu_name: "카페라떼", category: "커피", price: 5000 },
  { menu_id: 3, menu_name: "바닐라라떼", category: "커피", price: 5500 },
  { menu_id: 4, menu_name: "카라멜프라페", category: "블렌디드", price: 6000 },
  { menu_id: 5, menu_name: "치즈케이크", category: "디저트", price: 7000 },
  { menu_id: 6, menu_name: "크루아상", category: "디저트", price: 3500 },
];

function generateSalesData() {
  const now = new Date();
  const weathers = ["맑음", "흐림", "비", "눈"];
  const seasons = ["봄", "여름", "가을", "겨울"];
  const sales: Array<{
    sales_date: string;
    sales_time: string;
    menu_id: number;
    qty: number;
    amount: number;
    weather: string;
    temp: number;
    season: string;
  }> = [];

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const weather = weathers[Math.floor(Math.random() * weathers.length)];
    const temp = Math.floor(Math.random() * 30) + (weather === "눈" ? -5 : 5);
    const season = seasons[Math.floor(date.getMonth() / 3) % 4];

    const transactions = 30 + Math.floor(Math.random() * 20);
    for (let t = 0; t < transactions; t++) {
      const menuId = 1 + Math.floor(Math.random() * 6);
      const hour = 8 + Math.floor(Math.random() * 12);
      const qty = 1 + Math.floor(Math.random() * 2);
      const menu = menus.find((m) => m.menu_id === menuId)!;

      sales.push({
        sales_date: dateStr,
        sales_time: `${hour.toString().padStart(2, "0")}:00`,
        menu_id: menuId,
        qty,
        amount: qty * menu.price,
        weather,
        temp,
        season,
      });
    }
  }
  return sales;
}

// 고정 시드로 일관된 데이터 생성
let cachedSales: ReturnType<typeof generateSalesData> | null = null;
function getSales() {
  if (!cachedSales) cachedSales = generateSalesData();
  return cachedSales;
}

const inventory = [
  { item_id: 1, item_name: "우유", stock_qty: 20, unit: "L" },
  { item_id: 2, item_name: "에스프레소 원두", stock_qty: 5, unit: "kg" },
  { item_id: 3, item_name: "치즈케이크", stock_qty: 10, unit: "개" },
  { item_id: 4, item_name: "바닐라 시럽", stock_qty: 2, unit: "L" },
];

export function getDashboardData(): DashboardData {
  const sales = getSales();
  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);

  // 최근 7일 매출
  const dateMap = new Map<string, { daily_total: number; weather: string; temp: number; season: string }>();
  for (const s of sales) {
    const existing = dateMap.get(s.sales_date);
    if (existing) {
      existing.daily_total += s.amount;
    } else {
      dateMap.set(s.sales_date, { daily_total: s.amount, weather: s.weather, temp: s.temp, season: s.season });
    }
  }
  const recentSales = [...dateMap.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 7)
    .map(([sales_date, data]) => ({ sales_date, ...data }));

  // 인기 메뉴 TOP 5
  const menuStats = new Map<number, { total_qty: number; total_amount: number }>();
  for (const s of sales) {
    const existing = menuStats.get(s.menu_id) || { total_qty: 0, total_amount: 0 };
    existing.total_qty += s.qty;
    existing.total_amount += s.amount;
    menuStats.set(s.menu_id, existing);
  }
  const topMenus = [...menuStats.entries()]
    .map(([menuId, stats]) => ({
      menu_name: menus.find((m) => m.menu_id === menuId)!.menu_name,
      ...stats,
    }))
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, 5);

  return {
    storeName: "대박카페",
    totalSales,
    recentSales,
    topMenus,
    inventoryStatus: [...inventory],
  };
}

export function getAnalyticsData(startDate?: string, endDate?: string): AnalyticsData {
  let sales = getSales();

  if (startDate && endDate) {
    sales = sales.filter((s) => s.sales_date >= startDate && s.sales_date <= endDate);
  }

  // 일별 매출
  const dailyMap = new Map<string, number>();
  for (const s of sales) {
    dailyMap.set(s.sales_date, (dailyMap.get(s.sales_date) || 0) + s.amount);
  }
  const last30Days = [...dailyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sales_date, daily_total]) => ({ sales_date, daily_total }));

  // 시간대별
  const hourlyMap = new Map<string, { hourly_total: number; transaction_count: number }>();
  for (const s of sales) {
    const existing = hourlyMap.get(s.sales_time) || { hourly_total: 0, transaction_count: 0 };
    existing.hourly_total += s.amount;
    existing.transaction_count += 1;
    hourlyMap.set(s.sales_time, existing);
  }
  const hourlySales = [...hourlyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sales_time, data]) => ({ sales_time, ...data }));

  // 카테고리별
  const catMap = new Map<string, { total_amount: number; total_qty: number }>();
  for (const s of sales) {
    const menu = menus.find((m) => m.menu_id === s.menu_id)!;
    const existing = catMap.get(menu.category) || { total_amount: 0, total_qty: 0 };
    existing.total_amount += s.amount;
    existing.total_qty += s.qty;
    catMap.set(menu.category, existing);
  }
  const categorySales = [...catMap.entries()]
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.total_amount - a.total_amount);

  // 상품 랭킹
  const prodMap = new Map<number, { total_qty: number; total_amount: number }>();
  for (const s of sales) {
    const existing = prodMap.get(s.menu_id) || { total_qty: 0, total_amount: 0 };
    existing.total_qty += s.qty;
    existing.total_amount += s.amount;
    prodMap.set(s.menu_id, existing);
  }
  const productRanking = [...prodMap.entries()]
    .map(([menuId, data]) => ({
      menu_name: menus.find((m) => m.menu_id === menuId)!.menu_name,
      ...data,
    }))
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, 10);

  // 요일별
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dowMap = new Map<string, { total_amount: number; dates: Set<string> }>();
  for (const s of sales) {
    const day = dayNames[new Date(s.sales_date).getDay()];
    const existing = dowMap.get(day) || { total_amount: 0, dates: new Set<string>() };
    existing.total_amount += s.amount;
    existing.dates.add(s.sales_date);
    dowMap.set(day, existing);
  }
  const dayOrder = ["월", "화", "수", "목", "금", "토", "일"];
  const dayOfWeekSales = dayOrder
    .filter((d) => dowMap.has(d))
    .map((day) => ({
      day_of_week: day,
      total_amount: dowMap.get(day)!.total_amount,
      day_count: dowMap.get(day)!.dates.size,
    }));

  // 날씨 영향
  const weatherMap = new Map<string, { totalSales: number; dayCount: number }>();
  const dailyWeather = new Map<string, { weather: string; total: number }>();
  for (const s of sales) {
    const key = `${s.sales_date}_${s.weather}`;
    const existing = dailyWeather.get(key) || { weather: s.weather, total: 0 };
    existing.total += s.amount;
    dailyWeather.set(key, existing);
  }
  for (const [, val] of dailyWeather) {
    const existing = weatherMap.get(val.weather) || { totalSales: 0, dayCount: 0 };
    existing.totalSales += val.total;
    existing.dayCount += 1;
    weatherMap.set(val.weather, existing);
  }
  const weatherImpact = [...weatherMap.entries()].map(([weather, data]) => ({
    weather,
    avg_sales: data.totalSales / data.dayCount,
  }));

  // 계절 영향
  const seasonMap = new Map<string, { totalSales: number; dayCount: number }>();
  const dailySeason = new Map<string, { season: string; total: number }>();
  for (const s of sales) {
    const key = `${s.sales_date}_${s.season}`;
    const existing = dailySeason.get(key) || { season: s.season, total: 0 };
    existing.total += s.amount;
    dailySeason.set(key, existing);
  }
  for (const [, val] of dailySeason) {
    const existing = seasonMap.get(val.season) || { totalSales: 0, dayCount: 0 };
    existing.totalSales += val.total;
    existing.dayCount += 1;
    seasonMap.set(val.season, existing);
  }
  const seasonalImpact = [...seasonMap.entries()].map(([season, data]) => ({
    season,
    avg_sales: data.totalSales / data.dayCount,
  }));

  // 요약
  const total_sales = sales.reduce((sum, s) => sum + s.amount, 0);
  const total_qty = sales.reduce((sum, s) => sum + s.qty, 0);

  return {
    last30Days,
    hourlySales,
    categorySales,
    productRanking,
    dayOfWeekSales,
    weatherImpact,
    seasonalImpact,
    summary: {
      total_sales,
      total_transactions: sales.length,
      total_qty,
      avg_transaction_value: sales.length > 0 ? total_sales / sales.length : 0,
    },
  };
}

// 재고 관리 (in-memory)
let inventoryData = [...inventory];

export function getInventory() {
  return inventoryData;
}

export function updateInventory(itemId: number, stockQty: number) {
  const item = inventoryData.find((i) => i.item_id === itemId);
  if (!item) return false;
  item.stock_qty = stockQty;
  return true;
}

export function addInventoryItem(itemName: string, stockQty: number, unit: string) {
  const newId = Math.max(...inventoryData.map((i) => i.item_id)) + 1;
  inventoryData.push({ item_id: newId, item_name: itemName, stock_qty: stockQty, unit });
  return newId;
}
