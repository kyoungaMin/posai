import { SupabaseClient } from "@supabase/supabase-js";
import type { DashboardData, AnalyticsData } from "@/types/pos";

// ── 사용자 매장 ID 조회 ──
export async function getStoreId(supabase: SupabaseClient): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("store_id")
    .eq("user_id", user.id)
    .single();

  return profile?.store_id || null;
}

// ── 대시보드 데이터 ──
export async function getDashboardData(supabase: SupabaseClient, storeId: string): Promise<DashboardData> {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  // 모든 쿼리를 병렬 실행
  const [storeRes, summariesRes, monthRes, menuSalesRes, inventoryRes] = await Promise.all([
    supabase.from("stores").select("name").eq("store_id", storeId).single(),
    supabase.from("daily_summary").select("summary_date, total_sales, weather, temperature").eq("store_id", storeId).order("summary_date", { ascending: false }).limit(7),
    supabase.from("daily_summary").select("total_sales").eq("store_id", storeId).gte("summary_date", monthStart),
    supabase.from("sales").select("menu_id, qty, total_amount, menus(name)").eq("store_id", storeId),
    supabase.from("inventory").select("item_id, name, stock_qty, unit, safety_stock").eq("store_id", storeId).order("name"),
  ]);

  const recentSales = (summariesRes.data || [])
    .map((s) => ({
      sales_date: s.summary_date,
      daily_total: s.total_sales,
      weather: s.weather || undefined,
      temp: s.temperature || undefined,
    }))
    .reverse();

  const totalSales = (monthRes.data || []).reduce((sum, s) => sum + s.total_sales, 0);

  const menuStats = new Map<number, { menu_name: string; total_qty: number; total_amount: number }>();
  for (const s of menuSalesRes.data || []) {
    const menuName = (s.menus as unknown as { name: string })?.name || `메뉴 ${s.menu_id}`;
    const existing = menuStats.get(s.menu_id) || { menu_name: menuName, total_qty: 0, total_amount: 0 };
    existing.total_qty += s.qty;
    existing.total_amount += s.total_amount;
    menuStats.set(s.menu_id, existing);
  }
  const topMenus = [...menuStats.values()]
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, 5);

  const inventoryStatus = (inventoryRes.data || []).map((i) => ({
    item_id: i.item_id,
    item_name: i.name,
    stock_qty: Number(i.stock_qty),
    unit: i.unit,
    safety_stock: i.safety_stock != null ? Number(i.safety_stock) : undefined,
  }));

  return {
    storeName: storeRes.data?.name || "내 매장",
    totalSales,
    recentSales,
    topMenus,
    inventoryStatus,
  };
}

