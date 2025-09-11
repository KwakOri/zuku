"use client";

import { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";

// 클라이언트 사이드 전용 Supabase 클라이언트
export function createClientSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요."
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Supabase auth 기능 완전 비활성화
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      storage: undefined,
    },
    // 실시간 기능 설정
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
    // 글로벌 설정
    global: {
      headers: {
        "X-Client-Info": "zuku-academy-app",
      },
    },
  });
}

// 싱글톤 패턴으로 클라이언트 관리
let supabaseClient: ReturnType<typeof createClientSupabaseClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientSupabaseClient();
  }
  return supabaseClient;
}

// 편의를 위한 기본 export
export const supabase = getSupabaseClient();
