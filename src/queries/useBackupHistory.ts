import { useQuery } from '@tanstack/react-query';

interface BackupRecord {
  id: string;
  backup_date: string;
  student_count: number;
  created_by: string | null;
  notes: string | null;
  backup_data: {
    students: Record<string, unknown>[];
    timestamp: string;
  };
}

interface BackupHistoryResponse {
  success: boolean;
  backups: BackupRecord[];
  error?: string;
}

/**
 * 백업 기록 조회
 */
async function fetchBackupHistory(): Promise<BackupRecord[]> {
  const response = await fetch('/api/students/renewal/backups');
  const data: BackupHistoryResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || '백업 기록 조회에 실패했습니다.');
  }

  return data.backups;
}

/**
 * 백업 기록 조회 Hook
 */
export function useBackupHistory() {
  return useQuery({
    queryKey: ['backup-history'],
    queryFn: fetchBackupHistory,
    staleTime: 1000 * 60 * 5, // 5분
  });
}
