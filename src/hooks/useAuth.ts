"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthUser {
  id: string;
  email: string;
  storeName: string;
  storeId: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await setAuthUser(authUser);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await setAuthUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const setAuthUser = async (authUser: User) => {
    // profiles 테이블에서 매장 정보 조회
    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id, display_name, stores(name)")
      .eq("user_id", authUser.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storeData = (profile?.stores as any) as { name: string } | null;

    setUser({
      id: authUser.id,
      email: authUser.email || "",
      storeName: storeData?.name || profile?.display_name || "내 매장",
      storeId: profile?.store_id || null,
    });
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, storeName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: storeName || email },
      },
    });
    if (error) throw error;

    // 매장 생성 + 프로필 연결
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
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signIn, signUp, signOut };
}
