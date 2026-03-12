import { NextRequest, NextResponse } from "next/server";
import { geminiService } from "@/lib/gemini/client";

export async function POST(request: NextRequest) {
  try {
    const { historicalData, type } = await request.json();

    if (type === "weekly") {
      const result = await geminiService.predictWeeklyForecast(historicalData);
      return NextResponse.json({ forecast: result });
    }

    // 기본: 내일 매출 예측
    const result = await geminiService.predictSales(historicalData);
    return NextResponse.json({ content: result });
  } catch (error) {
    console.error("AI Predict Error:", error);
    return NextResponse.json(
      { error: "매출 예측에 실패했습니다." },
      { status: 500 }
    );
  }
}
