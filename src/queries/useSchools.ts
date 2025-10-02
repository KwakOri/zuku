import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase-client";
import { Tables } from "@/types/supabase";

// Query Keys
export const schoolKeys = {
  all: ["schools"] as const,
  lists: () => [...schoolKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...schoolKeys.lists(), { filters }] as const,
  details: () => [...schoolKeys.all, "detail"] as const,
  detail: (id: string) => [...schoolKeys.details(), id] as const,
};

// API Functions
async function getSchools(): Promise<Tables<"schools">[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function getSchoolById(id: string): Promise<Tables<"schools">> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Queries
export function useSchools() {
  return useQuery({
    queryKey: schoolKeys.lists(),
    queryFn: () => getSchools(),
    staleTime: 10 * 60 * 1000, // 10분 (학교 정보는 자주 변경되지 않음)
  });
}

export function useSchool(id: string) {
  return useQuery({
    queryKey: schoolKeys.detail(id),
    queryFn: () => getSchoolById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}
