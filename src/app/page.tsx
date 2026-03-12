import Link from "next/link";
import { TrendingUp, BarChart3, Package, MessageSquare } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Hero */}
      <header className="flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
            <TrendingUp className="text-white" size={20} />
          </div>
          <h1 className="font-black text-xl tracking-tighter text-orange-600">POS 인사이트 AI</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-orange-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-orange-200 hover:opacity-90 transition-all"
          >
            무료 시작하기
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-800 mb-6 leading-tight">
            POS 데이터가
            <br />
            <span className="text-orange-500">경영 인사이트</span>로
          </h2>
          <p className="text-lg md:text-xl text-slate-400 font-medium mb-12 max-w-xl mx-auto leading-relaxed">
            AI가 매출을 분석하고, 재고를 관리하고, 마케팅까지 도와드려요.
            사장님은 장사에만 집중하세요.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 bg-orange-500 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-orange-200 hover:-translate-y-1 hover:shadow-3xl transition-all"
          >
            <TrendingUp size={24} />
            대시보드 시작하기
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20">
          {[
            { icon: BarChart3, title: "매출 분석", desc: "시간대별, 요일별, 날씨별 매출 패턴을 한눈에" },
            { icon: Package, title: "재고 관리", desc: "AI가 수요를 예측하고 발주 타이밍을 알려줘요" },
            { icon: MessageSquare, title: "AI 비서", desc: "매장 데이터 기반 1:1 경영 컨설팅" },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-4xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="p-3 bg-orange-50 rounded-2xl w-fit mb-4">
                <feature.icon size={24} className="text-orange-500" />
              </div>
              <h3 className="font-black text-lg text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-8 text-xs text-slate-300 font-bold">
        &copy; 2026 POS 인사이트 AI. All rights reserved.
      </footer>
    </div>
  );
}
