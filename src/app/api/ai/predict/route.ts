import { NextRequest, NextResponse } from "next/server";
import { geminiService } from "@/lib/gemini/client";
import { createClient } from "@/lib/supabase/server";
import {
  getStoreId,
  getStoreContext,
  saveAIForecast,
  saveWeatherForecasts,
  getCachedWeatherForecasts,
  isWeatherCacheValid,
} from "@/lib/supabase/queries";
import { getWeatherForecast } from "@/lib/weather/client";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const storeId = await getStoreId(supabase);

    if (!storeId) {
      return NextResponse.json({ error: "매장 정보가 없습니다." }, { status: 401 });
    }

    const { type } = await request.json();

    // 실제 매장 데이터 가져오기
    const context = await getStoreContext(supabase, storeId);

    if (type === "weekly") {
      // 날씨 데이터: 캐시 확인 → 없으면 API 호출 후 DB 저장
      const cacheValid = await isWeatherCacheValid(supabase, storeId);
      if (!cacheValid) {
        try {
          const weatherData = await getWeatherForecast();
          if (weatherData.length > 0) {
            await saveWeatherForecasts(
              supabase,
              storeId,
              weatherData.map((w) => ({
                forecast_date: w.date,
                weather: w.weatherKr,
                temp: w.temp,
                temp_min: w.tempMin,
                temp_max: w.tempMax,
                humidity: w.humidity,
                wind_speed: w.windSpeed,
                pop: w.pop,
              }))
            );
          }
        } catch (err) {
          console.error("Weather save failed:", err);
        }
      }

      const result = await geminiService.predictWeeklyForecast(context.recentSales);

      // 주간 예측 결과를 ai_forecasts에 저장
      if (Array.isArray(result)) {
        for (const day of result) {
          await saveAIForecast(
            supabase,
            storeId,
            "daily_sales",
            day.date,
            day.predictedSales,
            { weather: day.weather, temp: day.temp, reason: day.reason }
          );
        }
      }

      // DB에서 캐시된 날씨 데이터도 함께 반환
      const weatherCache = await getCachedWeatherForecasts(supabase, storeId);

      return NextResponse.json({ forecast: result, weather: weatherCache });
    }

    // 기본: 내일 매출 예측
    const result = await geminiService.predictSales(context.recentSales);

    // 내일 날짜 계산 후 예측 저장
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = tomorrow.toISOString().split("T")[0];

    // 예측 텍스트에서 금액 추출 시도
    const amountMatch = result?.match(/[\d,]+원/);
    const predictedValue = amountMatch
      ? parseInt(amountMatch[0].replace(/[,원]/g, ""), 10)
      : 0;

    if (predictedValue > 0) {
      await saveAIForecast(supabase, storeId, "daily_sales", targetDate, predictedValue, {
        raw_prediction: result,
      });
    }

    return NextResponse.json({ content: result });
  } catch (error) {
    console.error("AI Predict Error:", error);
    return NextResponse.json(
      { error: "매출 예측에 실패했습니다." },
      { status: 500 }
    );
  }
}
