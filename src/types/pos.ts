// 매출, 상품, 재고 관련 데이터 타입

export interface DashboardData {
  storeName: string;
  totalSales: number;
  recentSales: RecentSale[];
  topMenus: TopMenu[];
  inventoryStatus: InventoryStatusItem[];
}

export interface RecentSale {
  sales_date: string;
  daily_total: number;
  weather?: string;
  temp?: number;
  season?: string;
}

export interface TopMenu {
  menu_name: string;
  total_qty: number;
  total_amount: number;
}

export interface InventoryStatusItem {
  item_id: number;
  item_name: string;
  stock_qty: number;
  unit: string;
  safety_stock?: number;
  status?: string;
}

export interface AnalyticsData {
  last30Days: { sales_date: string; daily_total: number }[];
  hourlySales: { sales_time: string; hourly_total: number; transaction_count: number }[];
  categorySales: { category: string; total_amount: number; total_qty: number }[];
  productRanking: { menu_name: string; total_qty: number; total_amount: number }[];
  dayOfWeekSales: { day_of_week: string; total_amount: number; day_count: number }[];
  weatherImpact: { weather: string; avg_sales: number }[];
  seasonalImpact: { season: string; avg_sales: number }[];
  summary: AnalyticsSummary;
}

export interface AnalyticsSummary {
  total_sales: number;
  total_transactions: number;
  total_qty: number;
  avg_transaction_value: number;
}

export interface WeeklyForecast {
  date: string;
  weather: string;
  temp: number;
  predictedSales: number;
  reason: string;
}

export interface ChatMessage {
  role: "user" | "ai";
  text: string;
}
