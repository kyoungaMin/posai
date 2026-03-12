import { NextRequest, NextResponse } from "next/server";
import { getInventory, updateInventory, addInventoryItem } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getInventory());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  if (action === "update") {
    const { item_id, stock_qty } = body;
    if (item_id === undefined || stock_qty === undefined) {
      return NextResponse.json({ error: "Missing item_id or stock_qty" }, { status: 400 });
    }
    const success = updateInventory(item_id, stock_qty);
    if (success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (action === "add") {
    const { item_name, stock_qty, unit } = body;
    if (!item_name || stock_qty === undefined || !unit) {
      return NextResponse.json({ error: "Missing item_name, stock_qty, or unit" }, { status: 400 });
    }
    const newId = addInventoryItem(item_name, stock_qty, unit);
    return NextResponse.json({ success: true, item_id: newId });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
