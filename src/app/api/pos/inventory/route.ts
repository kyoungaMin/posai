import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getStoreId,
  getInventory,
  updateInventoryQty,
  addInventoryItem,
  logInventoryTransaction,
  checkAndCreateStockAlert,
  getInventoryTransactions,
  updateSafetyStock,
} from "@/lib/supabase/queries";
import { geminiService } from "@/lib/gemini/client";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const storeId = await getStoreId(supabase);

  if (!storeId) {
    return NextResponse.json({ error: "매장 정보가 없습니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");

  // 입출고 이력 조회
  if (view === "transactions") {
    const itemId = searchParams.get("item_id");
    const transactions = await getInventoryTransactions(
      supabase,
      storeId,
      itemId ? parseInt(itemId, 10) : undefined
    );
    return NextResponse.json(transactions);
  }

  const data = await getInventory(supabase, storeId);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const storeId = await getStoreId(supabase);

  if (!storeId) {
    return NextResponse.json({ error: "매장 정보가 없습니다." }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  // 입고/출고 처리
  if (action === "stock_in" || action === "stock_out") {
    const { item_id, qty, txn_type, note } = body;
    if (!item_id || !qty || qty <= 0) {
      return NextResponse.json({ error: "품목과 수량을 입력해주세요." }, { status: 400 });
    }

    const inventory = await getInventory(supabase, storeId);
    const currentItem = inventory.find((i) => i.item_id === item_id);
    if (!currentItem) {
      return NextResponse.json({ error: "품목을 찾을 수 없습니다." }, { status: 404 });
    }

    const qtyChange = action === "stock_in" ? qty : -qty;
    const newQty = Math.max(0, currentItem.stock_qty + qtyChange);

    const success = await updateInventoryQty(supabase, storeId, item_id, newQty);
    if (success) {
      const resolvedTxnType =
        action === "stock_in"
          ? (txn_type || "purchase")
          : (txn_type || "adjustment");

      await logInventoryTransaction(
        supabase,
        storeId,
        item_id,
        qtyChange,
        resolvedTxnType,
        note || (action === "stock_in" ? "입고" : "출고")
      );

      await checkAndCreateStockAlert(supabase, storeId, item_id);

      return NextResponse.json({ success: true, newQty });
    }
    return NextResponse.json({ error: "업데이트 실패" }, { status: 500 });
  }

  // 기존 직접 수량 수정 (하위 호환)
  if (action === "update") {
    const { item_id, stock_qty } = body;
    if (item_id === undefined || stock_qty === undefined) {
      return NextResponse.json({ error: "Missing item_id or stock_qty" }, { status: 400 });
    }

    const inventory = await getInventory(supabase, storeId);
    const currentItem = inventory.find((i) => i.item_id === item_id);
    const oldQty = currentItem?.stock_qty ?? 0;
    const qtyChange = stock_qty - oldQty;

    const success = await updateInventoryQty(supabase, storeId, item_id, stock_qty);
    if (success) {
      const txnType = qtyChange >= 0 ? "purchase" : "adjustment";
      await logInventoryTransaction(
        supabase,
        storeId,
        item_id,
        qtyChange,
        txnType,
        qtyChange >= 0 ? "재고 입고/수정" : "재고 차감/수정"
      );
      await checkAndCreateStockAlert(supabase, storeId, item_id);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (action === "add") {
    const { item_name, stock_qty, unit, safety_stock } = body;
    if (!item_name || stock_qty === undefined || !unit) {
      return NextResponse.json({ error: "Missing item_name, stock_qty, or unit" }, { status: 400 });
    }
    const newId = await addInventoryItem(supabase, storeId, item_name, stock_qty, unit, safety_stock);
    if (newId) {
      await logInventoryTransaction(
        supabase,
        storeId,
        newId,
        stock_qty,
        "purchase",
        "신규 품목 등록"
      );
      return NextResponse.json({ success: true, item_id: newId });
    }
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }

  // 안전재고 수정
  if (action === "update_safety_stock") {
    const { item_id, safety_stock } = body;
    if (item_id === undefined || safety_stock === undefined) {
      return NextResponse.json({ error: "Missing item_id or safety_stock" }, { status: 400 });
    }
    const success = await updateSafetyStock(supabase, storeId, item_id, safety_stock);
    if (success) {
      await checkAndCreateStockAlert(supabase, storeId, item_id);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // AI 안전재고 추천
  if (action === "recommend_safety_stock") {
    const inventory = await getInventory(supabase, storeId);
    const transactions = await getInventoryTransactions(supabase, storeId, undefined, 100);

    const prompt = `당신은 소상공인의 재고 관리를 돕는 AI 컨설턴트입니다.
다음은 현재 재고 목록과 최근 입출고 이력입니다.

재고 목록: ${JSON.stringify(inventory.map((i) => ({ item_id: i.item_id, name: i.item_name, qty: i.stock_qty, unit: i.unit, current_safety: i.safety_stock })))}

최근 입출고 이력: ${JSON.stringify(transactions.map((t) => ({ item: t.item_name, change: t.qty_change, type: t.txn_type, date: t.created_at })))}

각 품목의 적정 안전재고를 추천해주세요. 소비 패턴, 입고 빈도 등을 고려하세요.
결과는 반드시 다음 JSON 배열로만 응답해주세요:
[{ "item_id": 숫자, "item_name": "품목명", "recommended": 추천안전재고숫자, "reason": "간략한 이유" }]`;

    try {
      const result = await geminiService.generateText(prompt);
      // Strip markdown code fences if present
      const cleaned = (result ?? "[]").replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ recommendations: parsed });
    } catch (err) {
      console.error("AI recommend error:", err);
      return NextResponse.json({ error: "AI 추천 실패" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