// ── 분석 데이터 ──
export async function getAnalyticsData(
  supabase: SupabaseClient,
  storeId: string,
  startDate?: string,
  endDate?: string
): Promise<AnalyticsData> {
  // 매출 데이터 조회 (날짜 필터)
  let query = supabase
    .from("sales")
    .select("sale_id, menu_id, sold_at, qty, unit_price, total_amount, payment_method, weather, temperature, menus(name, category)")
    .eq("store_id", storeId);

  if (startDate) query = query.gte("sold_at", `${startDate}T00:00:00`);
  if (endDate) query = query.lte("sold_at", `${endDate}T23:59:59`);

  const { data: sales } = await query.order("sold_at", { ascending: true });

  const rows = sales || [];

  // 일별 매출
  const dailyMap = new Map<string, number>();
  for (const s of rows) {
    const date = s.sold_at.split("T")[0];
    dailyMap.set(date, (dailyMap.get(date) || 0) + s.total_amount);
  }
  const last30Days = [...dailyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sales_date, daily_total]) => ({ sales_date, daily_total }));

  // 시간대별
  const hourlyMap = new Map<string, { hourly_total: number; transaction_count: number }>();
  for (const s of rows) {
    const hour = new Date(s.sold_at).getHours().toString().padStart(2, "0") + ":00";
    const existing = hourlyMap.get(hour) || { hourly_total: 0, transaction_count: 0 };
    existing.hourly_total += s.total_amount;
    existing.transaction_count += 1;
    hourlyMap.set(hour, existing);
  }
  const hourlySales = [...hourlyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sales_time, data]) => ({ sales_time, ...data }));

  // 카테고리별
  const catMap = new Map<string, { total_amount: number; total_qty: number }>();
  for (const s of rows) {
    const category = (s.menus as unknown as { name: string; category: string })?.category || "기타";
    const existing = catMap.get(category) || { total_amount: 0, total_qty: 0 };
    existing.total_amount += s.total_amount;
    existing.total_qty += s.qty;
    catMap.set(category, existing);
  }
  const categorySales = [...catMap.entries()]
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.total_amount - a.total_amount);

  // 상품 랭킹
  const prodMap = new Map<number, { menu_name: string; total_qty: number; total_amount: number }>();
  for (const s of rows) {
    const menuName = (s.menus as unknown as { name: string })?.name || `메뉴 ${s.menu_id}`;
    const existing = prodMap.get(s.menu_id) || { menu_name: menuName, total_qty: 0, total_amount: 0 };
    existing.total_qty += s.qty;
    existing.total_amount += s.total_amount;
    prodMap.set(s.menu_id, existing);
  }
  const productRanking = [...prodMap.values()]
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, 10);

  // 요일별
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dowMap = new Map<string, { total_amount: number; dates: Set<string> }>();
  for (const s of rows) {
    const date = s.sold_at.split("T")[0];
    const day = dayNames[new Date(s.sold_at).getDay()];
    const existing = dowMap.get(day) || { total_amount: 0, dates: new Set<string>() };
    existing.total_amount += s.total_amount;
    existing.dates.add(date);
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
  const weatherDailyMap = new Map<string, { weather: string; total: number }>();
  for (const s of rows) {
    if (!s.weather) continue;
    const date = s.sold_at.split("T")[0];
    const key = `${date}_${s.weather}`;
    const existing = weatherDailyMap.get(key) || { weather: s.weather, total: 0 };
    existing.total += s.total_amount;
    weatherDailyMap.set(key, existing);
  }
  const weatherAgg = new Map<string, { totalSales: number; dayCount: number }>();
  for (const [, val] of weatherDailyMap) {
    const existing = weatherAgg.get(val.weather) || { totalSales: 0, dayCount: 0 };
    existing.totalSales += val.total;
    existing.dayCount += 1;
    weatherAgg.set(val.weather, existing);
  }
  const weatherImpact = [...weatherAgg.entries()].map(([weather, data]) => ({
    weather,
    avg_sales: data.totalSales / data.dayCount,
  }));

  // 계절 영향 (월 기반)
  const seasonNames = ["겨울", "겨울", "봄", "봄", "봄", "여름", "여름", "여름", "가을", "가을", "가을", "겨울"];
  const seasonDailyMap = new Map<string, { season: string; total: number }>();
  for (const s of rows) {
    const date = s.sold_at.split("T")[0];
    const month = new Date(s.sold_at).getMonth();
    const season = seasonNames[month];
    const key = `${date}_${season}`;
    const existing = seasonDailyMap.get(key) || { season, total: 0 };
    existing.total += s.total_amount;
    seasonDailyMap.set(key, existing);
  }
  const seasonAgg = new Map<string, { totalSales: number; dayCount: number }>();
  for (const [, val] of seasonDailyMap) {
    const existing = seasonAgg.get(val.season) || { totalSales: 0, dayCount: 0 };
    existing.totalSales += val.total;
    existing.dayCount += 1;
    seasonAgg.set(val.season, existing);
  }
  const seasonalImpact = [...seasonAgg.entries()].map(([season, data]) => ({
    season,
    avg_sales: data.totalSales / data.dayCount,
  }));

  // 요약
  const total_sales = rows.reduce((sum, s) => sum + s.total_amount, 0);
  const total_qty = rows.reduce((sum, s) => sum + s.qty, 0);

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
      total_transactions: rows.length,
      total_qty,
      avg_transaction_value: rows.length > 0 ? total_sales / rows.length : 0,
    },
  };
}

