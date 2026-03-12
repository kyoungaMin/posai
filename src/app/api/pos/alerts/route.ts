import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStoreId, getAlerts, markAlertRead } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const storeId = await getStoreId(supabase);

  if (!storeId) {
    return NextResponse.json({ error: "매장 정보가 없습니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const data = await getAlerts(supabase, storeId, unreadOnly);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const storeId = await getStoreId(supabase);

  if (!storeId) {
    return NextResponse.json({ error: "매장 정보가 없습니다." }, { status: 401 });
  }

  const { action, alert_id } = await request.json();

  if (action === "markRead" && alert_id) {
    await markAlertRead(supabase, storeId, alert_id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
