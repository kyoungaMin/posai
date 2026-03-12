const API_KEY = process.env.OPENWEATHERMAP_API_KEY || "";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

interface ForecastItem {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
  weather: { id: number; main: string; description: string }[];
  wind: { speed: number };
  pop: number; // 강수 확률
}

interface ForecastResponse {
  list: ForecastItem[];
  city: { name: string };
}

export interface DailyWeather {
  date: string;
  weather: string;
  weatherKr: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  pop: number; // 강수 확률 (0~1)
}

// 영어 날씨 → 한국어 변환
function weatherToKorean(main: string): string {
  const map: Record<string, string> = {
    Clear: "맑음",
    Clouds: "흐림",
    Rain: "비",
    Drizzle: "이슬비",
    Thunderstorm: "뇌우",
    Snow: "눈",
    Mist: "안개",
    Fog: "안개",
    Haze: "연무",
  };
  return map[main] || main;
}

// 3시간 간격 데이터 → 일별로 집계
function aggregateDaily(items: ForecastItem[]): DailyWeather[] {
  const dailyMap = new Map<string, ForecastItem[]>();

  for (const item of items) {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];
    const existing = dailyMap.get(date) || [];
    existing.push(item);
    dailyMap.set(date, existing);
  }

  const result: DailyWeather[] = [];

  for (const [date, dayItems] of dailyMap) {
    const temps = dayItems.map((i) => i.main.temp);
    const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
    const tempMin = Math.round(Math.min(...dayItems.map((i) => i.main.temp_min)));
    const tempMax = Math.round(Math.max(...dayItems.map((i) => i.main.temp_max)));
    const avgHumidity = Math.round(dayItems.reduce((a, b) => a + b.main.humidity, 0) / dayItems.length);
    const avgWind = Math.round(dayItems.reduce((a, b) => a + b.wind.speed, 0) / dayItems.length * 10) / 10;
    const maxPop = Math.max(...dayItems.map((i) => i.pop));

    // 가장 빈번한 날씨 선택
    const weatherCounts = new Map<string, number>();
    for (const item of dayItems) {
      const w = item.weather[0].main;
      weatherCounts.set(w, (weatherCounts.get(w) || 0) + 1);
    }
    const dominantWeather = [...weatherCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];

    result.push({
      date,
      weather: dominantWeather,
      weatherKr: weatherToKorean(dominantWeather),
      temp: avgTemp,
      tempMin,
      tempMax,
      humidity: avgHumidity,
      windSpeed: avgWind,
      pop: Math.round(maxPop * 100),
    });
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 5일간 날씨 예보 조회 (3시간 간격 → 일별 집계)
 * @param lat 위도 (기본: 서울)
 * @param lon 경도 (기본: 서울)
 */
export async function getWeatherForecast(
  lat = 37.5665,
  lon = 126.9780
): Promise<DailyWeather[]> {
  if (!API_KEY) {
    console.warn("OPENWEATHERMAP_API_KEY not set");
    return [];
  }

  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;

  const res = await fetch(url, { next: { revalidate: 3600 } }); // 1시간 캐시
  if (!res.ok) {
    console.error("Weather API error:", res.status, await res.text());
    return [];
  }

  const data: ForecastResponse = await res.json();
  return aggregateDaily(data.list);
}
