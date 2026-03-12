/** 날짜를 한국어 형식으로 포맷 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("ko-KR");
}

/** 숫자를 원화 형식으로 포맷 */
export function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString()}`;
}

/** 숫자를 만 단위로 축약 */
export function formatCompact(amount: number): string {
  return `₩${(amount / 10000).toFixed(1)}만`;
}

/** 날씨 이모지 반환 */
export function getWeatherEmoji(weather: string): string {
  const map: Record<string, string> = {
    맑음: "☀️",
    흐림: "☁️",
    비: "🌧️",
    눈: "❄️",
  };
  return map[weather] || "🌤️";
}

/** 계절 이모지 반환 */
export function getSeasonEmoji(season: string): string {
  const map: Record<string, string> = {
    봄: "🌸",
    여름: "🌻",
    가을: "🍂",
    겨울: "❄️",
  };
  return map[season] || "🌿";
}
