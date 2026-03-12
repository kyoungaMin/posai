import { NextRequest, NextResponse } from "next/server";
import { geminiService } from "@/lib/gemini/client";

export async function POST(request: NextRequest) {
  try {
    const { analyticsData } = await request.json();

    const prompt = `
      Analyze the following sales data for a cafe and provide 3-4 key business insights in Korean.
      Focus on:
      1. Sales summary and overall performance
      2. Hourly sales patterns and peak times
      3. Top performing products
      4. Daily sales trends (day of week)
      5. Average transaction value (ATV)

      Data:
      - Total Sales: ${analyticsData.total_sales}
      - Total Transactions: ${analyticsData.total_transactions}
      - ATV: ${analyticsData.avg_transaction_value}
      - Top Products: ${analyticsData.topProducts}
      - Hourly Peak: ${analyticsData.peakHour}
      - Best Day: ${analyticsData.bestDay}

      Format the output as a concise list of bullet points.
    `;

    const result = await geminiService.generateText(prompt);
    return NextResponse.json({ content: result });
  } catch (error) {
    console.error("AI Insight Error:", error);
    return NextResponse.json(
      { error: "AI 인사이트 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
