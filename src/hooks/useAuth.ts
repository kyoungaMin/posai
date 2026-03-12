"use client";

import { useState, useEffect } from "react";

interface AuthUser {
  id: string;
  email: string;
  storeName: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Phase 1 MVP: 데모 사용자로 자동 로그인
    setUser({
      id: "demo_user_001",
      email: "demo@posinsight.ai",
      storeName: "대박카페",
    });
    setLoading(false);
    // TODO Phase 2: Supabase Auth 연동
  }, []);

  const signIn = async (_email: string, _password: string) => {
    // TODO: Supabase 로그인 구현
  };

  const signUp = async (_email: string, _password: string) => {
    // TODO: Supabase 회원가입 구현
  };

  const signOut = async () => {
    setUser(null);
  };

  return { user, loading, signIn, signUp, signOut };
}
