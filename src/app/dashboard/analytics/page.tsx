"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Clock, BarChart3, TrendingUp, Package, Users, RefreshCw, Loader2, Volume2, VolumeX } from "lucide-react";
import { usePOSData } from "@/hooks/usePOSData";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import type { AnalyticsData, WeeklyForecast } from "@/types/pos";
import { getWeatherEmoji, getSeasonEmoji } from "@/lib/utils";

const Markdown = dynamic(() => import("react-markdown"), { ssr: false });

interface WeatherRow {
  forecast_date: string;
  weather: string;
  temp: number;
}

interface ForecastRow {
  target_date: string;
  predicted_value: number;
  details: { weather?: string; temp?: number; reason?: string } | null;
}

function mergeWeatherAndForecasts(
  weather: WeatherRow[],
  forecasts: ForecastRow[]
): WeeklyForecast[] {
  const forecastMap = new Map(forecasts.map((f) => [f.target_date, f]));

  return weather.map((w) => {
    const f = forecastMap.get(w.forecast_date);
    return {
      date: w.forecast_date,
      weather: w.weather,
      temp: w.temp,
      predictedSales: f?.predicted_value ?? 0,
      reason: f?.details?.reason ?? "예측 데이터 없음",
    };
  });
}

const HourlyChart = dynamic(
  () => import("@/components/analytics/HourlyChart"),
  {
    loading: () => <div className="h-80 w-full animate-pulse bg-slate-100 rounded-2xl" />,
    ssr: false,
  }
);

const DayOfWeekChart = dynamic(
  () => import("@/components/analytics/DayOfWeekChart"),
  {
    loading: () => <div className="h-80 w-full animate-pulse bg-slate-100 rounded-2xl" />,
    ssr: false,
  }
);

