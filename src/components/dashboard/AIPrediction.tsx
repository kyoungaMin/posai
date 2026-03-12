"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Loader2, Volume2, VolumeX } from "lucide-react";
import type { RecentSale } from "@/types/pos";

interface AIPredictionProps {
  recentSales: RecentSale[];
}

export default function AIPrediction({ recentSales }: AIPredictionProps) {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleSpeak = useCallback(() => {
    if (!prediction) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(prediction);
    utterance.lang = "ko-KR";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [prediction, speaking]);

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const res = await fetch("/api/ai/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historicalData: recentSales }),
      });
      const data = await res.json();
      setPrediction(data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 md:p-8 rounded-4xl shadow-2xl shadow-orange-200 relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 group-hover:scale-110 transition-transform">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="font-black text-lg md:text-xl">AI 매출 돋보기</h3>
              <p className="text-[8px] md:text-[10px] text-orange-100 font-bold uppercase tracking-widest">
                Sales Deep-Dive
              </p>
            </div>
          </div>
        </div>

        {!prediction ? (
          <div className="space-y-4 md:space-y-6">
            <div className="p-4 md:p-5 bg-white/10 rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-orange-50 text-xs md:text-sm font-medium leading-relaxed">
                &ldquo;사장님, 내일은 어떤 메뉴가 효자 노릇을 할까요? AI가 과거 데이터를 돋보기처럼 꼼꼼히 분석해 드릴게요!&rdquo;
              </p>
            </div>
            <button
              onClick={handlePredict}
              disabled={predicting}
              className="w-full bg-white text-orange-600 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-sm md:text-base hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 shadow-lg shadow-orange-900/20"
            >
              {predicting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>분석 중...</span>
                </>
              ) : (
                <>
                  <TrendingUp size={18} />
                  <span>내일 매출 예측하기</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 md:space-y-6"
          >
            <div className="bg-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl backdrop-blur-md border border-white/20 shadow-inner max-h-[200px] md:max-h-[300px] overflow-y-auto custom-scrollbar">
              <p className="text-white whitespace-pre-wrap text-xs md:text-sm font-bold leading-relaxed">
                {prediction}
              </p>
            </div>
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => { window.speechSynthesis.cancel(); setSpeaking(false); setPrediction(null); }}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl text-[10px] md:text-xs font-bold transition-all backdrop-blur-sm"
              >
                다시 분석
              </button>
              <button
                onClick={handleSpeak}
                className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-[10px] md:text-xs font-bold transition-all backdrop-blur-sm ${
                  speaking
                    ? "bg-white text-orange-600"
                    : "bg-white/20 hover:bg-white/30 text-white"
                }`}
              >
                {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                {speaking ? "멈추기" : "듣기"}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Decorative */}
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute top-10 -left-10 w-32 h-32 bg-orange-400/30 rounded-full blur-2xl" />
    </div>
  );
}
