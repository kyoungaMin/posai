"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // 1. Supabase Auth 회원가입
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: storeName || email },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. 매장 생성 + 프로필에 store_id 연결
    if (data.user && storeName) {
      const { data: store } = await supabase
        .from("stores")
        .insert({ name: storeName })
        .select("store_id")
        .single();

      if (store) {
        await supabase
          .from("profiles")
          .update({ store_id: store.store_id })
          .eq("user_id", data.user.id);
      }
    }

    router.push("/dashboard");
    router.refresh();
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
          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-medium p-4 rounded-2xl border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-black text-orange-400 uppercase mb-2">매장 이름</label>
            <input
              type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
              placeholder="예: 대박카페" required
              className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-orange-400 uppercase mb-2">이메일</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com" required
              className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-orange-400 uppercase mb-2">비밀번호</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력하세요" required
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