export default function AnalyticsPage() {
  const { fetchAnalytics } = usePOSData();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [weeklyForecast, setWeeklyForecast] = useState<WeeklyForecast[] | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const weekAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  }, []);
  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);

  const generateAiInsight = useCallback(async (data: AnalyticsData) => {
    setGeneratingInsight(true);
    try {
      const sortedHourly = [...data.hourlySales].sort((a, b) => b.hourly_total - a.hourly_total);
      const sortedDow = [...data.dayOfWeekSales].sort((a, b) => b.total_amount - a.total_amount);

      const res = await fetch("/api/ai/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analyticsData: {
            total_sales: data.summary.total_sales,
            total_transactions: data.summary.total_transactions,
            avg_transaction_value: data.summary.avg_transaction_value,
            topProducts: data.productRanking.map((p) => `${p.menu_name}(${p.total_qty})`).join(", "),
            peakHour: sortedHourly[0]?.sales_time || "N/A",
            bestDay: sortedDow[0] ? `${sortedDow[0].day_of_week}요일` : "N/A",
          },
        }),
      });
      const json = await res.json();
      setAiInsight(json.content);
    } catch {
      setAiInsight("데이터 분석 중 오류가 발생했습니다.");
    } finally {
      setGeneratingInsight(false);
    }
  }, []);

  const handleSpeak = useCallback(() => {
    if (!aiInsight) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(aiInsight);
    utterance.lang = "ko-KR";
    utterance.rate = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [aiInsight, speaking]);

  useEffect(() => {
    let cancelled = false;
    setLoadingAnalytics(true);
    (async () => {
      const data = await fetchAnalytics(startDate, endDate);
      if (!cancelled && data) {
        setAnalytics(data);
        setLoadingAnalytics(false);
        generateAiInsight(data);
      }
    })();
    return () => { cancelled = true; };
  }, [startDate, endDate, fetchAnalytics, generateAiInsight]);

  // 페이지 로딩 시 DB에서 날씨+예측 데이터 가져오기
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/weather");
        const json = await res.json();
        if (json.weather && json.forecasts) {
          const merged = mergeWeatherAndForecasts(json.weather, json.forecasts);
          if (merged.length > 0) setWeeklyForecast(merged);
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
      }
    })();
  }, []);

  // AI 예측 새로고침 (Gemini 호출)
  const refreshWeeklyForecast = async () => {
    setLoadingForecast(true);
    try {
      const res = await fetch("/api/ai/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "weekly", historicalData: analytics?.last30Days }),
      });
      const json = await res.json();
      if (json.forecast) setWeeklyForecast(json.forecast);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingForecast(false);
    }
  };

  const setQuickDate = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(days === 0 ? today : start.toISOString().split("T")[0]);
    setEndDate(today);
  };

  const maxProductAmount = useMemo(
    () => analytics?.productRanking[0]?.total_amount || 1,
    [analytics]
  );

  return (
    <>
      <Header title="매출 심층 분석" />
      <div className="space-y-8">
        {/* Date Filter */}
        <div className="bg-white p-4 md:p-6 rounded-4xl border border-orange-100 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl text-orange-500"><Clock size={20} /></div>
            <span className="font-black text-slate-800 text-sm md:text-base">조회 기간</span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-xl px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20" />
            <span className="text-slate-300 font-bold">~</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-xl px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20" />
          </div>
          <div className="flex gap-2">
            {[{ label: "오늘", days: 0 }, { label: "7일", days: 7 }, { label: "30일", days: 30 }].map((q) => (
              <button key={q.label} onClick={() => setQuickDate(q.days)}
                className="px-3 md:px-4 py-2 bg-slate-50 text-slate-400 hover:bg-orange-50 hover:text-orange-500 rounded-xl text-[10px] md:text-xs font-black transition-all">
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {loadingAnalytics ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-500" size={40} />
          </div>
        ) : analytics && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="총 매출액" value={`₩${analytics.summary.total_sales.toLocaleString()}`} icon={BarChart3} />
              <StatCard title="총 거래 건수" value={`${analytics.summary.total_transactions.toLocaleString()}건`} icon={TrendingUp} />
              <StatCard title="총 판매 수량" value={`${analytics.summary.total_qty.toLocaleString()}개`} icon={Package} />
              <StatCard title="평균 객단가 (ATV)" value={`₩${Math.round(analytics.summary.avg_transaction_value).toLocaleString()}`} icon={Users} trend="up" change="+3.2%" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-4xl border border-orange-100 shadow-sm">
                <h3 className="font-black text-xl text-slate-800 mb-8">시간대별 매출 분포</h3>
                <HourlyChart data={analytics.hourlySales} />
              </div>
              <div className="bg-white p-8 rounded-4xl border border-orange-100 shadow-sm">
                <h3 className="font-black text-xl text-slate-800 mb-8">요일별 매출 현황</h3>
                <DayOfWeekChart data={analytics.dayOfWeekSales} />
              </div>
            </div>

            {/* Product Ranking + AI Insight */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-4xl border border-orange-100 shadow-sm">
                <h3 className="font-black text-xl text-slate-800 mb-8">상품 판매 랭킹 TOP 10</h3>
                <div className="space-y-4">
                  {analytics.productRanking.map((product, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${i < 3 ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : "bg-slate-50 text-slate-400"}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-700">{product.menu_name}</span>
                          <span className="text-sm font-black text-orange-600">₩{product.total_amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${i < 3 ? "bg-orange-400" : "bg-slate-200"}`}
                            style={{ width: `${(product.total_amount / maxProductAmount) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-400 min-w-[60px] text-right">{product.total_qty}개</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insight */}
              <div className="bg-slate-900 text-white p-8 rounded-4xl shadow-2xl relative overflow-hidden flex flex-col">
                <div className="relative z-10 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-xl">AI 인사이트</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Business Intelligence</p>
                    </div>
                  </div>
                  {generatingInsight ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-white/10 rounded-full w-3/4" />
                      <div className="h-4 bg-white/10 rounded-full w-full" />
                      <div className="h-4 bg-white/10 rounded-full w-5/6" />
                    </div>
                  ) : aiInsight ? (
                    <div className="text-sm text-slate-300 leading-relaxed prose prose-invert max-w-none">
                      <Markdown>{aiInsight}</Markdown>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">데이터를 분석하여 인사이트를 생성합니다...</p>
                  )}
                </div>
                <div className="mt-auto relative z-10 flex gap-2">
                  <button onClick={() => analytics && generateAiInsight(analytics)} disabled={generatingInsight}
                    className="flex-1 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2">
                    {generatingInsight ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                    새로고침
                  </button>
                  {aiInsight && (
                    <button onClick={handleSpeak}
                      className={`px-4 py-4 border border-white/10 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
                        speaking ? "bg-white text-slate-900" : "bg-white/10 hover:bg-white/20"
                      }`}>
                      {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      {speaking ? "멈추기" : "듣기"}
                    </button>
                  )}
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/10 blur-3xl rounded-full" />
              </div>
            </div>

            {/* Weather & Season Impact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-4xl border border-orange-100 shadow-sm">
                <h3 className="font-black text-xl text-slate-800 mb-8">날씨별 평균 매출</h3>
                <div className="grid grid-cols-2 gap-4">
                  {analytics.weatherImpact.map((w, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-orange-50/30 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl shrink-0">
                        {getWeatherEmoji(w.weather)}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">평균 매출</p>
                        <p className="font-black text-slate-800 text-sm">₩{Math.round(w.avg_sales).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-4xl border border-orange-100 shadow-sm">
                <h3 className="font-black text-xl text-slate-800 mb-8">계절별 매출 요인</h3>
                <div className="grid grid-cols-2 gap-4">
                  {analytics.seasonalImpact.map((s, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-orange-50/30 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl shrink-0">
                        {getSeasonEmoji(s.season)}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">평균 매출</p>
                        <p className="font-black text-slate-800 text-sm">₩{Math.round(s.avg_sales).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Weekly Forecast */}
        <div className="bg-white p-8 rounded-4xl border border-orange-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xl text-slate-800">AI 주간 매출 & 날씨 예보</h3>
            <button
              onClick={refreshWeeklyForecast}
              disabled={loadingForecast}
              className="flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-500 rounded-xl text-xs font-black transition-all disabled:opacity-50"
            >
              {loadingForecast ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
              AI 예측 새로고침
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {weeklyForecast?.map((day, i) => (
              <div key={i} className="flex flex-col items-center p-4 bg-orange-50/50 rounded-2xl border border-orange-100 hover:border-orange-300 transition-all group relative">
                <span className="text-[10px] font-black text-slate-400 mb-2">{day.date.split("-").slice(1).join("/")}</span>
                <div className="text-2xl mb-2">{getWeatherEmoji(day.weather)}</div>
                <span className="text-xs font-black text-slate-800 mb-1">{day.temp}&deg;C</span>
                <div className="w-full h-px bg-orange-200 my-2" />
                {day.predictedSales > 0 ? (
                  <>
                    <span className="text-[10px] font-black text-orange-600 mb-1">예상 매출</span>
                    <span className="text-xs font-extrabold text-slate-800">₩{(day.predictedSales / 10000).toFixed(1)}만</span>
                  </>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">예측 대기</span>
                )}
                <div className="absolute hidden group-hover:block bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-xl z-20 bottom-full mb-2 w-32 text-center">
                  {day.reason}
                </div>
              </div>
            ))}
            {!weeklyForecast && (
              <div className="col-span-full py-10 text-center text-sm text-slate-400 font-medium">
                날씨 데이터를 불러오는 중...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
