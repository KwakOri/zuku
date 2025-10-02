'use client';

import { useState, useRef, DragEvent, useEffect } from 'react';
import { Upload, X, AlertCircle, CheckCircle, FileSpreadsheet, History } from 'lucide-react';
import { useParseStudentFile, useApplyStudentRenewal } from '@/queries/useStudentRenewal';
import { useBackupHistory } from '@/queries/useBackupHistory';
import { RenewalPreview } from '@/types/student-renewal';
import StudentRenewalPreview from './StudentRenewalPreview';
import BackupHistoryModal from './BackupHistoryModal';

interface StudentRenewalDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentRenewalDialog({ isOpen, onClose }: StudentRenewalDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<RenewalPreview | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [showBackupHistory, setShowBackupHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseMutation = useParseStudentFile();
  const applyMutation = useApplyStudentRenewal();
  const { data: backups = [], isLoading: isLoadingBackups } = useBackupHistory();

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
        setSelectedFile(file);
      } else {
        alert('Excel 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.');
      }
    }
  };

  const handleParse = async () => {
    if (!selectedFile) return;

    try {
      const result = await parseMutation.mutateAsync(selectedFile);
      if (result.success && result.preview) {
        setPreview(result.preview);
        setStep('preview');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '파일 처리 중 오류가 발생했습니다.');
    }
  };

  const handleApply = async () => {
    if (!preview) return;

    if (!confirm('정말로 학생 정보를 갱신하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const result = await applyMutation.mutateAsync(preview);
      if (result.success) {
        setStep('complete');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '변경사항 적용 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setStep('upload');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-neu-200 flex items-center justify-between bg-neu-50">
            <h2 className="text-xl font-semibold text-neu-900">학생 정보 갱신</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBackupHistory(true)}
                className="flex items-center gap-2 px-4 py-2 text-neu-700 bg-white border border-neu-300 rounded-xl hover:bg-neu-50 transition-all duration-200 font-medium"
              >
                <History className="w-4 h-4" />
                <span>백업 기록</span>
              </button>
              <button
                onClick={handleClose}
                className="text-neu-500 hover:text-neu-700 transition-colors p-1 rounded-lg hover:bg-neu-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: 파일 업로드 */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200
                  ${isDragging
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neu-300 bg-neu-50 hover:border-primary-400 hover:bg-primary-50/50'
                  }
                `}
              >
                <div className="pointer-events-none">
                  {selectedFile ? (
                    <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-primary-600" />
                  ) : (
                    <Upload className="w-16 h-16 mx-auto mb-4 text-neu-400" />
                  )}
                  <p className="text-lg font-medium text-neu-800 mb-2">
                    {isDragging
                      ? '여기에 파일을 놓으세요'
                      : selectedFile
                        ? '다른 파일을 선택하시려면 클릭하거나 드래그하세요'
                        : '파일을 드래그하거나 클릭하여 선택하세요'
                    }
                  </p>
                  <p className="text-sm text-neu-600 mb-6">
                    Excel (.xlsx, .xls) 또는 CSV 파일
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {selectedFile && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-800 rounded-lg">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                )}
              </div>

              <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-warning-800">
                    <p className="font-semibold mb-2">필수 컬럼 안내</p>
                    <p>
                      업로드하는 파일에는 다음 컬럼이 반드시 포함되어야 합니다:
                      <br />
                      <span className="font-medium">반명, 학생명, 학교명, 학년, 학생핸드폰, 생년월일, 성별</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 변경사항 미리보기 */}
          {step === 'preview' && preview && (
            <StudentRenewalPreview preview={preview} />
          )}

          {/* Step 3: 완료 */}
          {step === 'complete' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-success-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-success-600" />
              </div>
              <h3 className="text-2xl font-bold text-neu-900 mb-3">
                학생 정보가 성공적으로 갱신되었습니다
              </h3>
              <p className="text-neu-600 leading-relaxed">
                백업 데이터가 backup_students 테이블에 저장되었으며,
                <br />
                모든 변경사항이 적용되었습니다.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neu-200 flex justify-end gap-3 bg-neu-50">
          {step === 'upload' && (
            <>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 text-neu-700 bg-white border border-neu-300 rounded-xl hover:bg-neu-50 transition-all duration-200 font-medium"
              >
                취소
              </button>
              <button
                onClick={handleParse}
                disabled={!selectedFile || parseMutation.isPending}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 disabled:bg-neu-300 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
              >
                {parseMutation.isPending ? '분석 중...' : '다음'}
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                onClick={() => {
                  setStep('upload');
                  setPreview(null);
                }}
                className="px-5 py-2.5 text-neu-700 bg-white border border-neu-300 rounded-xl hover:bg-neu-50 transition-all duration-200 font-medium"
              >
                이전
              </button>
              <button
                onClick={handleApply}
                disabled={applyMutation.isPending}
                className="px-5 py-2.5 bg-success-600 text-white rounded-xl hover:bg-success-700 transition-all duration-200 disabled:bg-neu-300 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
              >
                {applyMutation.isPending ? '적용 중...' : '변경사항 적용'}
              </button>
            </>
          )}

          {step === 'complete' && (
            <button
              onClick={handleClose}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>

      <BackupHistoryModal
        isOpen={showBackupHistory}
        onClose={() => setShowBackupHistory(false)}
        backups={backups}
        isLoading={isLoadingBackups}
      />
    </>
  );
}
