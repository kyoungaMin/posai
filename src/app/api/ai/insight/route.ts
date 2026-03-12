import { NextResponse } from "next/server";
import { geminiService } from "@/lib/gemini/client";
import { createClient } from "@/lib/supabase/server";
import { getStoreId, getAnalyticsData } from "@/lib/supabase/queries";

export async function POST() {
  try {
    const supabase = await createClient();
    const storeId = await getStoreId(supabase);

    if (!storeId) {
      return NextResponse.json({ error: "매장 정보가 없습니다." }, { status: 401 });
    }

    // 실제 분석 데이터 가져오기 (최근 30일)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0];

    const analyticsData = await getAnalyticsData(supabase, storeId, startDate);

    // 피크 시간대 계산
    const peakHour = analyticsData.hourlySales.length > 0
      ? analyticsData.hourlySales.reduce((a, b) => a.hourly_total > b.hourly_total ? a : b).sales_time
      : "N/A";

    // 최고 요일 계산
    const bestDay = analyticsData.dayOfWeekSales.length > 0
      ? analyticsData.dayOfWeekSales.reduce((a, b) => a.total_amount > b.total_amount ? a : b).day_of_week
      : "N/A";

    // 인기 상품
    const topProducts = analyticsData.productRanking.slice(0, 3).map((p) => p.menu_name).join(", ");

    const prompt = `
      다음 POS 매출 데이터를 분석하여 사장님께 도움이 되는 3-4가지 핵심 경영 인사이트를 한국어로 알려주세요.
      분석 포인트:
      1. 매출 요약 및 전반적인 성과
      2. 시간대별 매출 패턴 및 피크 타임
      3. 인기 상품 분석
      4. 요일별 매출 트렌드
      5. 객단가(ATV) 분석

      데이터:
      - 총 매출: ₩${analyticsData.summary.total_sales.toLocaleString()}
      - 총 거래: ${analyticsData.summary.total_transactions}건
      - 객단가: ₩${Math.round(analyticsData.summary.avg_transaction_value).toLocaleString()}
      - 인기 상품: ${topProducts}
      - 피크 시간대: ${peakHour}
      - 최고 매출 요일: ${bestDay}요일
      - 카테고리별: ${analyticsData.categorySales.map((c) => `${c.category}(₩${c.total_amount.toLocaleString()})`).join(", ")}

      간결하고 실행 가능한 조언 중심으로 bullet point 형식으로 작성해주세요.
      친근한 말투(~해요, ~입니다)를 사용하세요.
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
