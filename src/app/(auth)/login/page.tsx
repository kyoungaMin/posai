"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : authError.message
      );
      setLoading(false);
      return;
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
          <p className="text-sm text-slate-400 font-medium">사장님, 다시 돌아오셨군요!</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 rounded-4xl border border-orange-100 shadow-sm space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-medium p-4 rounded-2xl border border-red-100">
              {error}
            </div>
          )}
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
              placeholder="비밀번호를 입력하세요" required
              className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-orange-200 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "로그인"}
          </button>
          <p className="text-center text-sm text-slate-400 font-medium">
            아직 계정이 없으신가요?{" "}
            <Link href="/signup" className="text-orange-500 font-bold hover:underline">회원가입</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
