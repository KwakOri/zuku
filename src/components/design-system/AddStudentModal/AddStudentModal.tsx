"use client";

import { useState } from "react";
import { useCreateStudent } from "@/queries/useStudents";
import { TablesInsert } from "@/types/supabase";
import { X, User, Phone, Mail, GraduationCap, UserPlus } from "lucide-react";
import {
  Modal,
  FormField,
  Button,
  Avatar,
  Icon
} from "@/components/design-system";

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="새 학생 추가"
      size="md"
      footerContent={
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            size="md"
            onClick={handleClose}
            disabled={createStudentMutation.isPending}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={createStudentMutation.isPending}
            className="flex-1"
            loading={createStudentMutation.isPending}
          >
            {createStudentMutation.isPending ? (
              "추가 중..."
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                학생 추가
              </>
            )}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 학생 이름 */}
        <FormField
          label="학생 이름"
          placeholder="학생 이름을 입력하세요"
          value={formData.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          startIcon={<User className="w-4 h-4" />}
          required
          errorMessage={errors.name}
          disabled={createStudentMutation.isPending}
        />

        {/* 학년 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            학년 <span className="text-red-500">*</span>
          </label>
          <select
            value={String(formData.grade)}
            onChange={(e) => handleFieldChange("grade", parseInt(e.target.value))}
            disabled={createStudentMutation.isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <optgroup label="중학교">
              <option value="7">중1</option>
              <option value="8">중2</option>
              <option value="9">중3</option>
            </optgroup>
            <optgroup label="고등학교">
              <option value="10">고1</option>
              <option value="11">고2</option>
              <option value="12">고3</option>
            </optgroup>
            <optgroup label="기타">
              <option value="1">초1</option>
              <option value="2">초2</option>
              <option value="3">초3</option>
              <option value="4">초4</option>
              <option value="5">초5</option>
              <option value="6">초6</option>
            </optgroup>
          </select>
          {errors.grade && (
            <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
          )}
        </div>

        {/* 학생 연락처 */}
        <FormField
          label="학생 연락처"
          type="tel"
          placeholder="010-1234-5678"
          value={formData.phone || ""}
          onChange={(e) => handleFieldChange("phone", e.target.value)}
          startIcon={<Phone className="w-4 h-4" />}
          errorMessage={errors.phone}
          disabled={createStudentMutation.isPending}
        />

        {/* 학부모 연락처 */}
        <FormField
          label="학부모 연락처"
          type="tel"
          placeholder="010-1234-5678"
          value={formData.parent_phone || ""}
          onChange={(e) => handleFieldChange("parent_phone", e.target.value)}
          startIcon={<Phone className="w-4 h-4" />}
          errorMessage={errors.parent_phone}
          disabled={createStudentMutation.isPending}
        />

        {/* 이메일 */}
        <FormField
          label="이메일"
          type="email"
          placeholder="student@example.com"
          value={formData.email || ""}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          startIcon={<Mail className="w-4 h-4" />}
          errorMessage={errors.email}
          disabled={createStudentMutation.isPending}
        />
      </form>
    </Modal>
  );
}