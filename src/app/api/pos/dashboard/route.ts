import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStoreId, getDashboardData } from "@/lib/supabase/queries";

export async function GET() {
  const supabase = await createClient();
  const storeId = await getStoreId(supabase);

  if (!storeId) {
    return NextResponse.json({ error: "매장 정보가 없습니다." }, { status: 401 });
  }

  const data = await getDashboardData(supabase, storeId);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
