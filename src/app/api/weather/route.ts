import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getStoreId,
  saveWeatherForecasts,
  getCachedWeatherForecasts,
  getCachedAIForecasts,
  isWeatherCacheValid,
} from "@/lib/supabase/queries";
import { getWeatherForecast } from "@/lib/weather/client";

export async function GET() {
  try {
    const supabase = await createClient();
    const storeId = await getStoreId(supabase);

    if (!storeId) {
      return NextResponse.json({ error: "매장 정보가 없습니다." }, { status: 401 });
    }

    // 캐시 유효하면 DB에서 반환
    const cacheValid = await isWeatherCacheValid(supabase, storeId);
    if (!cacheValid) {
      // 캐시 만료 → OpenWeatherMap API 호출 → DB 저장
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
        console.error("Weather fetch failed:", err);
      }
    }

    // 날씨 + AI 예측 데이터를 함께 반환
    const [weather, forecasts] = await Promise.all([
      getCachedWeatherForecasts(supabase, storeId),
      getCachedAIForecasts(supabase, storeId),
    ]);

    return NextResponse.json({
      weather,
      forecasts,
    }, {
      headers: {
        "Cache-Control": "private, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Weather API Error:", error);
    return NextResponse.json(
      { error: "날씨 데이터를 가져올 수 없습니다." },
      { status: 500 }
    );
  }
}
