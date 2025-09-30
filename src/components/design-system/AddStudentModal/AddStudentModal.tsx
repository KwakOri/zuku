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
      title={
        <div className="flex items-center gap-3">
          <Avatar
            size="md"
            variant="flat"
            className="bg-primary-100"
            fallback={<Icon name="user-plus" size="sm" color="primary" />}
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">새 학생 추가</h2>
            <p className="text-sm text-gray-500">학생 정보를 입력해주세요</p>
          </div>
        </div>
      }
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
          error={errors.name}
          disabled={createStudentMutation.isPending}
        />

        {/* 학년 */}
        <FormField
          label="학년"
          type="select"
          value={String(formData.grade)}
          onChange={(e) => handleFieldChange("grade", parseInt(e.target.value))}
          startIcon={<GraduationCap className="w-4 h-4" />}
          required
          error={errors.grade}
          disabled={createStudentMutation.isPending}
          options={[
            { label: "중학교", options: [
              { value: "7", label: "중1" },
              { value: "8", label: "중2" },
              { value: "9", label: "중3" },
            ]},
            { label: "고등학교", options: [
              { value: "10", label: "고1" },
              { value: "11", label: "고2" },
              { value: "12", label: "고3" },
            ]},
            { label: "기타", options: [
              { value: "1", label: "초1" },
              { value: "2", label: "초2" },
              { value: "3", label: "초3" },
              { value: "4", label: "초4" },
              { value: "5", label: "초5" },
              { value: "6", label: "초6" },
            ]}
          ]}
        />

        {/* 학생 연락처 */}
        <FormField
          label="학생 연락처"
          type="tel"
          placeholder="010-1234-5678"
          value={formData.phone || ""}
          onChange={(e) => handleFieldChange("phone", e.target.value)}
          startIcon={<Phone className="w-4 h-4" />}
          error={errors.phone}
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
          error={errors.parent_phone}
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
          error={errors.email}
          disabled={createStudentMutation.isPending}
        />
      </form>
    </Modal>
  );
}