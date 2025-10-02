'use client';

import { useEffect } from 'react';
import { X, History, Calendar, Users, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Tables } from '@/types/supabase';

interface BackupRecord {
  id: string;
  backup_date: string;
  student_count: number;
  created_by: string | null;
  notes: string | null;
  backup_data: {
    students: Tables<'students'>[];
    timestamp: string;
  };
}

interface BackupHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  backups: BackupRecord[];
  isLoading: boolean;
}

export default function BackupHistoryModal({
  isOpen,
  onClose,
  backups,
  isLoading
}: BackupHistoryModalProps) {
  // 모달이 열려있을 때 body 스크롤 비활성화
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neu-200 flex items-center justify-between bg-neu-50">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-neu-900">백업 기록</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neu-500 hover:text-neu-700 transition-colors p-1 rounded-lg hover:bg-neu-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-neu-500">로딩 중...</div>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 mx-auto mb-4 text-neu-300" />
              <p className="text-neu-600">백업 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="border border-neu-200 rounded-xl p-4 hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neu-900">
                          {backup.notes || '학생 정보 백업'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-neu-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(backup.backup_date), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-neu-200">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-neu-500" />
                      <span className="text-sm text-neu-700">
                        총 <span className="font-semibold text-primary-600">{backup.student_count}</span>명
                      </span>
                    </div>
                    {backup.created_by && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-neu-500" />
                        <span className="text-sm text-neu-700">
                          작업자: {backup.created_by}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-neu-500">
                    백업 ID: {backup.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neu-200 flex justify-end bg-neu-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
