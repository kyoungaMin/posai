import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsData } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  const data = getAnalyticsData(startDate, endDate);
  return NextResponse.json(data);
}
