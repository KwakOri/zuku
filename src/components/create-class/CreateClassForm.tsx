"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar, Clock, Users, MapPin, BookOpen, Save, Plus, X, Split } from "lucide-react";
import { useCreateClass } from "@/queries/useClasses";
import { useTeachers } from "@/queries/useTeachers";
import { useStudents } from "@/queries/useStudents";
import toast from "react-hot-toast";
import {
  Card,
  Button,
  FormField,
  Avatar,
  Badge,
  Icon,
  Chip
} from "@/components/design-system";
import ClassCompositionSelector from "@/components/ClassCompositionSelector";

interface CreateClassFormProps {
  userRole: string;
  userId: string;
}

interface CreateClassFormData {
  title: string;
  subject: string;
  description?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  teacherId: string;
  room?: string;
  maxStudents?: number;
  studentIds: string[];
  type: "single" | "split";
}

const subjects = [
  "수학", "영어", "국어", "과학", "사회", "역사", "물리", "화학", "생물", "지구과학"
];

const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

export default function CreateClassForm({ userRole, userId }: CreateClassFormProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdClassId, setCreatedClassId] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateClassFormData>({
    defaultValues: {
      teacherId: userRole === 'teacher' ? userId : '',
      studentIds: [],
      type: 'single',
    }
  });

  const createClassMutation = useCreateClass();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachers();
  const { data: students = [], isLoading: studentsLoading } = useStudents();

  const watchedStartTime = watch("startTime");
  const watchedEndTime = watch("endTime");
  const watchedClassType = watch("type");

  // 시간 유효성 검증
  const validateTimeRange = () => {
    if (!watchedStartTime || !watchedEndTime) return true;
    return watchedStartTime < watchedEndTime;
  };

  // 학생 선택/해제
  const toggleStudent = (studentId: string) => {
    const newSelection = selectedStudents.includes(studentId)
      ? selectedStudents.filter(id => id !== studentId)
      : [...selectedStudents, studentId];

    setSelectedStudents(newSelection);
    setValue("studentIds", newSelection);
  };

  // 폼 제출
  const onSubmit = async (data: CreateClassFormData) => {
    if (!validateTimeRange()) {
      toast.error("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    if (data.studentIds.length === 0) {
      toast.error("최소 1명의 학생을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createClassMutation.mutateAsync({
        ...data,
        studentIds: selectedStudents,
      });

      // split 타입인 경우 생성된 수업 ID 저장
      if (data.type === 'split' && result?.id) {
        setCreatedClassId(result.id);
        toast.success("수업이 개설되었습니다. 이제 앞/뒤타임을 설정해주세요.");
      } else {
        toast.success("수업이 성공적으로 개설되었습니다!");
      }

      // 폼 초기화는 부모 컴포넌트에서 처리하거나 페이지 이동
      // router.push("/classes") 등으로 처리 가능
    } catch (error) {
      toast.error("수업 개설 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 기본 정보 섹션 */}
        <Card size="lg" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Avatar
              size="md"
              variant="flat"
              className="bg-primary-100"
              fallback={<Icon name="book-open" size="sm" color="primary" />}
            />
            <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                label="수업명"
                placeholder="예: 고등수학 기초반"
                required
                error={errors.title?.message}
                {...register("title", { required: "수업명을 입력해주세요" })}
              />

              <FormField
                label="과목"
                type="select"
                required
                error={errors.subject?.message}
                {...register("subject", { required: "과목을 선택해주세요" })}
                options={[
                  { value: "", label: "과목을 선택하세요" },
                  ...subjects.map(subject => ({ value: subject, label: subject }))
                ]}
              />
            </div>

            <FormField
              label="수업 설명"
              type="textarea"
              rows={3}
              placeholder="수업에 대한 간단한 설명을 입력해주세요"
              {...register("description")}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                label="강의실"
                placeholder="예: A-101"
                startIcon={<MapPin className="w-4 h-4" />}
                {...register("room")}
              />

              <FormField
                label="최대 수강 인원"
                type="number"
                min="1"
                max="50"
                placeholder="예: 15"
                startIcon={<Users className="w-4 h-4" />}
                error={errors.maxStudents?.message}
                {...register("maxStudents", {
                  min: { value: 1, message: "최소 1명 이상이어야 합니다" },
                  max: { value: 50, message: "최대 50명까지 가능합니다" }
                })}
              />
            </div>
          </div>
      </Card>

      {/* 수업 타입 섹션 */}
      <Card size="lg" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Avatar
            size="md"
            variant="flat"
            className="bg-info-100"
            fallback={<Split className="w-5 h-5 text-info-600" />}
          />
          <h3 className="text-lg font-semibold text-gray-900">수업 구성</h3>
        </div>

        <FormField
          label="수업 타입"
          type="select"
          required
          error={errors.type?.message}
          helperText="앞/뒤타임 수업은 학생별로 다른 시간대를 선택할 수 있습니다"
          {...register("type", { required: "수업 타입을 선택해주세요" })}
          options={[
            { value: "single", label: "단일 수업" },
            { value: "split", label: "앞/뒤타임 수업" }
          ]}
        />

        {/* split 타입이고 수업이 생성된 경우 시간 구성 설정 UI 표시 */}
        {watchedClassType === "split" && createdClassId && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-3">앞/뒤타임 설정</h4>
            <ClassCompositionSelector
              classId={createdClassId}
              classType="split"
              editMode={true}
            />
          </div>
        )}
      </Card>

      {/* 시간 설정 섹션 */}
      <Card size="lg" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Avatar
            size="md"
            variant="flat"
            className="bg-success-100"
            fallback={<Icon name="clock" size="sm" color="success" />}
          />
          <h3 className="text-lg font-semibold text-gray-900">시간 설정</h3>
          {watchedClassType === "split" && (
            <Badge variant="info" size="sm">
              기본 시간 (나중에 앞/뒤타임 설정 가능)
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FormField
            label="요일"
            type="select"
            required
            error={errors.dayOfWeek?.message}
            startIcon={<Calendar className="w-4 h-4" />}
            {...register("dayOfWeek", {
              required: "요일을 선택해주세요",
              valueAsNumber: true
            })}
            options={[
              { value: "", label: "요일 선택" },
              ...dayNames.map((day, index) => ({ value: String(index), label: day }))
            ]}
          />

          <FormField
            label="시작 시간"
            type="time"
            required
            error={errors.startTime?.message}
            startIcon={<Clock className="w-4 h-4" />}
            {...register("startTime", { required: "시작 시간을 입력해주세요" })}
          />

          <FormField
            label="종료 시간"
            type="time"
            required
            error={errors.endTime?.message || (watchedStartTime && watchedEndTime && !validateTimeRange() ? "종료 시간은 시작 시간보다 늦어야 합니다" : undefined)}
            startIcon={<Clock className="w-4 h-4" />}
            {...register("endTime", { required: "종료 시간을 입력해주세요" })}
          />
        </div>
      </Card>

      {/* 강사 배정 섹션 */}
      <Card size="lg" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Avatar
            size="md"
            variant="flat"
            className="bg-secondary-100"
            fallback={<Icon name="user" size="sm" color="secondary" />}
          />
          <h3 className="text-lg font-semibold text-gray-900">담당 강사</h3>
        </div>

        <FormField
          label="강사 선택"
          type="select"
          required
          disabled={userRole === 'teacher'}
          error={errors.teacherId?.message}
          helperText={userRole === 'teacher' ? "강사는 자신을 담당 강사로 자동 배정됩니다" : undefined}
          startIcon={<Users className="w-4 h-4" />}
          {...register("teacherId", { required: "담당 강사를 선택해주세요" })}
          options={[
            { value: "", label: "강사를 선택하세요" },
            ...teachers.map((teacher) => ({
              value: teacher.id,
              label: `${teacher.name} - ${teacher.email}`
            }))
          ]}
        />
      </Card>

      {/* 학생 선택 섹션 */}
      <Card size="lg" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Avatar
            size="md"
            variant="flat"
            className="bg-warning-100"
            fallback={<Icon name="users" size="sm" color="warning" />}
          />
          <h3 className="text-lg font-semibold text-gray-900">수강 학생</h3>
          <Badge variant="secondary" size="md">
            {selectedStudents.length}명 선택됨
          </Badge>
        </div>

        {studentsLoading ? (
          <div className="text-center py-8">
            <Icon name="loader" size="lg" color="primary" className="mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">학생 목록을 불러오는 중...</p>
          </div>
        ) : (
          <Card variant="flat" className="max-h-60 overflow-y-auto">
            {students.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                등록된 학생이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-neu-200">
                {students.map((student) => (
                  <label
                    key={student.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {student.name}
                        </span>
                        <Chip variant="outline" size="sm">
                          {student.grade}학년
                        </Chip>
                      </div>
                      {student.phone && (
                        <span className="text-xs text-gray-500">{student.phone}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </Card>
        )}
      </Card>

      {/* 제출 버튼 */}
      <Card variant="flat" className="border-t border-neu-200 p-6">
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting || !validateTimeRange()}
            loading={isSubmitting}
          >
            {isSubmitting ? (
              "수업 개설 중..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                수업 개설
              </>
            )}
          </Button>
        </div>
      </Card>
    </form>
    </div>
  );
}