// ── 재고 조회 ──
export async function getInventory(supabase: SupabaseClient, storeId: string) {
  const { data } = await supabase
    .from("inventory")
    .select("item_id, name, stock_qty, unit, safety_stock, status")
    .eq("store_id", storeId)
    .order("name");

  return (data || []).map((i) => ({
    item_id: i.item_id,
    item_name: i.name,
    stock_qty: Number(i.stock_qty),
    unit: i.unit,
    safety_stock: Number(i.safety_stock),
    status: i.status,
  }));
}

// ── 재고 수량 업데이트 ──
export async function updateInventoryQty(
  supabase: SupabaseClient,
  storeId: string,
  itemId: number,
  stockQty: number
) {
  const { error } = await supabase
    .from("inventory")
    .update({ stock_qty: stockQty })
    .eq("item_id", itemId)
    .eq("store_id", storeId);

  return !error;
}

// ── 재고 품목 추가 ──
export async function addInventoryItem(
  supabase: SupabaseClient,
  storeId: string,
  name: string,
  stockQty: number,
  unit: string,
  safetyStock?: number
) {
  const insertData: Record<string, unknown> = { store_id: storeId, name, stock_qty: stockQty, unit };
  if (safetyStock !== undefined) insertData.safety_stock = safetyStock;

  const { data, error } = await supabase
    .from("inventory")
    .insert(insertData)
    .select("item_id")
    .single();

  if (error) return null;
  return data.item_id;
}

// ── 안전재고 업데이트 ──
export async function updateSafetyStock(
  supabase: SupabaseClient,
  storeId: string,
  itemId: number,
  safetyStock: number
) {
  const { error } = await supabase
    .from("inventory")
    .update({ safety_stock: safetyStock })
    .eq("item_id", itemId)
    .eq("store_id", storeId);
  return !error;
}

// ── 재고 트랜잭션 기록 ──
export async function logInventoryTransaction(
  supabase: SupabaseClient,
  storeId: string,
  itemId: number,
  qtyChange: number,
  txnType: "sale" | "purchase" | "adjustment" | "waste" | "return",
  note?: string
) {
  await supabase.from("inventory_transactions").insert({
    store_id: storeId,
    item_id: itemId,
    qty_change: qtyChange,
    txn_type: txnType,
    note,
  });
}

// ── 재고 트랜잭션 이력 조회 ──
export async function getInventoryTransactions(
  supabase: SupabaseClient,
  storeId: string,
  itemId?: number,
  limit = 30
) {
  let query = supabase
    .from("inventory_transactions")
    .select("txn_id, item_id, qty_change, txn_type, note, created_at, inventory(name, unit)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (itemId) {
    query = query.eq("item_id", itemId);
  }

  const { data } = await query;
  return (data || []).map((t) => ({
    txn_id: t.txn_id,
    item_id: t.item_id,
    item_name: (t.inventory as unknown as { name: string; unit: string })?.name || "",
    unit: (t.inventory as unknown as { name: string; unit: string })?.unit || "",
    qty_change: t.qty_change,
    txn_type: t.txn_type as string,
    note: t.note as string | null,
    created_at: t.created_at as string,
  }));
}

// ── 안전재고 알림 체크 & 생성 ──
export async function checkAndCreateStockAlert(
  supabase: SupabaseClient,
  storeId: string,
  itemId: number
) {
  const { data: item } = await supabase
    .from("inventory")
    .select("name, stock_qty, safety_stock, status")
    .eq("item_id", itemId)
    .eq("store_id", storeId)
    .single();

  if (!item) return;

  const stockQty = Number(item.stock_qty);
  const safetyStock = Number(item.safety_stock);

  if (stockQty <= 0) {
    await supabase.from("alerts").insert({
      store_id: storeId,
      alert_type: "out_of_stock",
      severity: "critical",
      title: `${item.name} 재고 소진`,
      message: `${item.name}의 재고가 0입니다. 즉시 발주가 필요합니다.`,
      reference_table: "inventory",
      reference_id: String(itemId),
    });
  } else if (stockQty < safetyStock) {
    await supabase.from("alerts").insert({
      store_id: storeId,
      alert_type: "low_stock",
      severity: "warning",
      title: `${item.name} 재고 부족`,
      message: `${item.name}의 재고(${stockQty})가 안전재고(${safetyStock}) 미만입니다.`,
      reference_table: "inventory",
      reference_id: String(itemId),
    });
  }
}

