// Supabase DB 스키마 타입 정의 (PostgreSQL)

export interface Store {
  store_id: string;
  name: string;
  business_type: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  user_id: string;
  store_id: string | null;
  display_name: string | null;
  role: "owner" | "manager" | "staff";
  avatar_url: string | null;
  created_at: string;
}

export interface Menu {
  menu_id: number;
  store_id: string;
  name: string;
  category: string;
  price: number;
  cost_price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Sale {
  sale_id: number;
  store_id: string;
  menu_id: number;
  sold_at: string;
  qty: number;
  unit_price: number;
  total_amount: number;
  payment_method: "card" | "cash" | "transfer" | "other";
  weather: string | null;
  temperature: number | null;
}

export interface InventoryItem {
  item_id: number;
  store_id: string;
  name: string;
  stock_qty: number;
  unit: string;
  safety_stock: number;
  status: "normal" | "low" | "out_of_stock";
  updated_at: string;
}

export interface PurchaseOrder {
  order_id: number;
  store_id: string;
  item_id: number;
  qty: number;
  unit_price: number;
  total_price: number;
  status: "pending" | "ordered" | "received" | "cancelled";
  supplier: string | null;
  ordered_at: string;
  received_at: string | null;
}

export interface DailySummary {
  summary_id: number;
  store_id: string;
  summary_date: string;
  total_sales: number;
  total_orders: number;
  total_qty: number;
  avg_ticket: number;
  top_menu_id: number | null;
  weather: string | null;
  temperature: number | null;
}

export interface SocialAccount {
  account_id: number;
  store_id: string;
  platform: "facebook" | "instagram" | "kakao";
  access_token: string | null;
  refresh_token: string | null;
  page_id: string | null;
  page_name: string | null;
  connected_at: string;
  expires_at: string | null;
}

export interface MarketingPost {
  post_id: number;
  store_id: string;
  user_id: string | null;
  platform: string;
  content: string;
  media_url: string | null;
  topic: string | null;
  status: "draft" | "published" | "failed";
  external_post_id: string | null;
  published_at: string | null;
  created_at: string;
}

export interface ChatSession {
  session_id: string;
  store_id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface ChatMessageRecord {
  message_id: number;
  session_id: string;
  role: "user" | "ai";
  content: string;
  created_at: string;
}

// ── 고도화 테이블 (004_enhanced_schema) ──

export interface SalesOrder {
  order_id: number;
  store_id: string;
  order_no: string | null;
  ordered_at: string;
  total_amount: number;
  payment_method: "card" | "cash" | "transfer" | "mixed" | "other";
  payment_status: "paid" | "partial" | "refunded" | "cancelled";
  weather: string | null;
  temperature: number | null;
  memo: string | null;
}

export interface SalesOrderItem {
  order_item_id: number;
  order_id: number;
  menu_id: number;
  qty: number;
  unit_price: number;
  subtotal: number;
}

export interface Refund {
  refund_id: number;
  order_id: number;
  amount: number;
  reason: string | null;
  refunded_at: string;
}

export interface RecipeBom {
  bom_id: number;
  menu_id: number;
  item_id: number;
  qty: number;
}

export interface InventoryTransaction {
  txn_id: number;
  store_id: string;
  item_id: number;
  qty_change: number;
  txn_type: "sale" | "purchase" | "adjustment" | "waste" | "return";
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

export interface AIForecast {
  forecast_id: number;
  store_id: string;
  forecast_type: "daily_sales" | "product_demand" | "reorder";
  target_date: string;
  predicted_value: number;
  actual_value: number | null;
  accuracy: number | null;
  details: Record<string, unknown> | null;
  model_version: string | null;
  created_at: string;
}

export interface Alert {
  alert_id: number;
  store_id: string;
  alert_type: "low_stock" | "out_of_stock" | "sales_drop" | "sales_peak" | "reorder" | "forecast";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  reference_table: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AlertSetting {
  setting_id: number;
  store_id: string;
  user_id: string;
  alert_type: string;
  is_enabled: boolean;
  channel: "in_app" | "email" | "kakao" | "push";
  threshold: Record<string, unknown> | null;
}

export interface MartHourlySales {
  id: number;
  store_id: string;
  sales_date: string;
  hour: number;
  total_sales: number;
  order_count: number;
}
