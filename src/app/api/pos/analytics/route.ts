import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStoreId, getAnalyticsData } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const storeId = await getStoreId(supabase);

  if (!storeId) {
    return NextResponse.json({ error: "매장 정보가 없습니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  const data = await getAnalyticsData(supabase, storeId, startDate, endDate);
  return NextResponse.json(data);
}
