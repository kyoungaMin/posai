"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Phase 1 MVP: 데모 회원가입 (바로 대시보드로)
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-200 mx-auto mb-6">
            <TrendingUp className="text-white" size={32} />
          </div>
          <h1 className="font-black text-3xl text-slate-800 mb-2">POS 인사이트 AI</h1>
          <p className="text-sm text-slate-400 font-medium">무료로 시작해보세요!</p>
        </div>

        <form onSubmit={handleSignup} className="bg-white p-8 rounded-4xl border border-orange-100 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-black text-orange-400 uppercase mb-2">매장 이름</label>
            <input
              type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
              placeholder="예: 대박카페"
              className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-orange-400 uppercase mb-2">이메일</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-orange-400 uppercase mb-2">비밀번호</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상 입력하세요"
              className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-orange-200 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "무료로 시작하기"}
          </button>
          <p className="text-center text-sm text-slate-400 font-medium">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-orange-500 font-bold hover:underline">로그인</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
