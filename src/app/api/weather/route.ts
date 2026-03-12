import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getStoreId,
  saveWeatherForecasts,
  getCachedWeatherForecasts,
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
    if (cacheValid) {
      const cached = await getCachedWeatherForecasts(supabase, storeId);
      return NextResponse.json({ data: cached, source: "cache" });
    }

    // 캐시 만료 → OpenWeatherMap API 호출 → DB 저장
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

    const saved = await getCachedWeatherForecasts(supabase, storeId);
    return NextResponse.json({ data: saved, source: "api" });
  } catch (error) {
    console.error("Weather API Error:", error);
    return NextResponse.json(
      { error: "날씨 데이터를 가져올 수 없습니다." },
      { status: 500 }
    );
  }
}