// ── 알림 조회 ──
export async function getAlerts(supabase: SupabaseClient, storeId: string, unreadOnly = false) {
  let query = supabase
    .from("alerts")
    .select("alert_id, alert_type, severity, title, message, is_read, created_at")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data } = await query;
  return data || [];
}

// ── 알림 읽음 처리 ──
export async function markAlertRead(supabase: SupabaseClient, storeId: string, alertId: number) {
  await supabase
    .from("alerts")
    .update({ is_read: true })
    .eq("alert_id", alertId)
    .eq("store_id", storeId);
}

// ── 채팅 세션 생성 ──
export async function createChatSession(
  supabase: SupabaseClient,
  storeId: string,
  userId: string,
  title: string
) {
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ store_id: storeId, user_id: userId, title })
    .select("session_id")
    .single();

  if (error) return null;
  return data.session_id as string;
}

// ── 채팅 메시지 저장 ──
export async function saveChatMessage(
  supabase: SupabaseClient,
  sessionId: string,
  role: "user" | "ai",
  content: string
) {
  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    role,
    content,
  });
}

// ── 채팅 세션 목록 조회 ──
export async function getChatSessions(supabase: SupabaseClient, storeId: string) {
  const { data } = await supabase
    .from("chat_sessions")
    .select("session_id, title, created_at")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data || [];
}

