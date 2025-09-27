"use client";

import { useState } from "react";
import { useCreateStudent } from "@/queries/useStudents";
import { TablesInsert } from "@/types/supabase";
import { X, User, Phone, Mail, GraduationCap, UserPlus } from "lucide-react";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
  const [formData, setFormData] = useState<TablesInsert<"students">>({
    name: "",
    grade: 7,
    phone: "",
    parent_phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createStudentMutation = useCreateStudent();

  // 폼 필드 변경 핸들러
  const handleFieldChange = (field: keyof TablesInsert<"students">, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 필수 필드 검증
    if (!formData.name.trim()) {
      newErrors.name = "학생 이름을 입력해주세요.";
    }

    if (!formData.grade || formData.grade < 1 || formData.grade > 12) {
      newErrors.grade = "올바른 학년을 선택해주세요. (1~12학년)";
    }

    // 선택적 필드 형식 검증
    if (formData.phone && !/^[\d-]+$/.test(formData.phone)) {
      newErrors.phone = "올바른 전화번호 형식을 입력해주세요.";
    }

    if (formData.parent_phone && !/^[\d-]+$/.test(formData.parent_phone)) {
      newErrors.parent_phone = "올바른 전화번호 형식을 입력해주세요.";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // 빈 문자열을 null로 변환
      const submitData = {
        ...formData,
        phone: formData.phone?.trim() || null,
        parent_phone: formData.parent_phone?.trim() || null,
        email: formData.email?.trim() || null,
      };

      await createStudentMutation.mutateAsync(submitData);

      // 성공 시 폼 초기화 및 모달 닫기
      setFormData({
        name: "",
        grade: 7,
        phone: "",
        parent_phone: "",
        email: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("학생 추가 오류:", error);
    }
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    if (!createStudentMutation.isPending) {
      setFormData({
        name: "",
        grade: 7,
        phone: "",
        parent_phone: "",
        email: "",
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">새 학생 추가</h2>
              <p className="text-sm text-gray-500">학생 정보를 입력해주세요</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={createStudentMutation.isPending}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 학생 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              학생 이름 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="학생 이름을 입력하세요"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
              disabled={createStudentMutation.isPending}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* 학년 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <GraduationCap className="w-4 h-4 inline mr-2" />
              학년 *
            </label>
            <select
              value={formData.grade}
              onChange={(e) => handleFieldChange("grade", parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.grade ? "border-red-300" : "border-gray-300"
              }`}
              disabled={createStudentMutation.isPending}
            >
              {/* 중학교 */}
              <optgroup label="중학교">
                <option value={7}>중1</option>
                <option value={8}>중2</option>
                <option value={9}>중3</option>
              </optgroup>
              {/* 고등학교 */}
              <optgroup label="고등학교">
                <option value={10}>고1</option>
                <option value={11}>고2</option>
                <option value={12}>고3</option>
              </optgroup>
              {/* 기타 */}
              <optgroup label="기타">
                <option value={1}>초1</option>
                <option value={2}>초2</option>
                <option value={3}>초3</option>
                <option value={4}>초4</option>
                <option value={5}>초5</option>
                <option value={6}>초6</option>
              </optgroup>
            </select>
            {errors.grade && (
              <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
            )}
          </div>

          {/* 학생 연락처 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              학생 연락처
            </label>
            <input
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              placeholder="010-1234-5678"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? "border-red-300" : "border-gray-300"
              }`}
              disabled={createStudentMutation.isPending}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* 학부모 연락처 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              학부모 연락처
            </label>
            <input
              type="tel"
              value={formData.parent_phone || ""}
              onChange={(e) => handleFieldChange("parent_phone", e.target.value)}
              placeholder="010-1234-5678"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.parent_phone ? "border-red-300" : "border-gray-300"
              }`}
              disabled={createStudentMutation.isPending}
            />
            {errors.parent_phone && (
              <p className="mt-1 text-sm text-red-600">{errors.parent_phone}</p>
            )}
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              이메일
            </label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              placeholder="student@example.com"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? "border-red-300" : "border-gray-300"
              }`}
              disabled={createStudentMutation.isPending}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={createStudentMutation.isPending}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={createStudentMutation.isPending}
              className="flex-1 px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createStudentMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  추가 중...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  학생 추가
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}