"use client";

import { useCreateClass } from "@/queries/useClasses";
import { useSubjects } from "@/queries/useSubjects";
import { useTeachers } from "@/queries/useTeachers";
import { addSchoolTag, removeSchoolTag, validateSchoolTag, serializeSchoolTags } from "@/lib/schoolTags";
import { BookOpen, Check, Save, Search, X, Hash, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface SimpleClassFormData {
  title: string;
  subjectId: string;
  teacherId: string;
  description?: string;
  room?: string;
  maxStudents?: number;
  courseType: "regular" | "school_exam";
  splitType: "single" | "split";
}

interface SimpleClassFormProps {
  onSubjectChange?: (subjectId: string) => void;
  onCourseTypeChange?: (courseType: "regular" | "school_exam" | "") => void;
  onTeacherChange?: (teacherId: string) => void;
}

export default function SimpleClassForm({
  onSubjectChange,
  onCourseTypeChange,
  onTeacherChange,
}: SimpleClassFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [isTeacherSearchOpen, setIsTeacherSearchOpen] = useState(false);
  const teacherSearchRef = useRef<HTMLDivElement>(null);

  // School tags state (for school_exam type)
  const [schoolTags, setSchoolTags] = useState<string[]>([]);
  const [schoolTagInput, setSchoolTagInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SimpleClassFormData>({
    defaultValues: {
      courseType: "regular",
      splitType: "single",
    },
  });

  const createClassMutation = useCreateClass();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachers();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();

  // Watch form values
  const selectedSubjectId = watch("subjectId");
  const selectedTeacherId = watch("teacherId");
  const selectedCourseType = watch("courseType");
  const selectedSplitType = watch("splitType");

  // Notify parent of changes
  useEffect(() => {
    onSubjectChange?.(selectedSubjectId);
  }, [selectedSubjectId, onSubjectChange]);

  useEffect(() => {
    onCourseTypeChange?.(selectedCourseType);
  }, [selectedCourseType, onCourseTypeChange]);

  useEffect(() => {
    onTeacherChange?.(selectedTeacherId);
  }, [selectedTeacherId, onTeacherChange]);

  // Filter teachers based on search
  const filteredTeachers = useMemo(() => {
    if (!teacherSearch) return teachers.slice(0, 3);
    return teachers
      .filter((teacher) =>
        teacher.name.toLowerCase().includes(teacherSearch.toLowerCase())
      )
      .slice(0, 3);
  }, [teachers, teacherSearch]);

  // Get selected teacher
  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  // Click outside handler for teacher search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        teacherSearchRef.current &&
        !teacherSearchRef.current.contains(event.target as Node)
      ) {
        setIsTeacherSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle school tag input
  const handleAddSchoolTag = () => {
    const validation = validateSchoolTag(schoolTagInput);

    if (!validation.isValid) {
      toast.error(validation.error || "유효하지 않은 학교명입니다");
      return;
    }

    const updatedTags = addSchoolTag(schoolTags, schoolTagInput);

    if (updatedTags.length === schoolTags.length) {
      toast.error("이미 추가된 학교명입니다");
      return;
    }

    setSchoolTags(updatedTags);
    setSchoolTagInput("");
  };

  const handleRemoveSchoolTag = (tagToRemove: string) => {
    setSchoolTags(removeSchoolTag(schoolTags, tagToRemove));
  };

  const handleSchoolTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSchoolTag();
    }
  };

  const onSubmit = async (data: SimpleClassFormData) => {
    setIsSubmitting(true);

    try {
      // Serialize school tags for school_exam type
      const schoolTagsData = data.courseType === "school_exam"
        ? serializeSchoolTags(schoolTags)
        : null;

      await createClassMutation.mutateAsync({
        ...data,
        studentIds: [], // 학생은 나중에 등록
        schoolTags: schoolTagsData,
      });

      toast.success(
        "수업이 성공적으로 개설되었습니다! 시간 배정 탭에서 수업 시간을 설정하세요."
      );
      reset();
      setSchoolTags([]);
      setSchoolTagInput("");
    } catch (error) {
      toast.error("수업 개설 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-6 mx-auto bg-white border border-gray-200 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-xl">
          <BookOpen className="w-5 h-5 text-primary-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">수업 기본 정보</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          {/* 수업명 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              수업명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title", { required: "수업명을 입력해주세요" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 고등수학 기초반"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* 과목 - Button Grid */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              과목 <span className="text-red-500">*</span>
            </label>
            <Controller
              name="subjectId"
              control={control}
              rules={{ required: "과목을 선택해주세요" }}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {subjectsLoading ? (
                    <div className="col-span-2 py-4 text-center text-gray-400">
                      과목 로딩 중...
                    </div>
                  ) : (
                    subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => field.onChange(subject.id)}
                        className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                          field.value === subject.id
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{subject.subject_name}</span>
                          {field.value === subject.id && (
                            <Check className="w-4 h-4 text-primary-600" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            />
            {errors.subjectId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.subjectId.message}
              </p>
            )}
          </div>

          {/* 수업 유형 - Button Group */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              수업 유형 <span className="text-red-500">*</span>
            </label>
            <Controller
              name="courseType"
              control={control}
              rules={{ required: "수업 유형을 선택해주세요" }}
              render={({ field }) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => field.onChange("regular")}
                    className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                      field.value === "regular"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>정규수업</span>
                      {field.value === "regular" && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("school_exam")}
                    className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                      field.value === "school_exam"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>학교내신</span>
                      {field.value === "school_exam" && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  </button>
                </div>
              )}
            />
          </div>

          {/* 학교 태그 - School Exam Only */}
          {selectedCourseType === "school_exam" && (
            <div className="p-4 border-2 border-primary-200 rounded-lg bg-primary-25">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                <Hash className="inline w-4 h-4 mr-1" />
                학교명 태그
              </label>
              <p className="mb-3 text-xs text-gray-500">
                학교내신 수업의 대상 학교들을 입력하세요 (예: 서울고, 강남고)
              </p>

              {/* Tag Input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={schoolTagInput}
                  onChange={(e) => setSchoolTagInput(e.target.value)}
                  onKeyPress={handleSchoolTagKeyPress}
                  placeholder="학교명을 입력하고 Enter..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddSchoolTag}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-white transition-all duration-200 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>추가</span>
                </button>
              </div>

              {/* Tag Display */}
              {schoolTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {schoolTags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary-700 bg-primary-100 rounded-full"
                    >
                      <Hash className="w-3 h-3" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSchoolTag(tag)}
                        className="p-0.5 transition-colors rounded-full hover:bg-primary-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 수업 구성 타입 - Button Group */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              수업 구성 타입 <span className="text-red-500">*</span>
            </label>
            <Controller
              name="splitType"
              control={control}
              rules={{ required: "수업 구성 타입을 선택해주세요" }}
              render={({ field }) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => field.onChange("single")}
                    className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                      field.value === "single"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>단일 수업</span>
                      {field.value === "single" && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("split")}
                    className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                      field.value === "split"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>앞/뒤타임 수업</span>
                      {field.value === "split" && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  </button>
                </div>
              )}
            />
            <p className="mt-1 text-xs text-gray-500">
              앞/뒤타임 수업은 학생별로 다른 시간대를 선택할 수 있습니다
            </p>
          </div>

          {/* 담당 강사 - Search */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              담당 강사 <span className="text-red-500">*</span>
            </label>
            <Controller
              name="teacherId"
              control={control}
              rules={{ required: "담당 강사를 선택해주세요" }}
              render={({ field }) => (
                <div className="relative" ref={teacherSearchRef}>
                  {/* Selected Teacher Display or Search Input */}
                  {field.value && selectedTeacher ? (
                    <div className="flex items-center justify-between px-4 py-3 border-2 rounded-lg border-primary-500 bg-primary-50">
                      <span className="font-medium text-primary-700">
                        {selectedTeacher.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange("");
                          setTeacherSearch("");
                          setIsTeacherSearchOpen(true);
                        }}
                        className="p-1 transition-colors rounded-md hover:bg-primary-100"
                      >
                        <X className="w-4 h-4 text-primary-600" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                          type="text"
                          placeholder="강사 이름으로 검색..."
                          value={teacherSearch}
                          onChange={(e) => {
                            setTeacherSearch(e.target.value);
                            setIsTeacherSearchOpen(true);
                          }}
                          onFocus={() => setIsTeacherSearchOpen(true)}
                          className="w-full py-3 pl-10 pr-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                          disabled={teachersLoading}
                        />
                      </div>

                      {/* Search Results Dropdown */}
                      {isTeacherSearchOpen && !teachersLoading && (
                        <div className="absolute z-10 w-full mt-1 overflow-hidden bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-32">
                          {filteredTeachers.length > 0 ? (
                            <div className="overflow-y-auto max-h-32">
                              {filteredTeachers.map((teacher) => (
                                <button
                                  key={teacher.id}
                                  type="button"
                                  onClick={() => {
                                    field.onChange(teacher.id);
                                    setIsTeacherSearchOpen(false);
                                    setTeacherSearch("");
                                  }}
                                  className="w-full px-4 py-2 text-left transition-colors hover:bg-primary-50"
                                >
                                  <span className="text-sm font-medium text-gray-800">
                                    {teacher.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-3 text-sm text-center text-gray-500">
                              검색 결과가 없습니다
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            />
            {errors.teacherId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.teacherId.message}
              </p>
            )}
          </div>

          {/* 강의실 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              강의실
            </label>
            <input
              type="text"
              {...register("room")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 301호"
            />
          </div>

          {/* 최대 수강 인원 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              최대 수강 인원
            </label>
            <input
              type="number"
              min="1"
              max="50"
              {...register("maxStudents", {
                min: { value: 1, message: "최소 1명 이상이어야 합니다" },
                max: { value: 50, message: "최대 50명까지 가능합니다" },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 15"
            />
            {errors.maxStudents && (
              <p className="mt-1 text-sm text-red-600">
                {errors.maxStudents.message}
              </p>
            )}
          </div>

          {/* 수업 설명 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              수업 설명
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="수업에 대한 간단한 설명을 입력해주세요"
            />
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-white transition-all duration-200 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                <span>수업 개설 중...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>수업 개설</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