// ── 채팅 메시지 조회 ──
export async function getChatMessages(supabase: SupabaseClient, sessionId: string) {
  const { data } = await supabase
    .from("chat_messages")
    .select("message_id, role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  return data || [];
}

// ── AI 예측 저장 ──
export async function saveAIForecast(
  supabase: SupabaseClient,
  storeId: string,
  forecastType: "daily_sales" | "product_demand" | "reorder",
  targetDate: string,
  predictedValue: number,
  details?: Record<string, unknown>
) {
  await supabase.from("ai_forecasts").insert({
    store_id: storeId,
    forecast_type: forecastType,
    target_date: targetDate,
    predicted_value: predictedValue,
    details,
    model_version: "gemini-2.5-flash",
  });
}

// ── AI 주간 예측 조회 (DB 캐시) ──
export async function getCachedAIForecasts(
  supabase: SupabaseClient,
  storeId: string
) {
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("ai_forecasts")
    .select("target_date, predicted_value, details")
    .eq("store_id", storeId)
    .eq("forecast_type", "daily_sales")
    .gte("target_date", today)
    .order("target_date", { ascending: true })
    .limit(7);

  return data || [];
}

// ── 사용자 ID 조회 ──
export async function getUserId(supabase: SupabaseClient): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// ── 대시보드 컨텍스트 (AI용 요약) ──
export async function getStoreContext(supabase: SupabaseClient, storeId: string) {
  const { data: store } = await supabase
    .from("stores")
    .select("name, business_type")
    .eq("store_id", storeId)
    .single();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const startDate = sevenDaysAgo.toISOString().split("T")[0];

  const { data: summaries } = await supabase
    .from("daily_summary")
    .select("summary_date, total_sales, total_orders, weather, temperature")
    .eq("store_id", storeId)
    .gte("summary_date", startDate)
    .order("summary_date", { ascending: false })
    .limit(7);

  const { data: menuSales } = await supabase
    .from("sales")
    .select("menu_id, qty, total_amount, menus(name, category, price)")
    .eq("store_id", storeId)
    .gte("sold_at", `${startDate}T00:00:00`);

  const menuStats = new Map<number, { name: string; category: string; qty: number; amount: number }>();
  for (const s of menuSales || []) {
    const menu = s.menus as unknown as { name: string; category: string; price: number };
    const existing = menuStats.get(s.menu_id) || { name: menu?.name || "", category: menu?.category || "", qty: 0, amount: 0 };
    existing.qty += s.qty;
    existing.amount += s.total_amount;
    menuStats.set(s.menu_id, existing);
  }
  const topMenus = [...menuStats.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  const { data: inventory } = await supabase
    .from("inventory")
    .select("name, stock_qty, unit, safety_stock, status")
    .eq("store_id", storeId);

  const lowStockItems = (inventory || []).filter((i) => i.status === "low" || i.status === "out_of_stock");

  return {
    storeName: store?.name || "내 매장",
    businessType: store?.business_type || "카페",
    recentSales: (summaries || []).map((s) => ({
      date: s.summary_date,
      sales: s.total_sales,
      orders: s.total_orders,
      weather: s.weather,
      temp: s.temperature,
    })),
    topMenus,
    inventoryCount: (inventory || []).length,
    lowStockItems: lowStockItems.map((i) => ({
      name: i.name,
      qty: Number(i.stock_qty),
      unit: i.unit,
      status: i.status,
    })),
  };
}

// ── 마케팅 게시물 저장 ──
export async function saveMarketingPost(
  supabase: SupabaseClient,
  storeId: string,
  userId: string,
  platform: string,
  content: string,
  topic?: string,
  mediaUrl?: string
) {
  const { data, error } = await supabase
    .from("marketing_posts")
    .insert({
      store_id: storeId,
      user_id: userId,
      platform,
      content,
      topic,
      media_url: mediaUrl,
      status: "draft",
    })
    .select("post_id")
    .single();

  if (error) return null;
  return data.post_id;
}

// ── 마케팅 게시물 상태 업데이트 (게시 완료) ──
export async function updateMarketingPostStatus(
  supabase: SupabaseClient,
  storeId: string,
  postId: number,
  status: "published" | "failed",
  externalPostId?: string
) {
  await supabase
    .from("marketing_posts")
    .update({
      status,
      external_post_id: externalPostId,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("post_id", postId)
    .eq("store_id", storeId);
}

// ── 마케팅 게시물 목록 조회 ──
export async function getMarketingPosts(supabase: SupabaseClient, storeId: string) {
  const { data } = await supabase
    .from("marketing_posts")
    .select("post_id, platform, content, topic, status, media_url, published_at, created_at")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data || [];
}

// ── 소셜 계정 연결 상태 조회 ──
export async function getSocialAccount(supabase: SupabaseClient, storeId: string, platform: string) {
  const { data } = await supabase
    .from("social_accounts")
    .select("account_id, platform, page_name, page_id, access_token, connected_at, expires_at")
    .eq("store_id", storeId)
    .eq("platform", platform)
    .single();

  return data;
}

// ── 소셜 계정 연결/업데이트 ──
export async function upsertSocialAccount(
  supabase: SupabaseClient,
  storeId: string,
  platform: string,
  accessToken: string,
  pageId?: string,
  pageName?: string,
  expiresAt?: string
) {
  await supabase
    .from("social_accounts")
    .upsert(
      {
        store_id: storeId,
        platform,
        access_token: accessToken,
        page_id: pageId,
        page_name: pageName,
        expires_at: expiresAt,
      },
      { onConflict: "store_id,platform" }
    );
}

// ── 날씨 예보 저장 (upsert) ──
export async function saveWeatherForecasts(
  supabase: SupabaseClient,
  storeId: string,
  forecasts: {
    forecast_date: string;
    weather: string;
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    wind_speed: number;
    pop: number;
  }[]
) {
  if (forecasts.length === 0) return;

  await supabase
    .from("weather_forecasts")
    .upsert(
      forecasts.map((f) => ({
        store_id: storeId,
        ...f,
        source: "openweathermap",
        fetched_at: new Date().toISOString(),
      })),
      { onConflict: "store_id,forecast_date,source" }
    );
}

// ── 캐시된 날씨 예보 조회 (오늘 이후) ──
export async function getCachedWeatherForecasts(
  supabase: SupabaseClient,
  storeId: string
) {
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("weather_forecasts")
    .select("forecast_date, weather, temp, temp_min, temp_max, humidity, wind_speed, pop, fetched_at")
    .eq("store_id", storeId)
    .gte("forecast_date", today)
    .order("forecast_date", { ascending: true });

  return data || [];
}

// ── 캐시 유효성 검사 (1시간 이내 데이터 있으면 유효) ──
export async function isWeatherCacheValid(
  supabase: SupabaseClient,
  storeId: string
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("weather_forecasts")
    .select("id")
    .eq("store_id", storeId)
    .gte("fetched_at", oneHourAgo)
    .limit(1);

  return (data?.length ?? 0) > 0;
}
