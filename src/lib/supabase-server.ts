import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// 서버 사이드에서 사용할 Supabase 클라이언트 생성 함수
export async function createServerSupabaseClient(cookieStore?: ReturnType<typeof cookies>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.');
  }

  // Service Role Key가 있으면 관리자 권한으로 생성 (API 라우트에서 주로 사용)
  if (supabaseServiceKey) {
    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        // Supabase auth 완전 비활성화
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // Service Role Key가 없으면 Anon 키로 생성 (JWT 토큰은 별도 관리)
  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Supabase auth 완전 비활성화
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// API 라우트에서 사용할 관리자 권한 클라이언트
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase Service Role 환경 변수가 설정되지 않았습니다. SUPABASE_SERVICE_ROLE_KEY를 확인하세요.');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      // Supabase auth 완전 비활성화 - 프로젝트 JWT만 사용
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Server Components에서 사용할 클라이언트 (필요시 직접 createServerSupabaseClient() 호출)