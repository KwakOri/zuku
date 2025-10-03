"use client";

import { PageHeader, PageLayout } from "@/components/common/layout";
import CanvasSchedule from "@/components/common/schedule/CanvasSchedule";
import {
  calculateDensityFromScheduleData,
  defaultScheduleConfig,
} from "@/lib/utils";
import { useClasses, useCreateClass } from "@/queries/useClasses";
import { useStudents } from "@/queries/useStudents";
import { useSubjects } from "@/queries/useSubjects";
import { useTeachers } from "@/queries/useTeachers";
import type {
  ClassStudentWithDetails,
  StudentScheduleWithStudent,
} from "@/services/client/scheduleApi";
import { scheduleApi } from "@/services/client/scheduleApi";
import { ClassBlock } from "@/types/schedule";
import { Tables } from "@/types/supabase";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  Save,
  Settings,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type ClassRow = Tables<"classes">;
type ClassStudentRow = Tables<"class_students">;

interface ClassWithStudents extends ClassRow {
  students?: ClassStudentRow[];
  studentCount?: number;
}

interface CreateClassFormData {
  title: string;
  subjectId: string;
  teacherId: string;
  description?: string;
  room?: string;
  maxStudents?: number;
  dayOfWeek: number | null;
  startTime: string | null;
  endTime: string | null;
  studentIds: string[];
  courseType: "regular" | "school_exam";
}

type TabType = "create" | "manage";

export default function ClassManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("create");

  // Data queries
  const { data: classes = [], isLoading, error } = useClasses();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachers();
  const createClassMutation = useCreateClass();

  // Create form state
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time selection state for synchronized timetable
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    dayOfWeek: number | null;
    startTime: string | null;
    endTime: string | null;
  }>({
    dayOfWeek: null,
    startTime: null,
    endTime: null,
  });

  // Management tab state
  const [selectedClass, setSelectedClass] = useState<ClassWithStudents | null>(
    null
  );
  const [selectedClassStudents, setSelectedClassStudents] = useState<
    ClassStudentRow[]
  >([]);
  const [filterType, setFilterType] = useState<
    "all" | "scheduled" | "unscheduled"
  >("all");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateClassFormData>({
    defaultValues: {
      dayOfWeek: null,
      startTime: null,
      endTime: null,
      studentIds: [],
      courseType: "regular",
    },
  });

  // Watch form values for reactive timetable
  const watchedTitle = watch("title");
  const watchedTeacherId = watch("teacherId");
  const watchedDayOfWeek = watch("dayOfWeek");
  const watchedStartTime = watch("startTime");
  const watchedEndTime = watch("endTime");

  // Sync form with time slot selection
  useEffect(() => {
    if (selectedTimeSlot.dayOfWeek !== null) {
      setValue("dayOfWeek", selectedTimeSlot.dayOfWeek);
    }
    if (selectedTimeSlot.startTime) {
      setValue("startTime", selectedTimeSlot.startTime);
    }
    if (selectedTimeSlot.endTime) {
      setValue("endTime", selectedTimeSlot.endTime);
    }
  }, [selectedTimeSlot, setValue]);

  // State for student density data (create tab)
  const [densityData, setDensityData] = useState<{ [key: string]: number }>({});
  const [tooltipData, setTooltipData] = useState<{
    [key: string]: Array<{
      studentId: string;
      studentName: string;
      scheduleName: string;
    }>;
  }>({});

  // State for management tab density data
  const [managementDensityData, setManagementDensityData] = useState<{
    [key: string]: number;
  }>({});
  const [managementTooltipData, setManagementTooltipData] = useState<{
    [key: string]: Array<{
      studentId: string;
      studentName: string;
      scheduleName: string;
    }>;
  }>({});

  // Fetch and calculate density when selected students change
  useEffect(() => {
    if (selectedStudents.length === 0) {
      setDensityData({});
      setTooltipData({});
      return;
    }

    const fetchDensityData = async () => {
      try {
        // Fetch student info along with schedules
        const schedulePromises = selectedStudents.map(async (studentId) => {
          const schedules = await scheduleApi.getStudentCompleteSchedule(
            studentId
          );

          // Get student name from API response
          let studentName = "Unknown";
          if (
            schedules.classSchedules.length > 0 &&
            schedules.classSchedules[0].student
          ) {
            studentName = schedules.classSchedules[0].student.name;
          } else {
            // Fallback to students array
            const student = students.find((s) => s.id === studentId);
            studentName = student?.name || "Unknown";
          }

          return { studentId, studentName, schedules };
        });

        const allData = await Promise.all(schedulePromises);

        // Flatten all class and personal schedules
        const allClassSchedules = allData.flatMap(
          (d) => d.schedules.classSchedules
        );
        const allPersonalSchedules = allData.flatMap(
          (d) => d.schedules.personalSchedules
        );

        // Calculate density
        const density = calculateDensityFromScheduleData(
          defaultScheduleConfig,
          allClassSchedules,
          allPersonalSchedules
        );

        // Calculate tooltip data
        const tooltip: {
          [key: string]: Array<{
            studentId: string;
            studentName: string;
            scheduleName: string;
          }>;
        } = {};

        // Initialize all time slots
        for (let day = 0; day < 7; day++) {
          for (
            let hour = defaultScheduleConfig.startHour;
            hour <= defaultScheduleConfig.endHour;
            hour++
          ) {
            for (
              let minute = 0;
              minute < 60;
              minute += defaultScheduleConfig.timeSlotMinutes
            ) {
              const time = `${hour.toString().padStart(2, "0")}:${minute
                .toString()
                .padStart(2, "0")}`;
              const key = `${day}-${time}`;
              tooltip[key] = [];
            }
          }
        }

        // Add class schedules to tooltip
        allData.forEach(({ schedules }) => {
          schedules.classSchedules.forEach((cs) => {
            if (!cs.class || !cs.student) return;
            const { day_of_week, start_time, end_time, title } = cs.class;
            const { id: studentId, name: studentName } = cs.student;

            const startHour = parseInt(start_time.split(":")[0]);
            const startMinute = parseInt(start_time.split(":")[1]);
            const endHour = parseInt(end_time.split(":")[0]);
            const endMinute = parseInt(end_time.split(":")[1]);
            const startMinutes = startHour * 60 + startMinute;
            const endMinutes = endHour * 60 + endMinute;

            for (
              let minutes = startMinutes;
              minutes < endMinutes;
              minutes += defaultScheduleConfig.timeSlotMinutes
            ) {
              const hour = Math.floor(minutes / 60);
              const minute = minutes % 60;
              const time = `${hour.toString().padStart(2, "0")}:${minute
                .toString()
                .padStart(2, "0")}`;
              const key = `${day_of_week}-${time}`;

              if (tooltip[key]) {
                tooltip[key].push({
                  studentId,
                  studentName,
                  scheduleName: title,
                });
              }
            }
          });

          // Add personal schedules to tooltip
          schedules.personalSchedules.forEach((ps) => {
            // Get student info from student_schedules join
            const studentInfo = ps.student;
            if (!studentInfo) return;

            const startHour = parseInt(ps.start_time.split(":")[0]);
            const startMinute = parseInt(ps.start_time.split(":")[1]);
            const endHour = parseInt(ps.end_time.split(":")[0]);
            const endMinute = parseInt(ps.end_time.split(":")[1]);
            const startMinutes = startHour * 60 + startMinute;
            const endMinutes = endHour * 60 + endMinute;

            for (
              let minutes = startMinutes;
              minutes < endMinutes;
              minutes += defaultScheduleConfig.timeSlotMinutes
            ) {
              const hour = Math.floor(minutes / 60);
              const minute = minutes % 60;
              const time = `${hour.toString().padStart(2, "0")}:${minute
                .toString()
                .padStart(2, "0")}`;
              const key = `${ps.day_of_week}-${time}`;

              if (tooltip[key]) {
                tooltip[key].push({
                  studentId: studentInfo.id,
                  studentName: studentInfo.name,
                  scheduleName: ps.title,
                });
              }
            }
          });
        });

        setDensityData(density);
        setTooltipData(tooltip);
      } catch (error) {
        console.error("Failed to fetch density data:", error);
        setDensityData({});
        setTooltipData({});
      }
    };

    fetchDensityData();
  }, [selectedStudents]);

  // Generate preview block for new class
  const previewClassBlock: ClassBlock[] = useMemo(() => {
    // Show preview only when time is selected
    if (watchedDayOfWeek === null || !watchedStartTime || !watchedEndTime) {
      return [];
    }

    const selectedTeacher = teachers.find((t) => t.id === watchedTeacherId);

    return [
      {
        id: "preview",
        classId: "preview",
        title: watchedTitle || "신규 수업 (미리보기)",
        subject: watchedTitle || "수업",
        teacherName: selectedTeacher?.name || "강사 미정",
        startTime: watchedStartTime,
        endTime: watchedEndTime,
        dayOfWeek: watchedDayOfWeek,
        color: "#6b7c5d", // Primary color
        studentCount: selectedStudents.length,
        maxStudents: 20,
        isException: false,
      },
    ];
  }, [
    watchedTitle,
    watchedDayOfWeek,
    watchedStartTime,
    watchedEndTime,
    selectedStudents.length,
    watchedTeacherId,
    teachers,
  ]);

  // Combine blocks for create tab timetable (only preview, density will show existing schedules)
  const createTabBlocks = useMemo(() => {
    return [...previewClassBlock];
  }, [previewClassBlock]);

  // Filter classes for management tab
  const { scheduledClasses, unscheduledClasses, allClasses } = useMemo(() => {
    const scheduled = classes.filter(
      (cls) =>
        cls.day_of_week !== null &&
        cls.start_time !== null &&
        cls.end_time !== null
    );
    const unscheduled = classes.filter(
      (cls) =>
        cls.day_of_week === null ||
        cls.start_time === null ||
        cls.end_time === null
    );

    return {
      scheduledClasses: scheduled,
      unscheduledClasses: unscheduled,
      allClasses: classes,
    };
  }, [classes]);

  const filteredClasses = useMemo(() => {
    switch (filterType) {
      case "scheduled":
        return scheduledClasses;
      case "unscheduled":
        return unscheduledClasses;
      default:
        return allClasses;
    }
  }, [filterType, scheduledClasses, unscheduledClasses, allClasses]);

  // Generate blocks for selected class in management tab
  const managementTabBlocks: ClassBlock[] = useMemo(() => {
    if (!selectedClass) return [];

    const dayOfWeek = selectedClass.day_of_week ?? 1;
    const startTime = selectedClass.start_time ?? "18:00";
    const endTime = selectedClass.end_time ?? "19:30";

    return [
      {
        id: selectedClass.id,
        classId: selectedClass.id,
        title: selectedClass.title,
        subject: selectedClass.title,
        teacherName: "담당 강사",
        startTime,
        endTime,
        dayOfWeek,
        color: selectedClass.color,
        room: selectedClass.room || undefined,
        studentCount: selectedClassStudents.length,
        maxStudents: selectedClass.max_students || 20,
        isException: false,
      },
    ];
  }, [selectedClass, selectedClassStudents]);

  // Toggle student selection
  const toggleStudent = (studentId: string) => {
    const newSelection = selectedStudents.includes(studentId)
      ? selectedStudents.filter((id) => id !== studentId)
      : [...selectedStudents, studentId];

    setSelectedStudents(newSelection);
    setValue("studentIds", newSelection);
  };

  // Handle time slot click from timetable
  const handleTimeSlotClick = (timeSlot: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) => {
    setSelectedTimeSlot(timeSlot);
  };

  // Handle class creation
  const onSubmit = async (data: CreateClassFormData) => {
    if (!data.teacherId) {
      toast.error("담당 강사를 선택해주세요.");
      return;
    }

    if (data.studentIds.length === 0) {
      toast.error("최소 1명의 학생을 선택해주세요.");
      return;
    }

    if (data.dayOfWeek === null || !data.startTime || !data.endTime) {
      toast.error(
        "수업 시간을 설정해주세요. 우측 시간표에서 클릭하거나 직접 입력하세요."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await createClassMutation.mutateAsync({
        ...data,
        teacherId: data.teacherId,
        studentIds: selectedStudents,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        courseType: data.courseType,
      });

      toast.success("수업이 성공적으로 개설되었습니다!");

      reset();
      setSelectedStudents([]);
      setSelectedTimeSlot({
        dayOfWeek: null,
        startTime: null,
        endTime: null,
      });

      // Switch to management tab to see the new class
      setActiveTab("manage");
    } catch (error) {
      toast.error("수업 개설 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle class click in management tab
  const handleClassClick = async (cls: ClassWithStudents) => {
    setSelectedClass(cls);

    try {
      const response = await fetch(`/api/class-students?class_id=${cls.id}`);
      if (response.ok) {
        const data = await response.json();
        const classStudents = data.data || [];
        setSelectedClassStudents(classStudents);

        // Fetch density data for selected class students
        if (classStudents.length > 0) {
          const studentIds = classStudents.map(
            (cs: ClassStudentRow) => cs.student_id
          );

          const schedulePromises = studentIds.map(async (studentId: string) => {
            const schedules = await scheduleApi.getStudentCompleteSchedule(
              studentId
            );
            const student = students.find((s) => s.id === studentId);
            return {
              studentId,
              studentName: student?.name || "Unknown",
              schedules,
            };
          });

          const allData = await Promise.all(schedulePromises);

          // Flatten all class and personal schedules
          const allClassSchedules = allData.flatMap(
            (d) => d.schedules.classSchedules
          );
          const allPersonalSchedules = allData.flatMap(
            (d) => d.schedules.personalSchedules
          );

          // Calculate density
          const density = calculateDensityFromScheduleData(
            defaultScheduleConfig,
            allClassSchedules,
            allPersonalSchedules
          );

          // Calculate tooltip data (same logic as create tab)
          const tooltip: {
            [key: string]: Array<{
              studentId: string;
              studentName: string;
              scheduleName: string;
            }>;
          } = {};

          // Initialize all time slots
          for (let day = 0; day < 7; day++) {
            for (
              let hour = defaultScheduleConfig.startHour;
              hour <= defaultScheduleConfig.endHour;
              hour++
            ) {
              for (
                let minute = 0;
                minute < 60;
                minute += defaultScheduleConfig.timeSlotMinutes
              ) {
                const time = `${hour.toString().padStart(2, "0")}:${minute
                  .toString()
                  .padStart(2, "0")}`;
                const key = `${day}-${time}`;
                tooltip[key] = [];
              }
            }
          }

          // Add schedules to tooltip
          allData.forEach(({ schedules }) => {
            schedules.classSchedules.forEach((cs: ClassStudentWithDetails) => {
              if (!cs.class || !cs.student) return;
              const { day_of_week, start_time, end_time, title } = cs.class;
              const { id: studentId, name: studentName } = cs.student;

              const startHour = parseInt(start_time.split(":")[0]);
              const startMinute = parseInt(start_time.split(":")[1]);
              const endHour = parseInt(end_time.split(":")[0]);
              const endMinute = parseInt(end_time.split(":")[1]);
              const startMinutes = startHour * 60 + startMinute;
              const endMinutes = endHour * 60 + endMinute;

              for (
                let minutes = startMinutes;
                minutes < endMinutes;
                minutes += defaultScheduleConfig.timeSlotMinutes
              ) {
                const hour = Math.floor(minutes / 60);
                const minute = minutes % 60;
                const time = `${hour.toString().padStart(2, "0")}:${minute
                  .toString()
                  .padStart(2, "0")}`;
                const key = `${day_of_week}-${time}`;

                if (tooltip[key]) {
                  tooltip[key].push({
                    studentId,
                    studentName,
                    scheduleName: title,
                  });
                }
              }
            });

            schedules.personalSchedules.forEach(
              (ps: StudentScheduleWithStudent) => {
                const studentInfo = ps.student;
                if (!studentInfo) return;

                const startHour = parseInt(ps.start_time.split(":")[0]);
                const startMinute = parseInt(ps.start_time.split(":")[1]);
                const endHour = parseInt(ps.end_time.split(":")[0]);
                const endMinute = parseInt(ps.end_time.split(":")[1]);
                const startMinutes = startHour * 60 + startMinute;
                const endMinutes = endHour * 60 + endMinute;

                for (
                  let minutes = startMinutes;
                  minutes < endMinutes;
                  minutes += defaultScheduleConfig.timeSlotMinutes
                ) {
                  const hour = Math.floor(minutes / 60);
                  const minute = minutes % 60;
                  const time = `${hour.toString().padStart(2, "0")}:${minute
                    .toString()
                    .padStart(2, "0")}`;
                  const key = `${ps.day_of_week}-${time}`;

                  if (tooltip[key]) {
                    tooltip[key].push({
                      studentId: studentInfo.id,
                      studentName: studentInfo.name,
                      scheduleName: ps.title,
                    });
                  }
                }
              }
            );
          });

          setManagementDensityData(density);
          setManagementTooltipData(tooltip);
        } else {
          setManagementDensityData({});
          setManagementTooltipData({});
        }
      }
    } catch (error) {
      console.error("Failed to fetch class students:", error);
      setSelectedClassStudents([]);
      setManagementDensityData({});
      setManagementTooltipData({});
    }
  };

  // Handle blocks change in management tab
  const handleBlocksChange = async (updatedBlocks: ClassBlock[]) => {
    if (!selectedClass || updatedBlocks.length === 0) return;

    const updatedBlock = updatedBlocks[0];

    try {
      const response = await fetch(`/api/classes/${selectedClass.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day_of_week: updatedBlock.dayOfWeek,
          start_time: updatedBlock.startTime,
          end_time: updatedBlock.endTime,
          room: updatedBlock.room,
        }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["classes"] });

        setSelectedClass((prev) =>
          prev
            ? {
                ...prev,
                day_of_week: updatedBlock.dayOfWeek,
                start_time: updatedBlock.startTime,
                end_time: updatedBlock.endTime,
                room: updatedBlock.room || null,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to update class schedule:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-2 text-gray-600">수업 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-error-600">수업 목록을 불러오는데 실패했습니다.</p>
          <p className="mt-1 text-gray-600">{error.message}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 mt-4 text-white transition-all duration-200 flat-card bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl hover:from-primary-600 hover:to-primary-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="수업 관리"
        description="수업을 개설하고 시간표를 설정·관리할 수 있습니다"
        icon={Calendar}
        actions={
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                {allClasses.length}
              </div>
              <div className="text-xs text-gray-500">전체 수업</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success-600">
                {scheduledClasses.length}
              </div>
              <div className="text-xs text-gray-500">시간 확정</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-warning-600">
                {unscheduledClasses.length}
              </div>
              <div className="text-xs text-gray-500">시간 미확정</div>
            </div>
          </div>
        }
      />

      <PageLayout>
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              activeTab === "create"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>수업 개설</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              activeTab === "manage"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>기존 수업 관리</span>
            </div>
          </button>
        </div>

        {activeTab === "create" ? (
          /* CREATE TAB - Class Creation */
          <div className="grid grid-cols-1 gap-8 grow-0 shrink lg:grid-cols-4">
            {/* Panel 1 - Class Info (1/4) */}
            <div className="h-full lg:col-span-1">
              {/* Class Form */}
              <div className="flex flex-col flex-1 h-full p-6 border-0 flat-card rounded-2xl">
                <div className="flex items-center gap-3 mb-6 shrink">
                  <div className="p-2 bg-primary-100 rounded-xl">
                    <BookOpen className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    수업 정보
                  </h2>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex-1 h-full space-y-4 overflow-y-scroll"
                >
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      수업명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("title", {
                        required: "수업명을 입력해주세요",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="예: 고등수학 기초반"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      과목 <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("subjectId", {
                        required: "과목을 선택해주세요",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={subjectsLoading}
                    >
                      <option value="">과목을 선택하세요</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.subject_name}
                        </option>
                      ))}
                    </select>
                    {errors.subjectId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.subjectId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      담당 강사 <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("teacherId", {
                        required: "담당 강사를 선택해주세요",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={teachersLoading}
                    >
                      <option value="">담당 강사를 선택하세요</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                    {errors.teacherId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.teacherId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      수업 유형 <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("courseType", {
                        required: "수업 유형을 선택해주세요",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="regular">정규수업</option>
                      <option value="school_exam">학교내신</option>
                    </select>
                    {errors.courseType && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.courseType.message}
                      </p>
                    )}
                  </div>

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

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      최대 수강 인원
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      {...register("maxStudents", {
                        min: {
                          value: 1,
                          message: "최소 1명 이상이어야 합니다",
                        },
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

                  {/* Time Selection Display */}
                  <div className="p-4 border-0 flat-surface bg-primary-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-primary-900">
                        수업 시간
                      </span>
                    </div>
                    {watchedDayOfWeek !== null &&
                    watchedStartTime &&
                    watchedEndTime ? (
                      <div className="text-sm text-primary-800">
                        {
                          ["일", "월", "화", "수", "목", "금", "토"][
                            watchedDayOfWeek
                          ]
                        }
                        요일 {watchedStartTime} - {watchedEndTime}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        우측 시간표에서 시간을 선택하세요
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
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
                </form>
              </div>
            </div>

            {/* Panel 2 - Student Selection (1/4) */}
            <div className="h-full overflow-y-scroll lg:col-span-1">
              {/* Student Selection */}
              <div className="flex flex-col h-full p-6 border-0 flat-card rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success-100 rounded-xl">
                      <Users className="w-5 h-5 text-success-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      수강 학생 선택
                    </h2>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {selectedStudents.length}명 선택
                  </span>
                </div>

                {studentsLoading ? (
                  <div className="py-4 text-center">
                    <div className="w-6 h-6 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto shrink">
                    {students.length === 0 ? (
                      <p className="py-4 text-sm text-center text-gray-500">
                        등록된 학생이 없습니다.
                      </p>
                    ) : (
                      students.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center p-3 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => toggleStudent(student.id)}
                            className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1 ml-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                {student.name}
                              </span>
                              <span className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-full">
                                {student.grade}학년
                              </span>
                            </div>
                            {student.phone && (
                              <span className="text-xs text-gray-500">
                                {student.phone}
                              </span>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Panel 3 & 4 - Timetable (2/4) */}
            <div className="lg:col-span-2">
              <div className="p-6 border-0 flat-card rounded-2xl">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="mb-2 text-lg font-semibold text-gray-800">
                        수업 시간표 설정
                      </h2>
                      <p className="text-sm text-gray-600">
                        시간표에서 원하는 시간대를 클릭하여 수업 시간을
                        설정하세요.
                        {selectedStudents.length > 0 &&
                          " 배경색이 진할수록 선택한 학생들의 기존 일정이 많은 시간대입니다."}
                      </p>
                    </div>

                    {/* Density Legend */}
                    {selectedStudents.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-gray-700">
                          밀집도 & 신규 수업
                        </span>
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-3 border border-gray-200 rounded bg-gradient-to-r from-white via-yellow-100 to-red-200"></div>
                            <span className="text-gray-600">일정 밀집도</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-3 rounded"
                              style={{ backgroundColor: "#6b7c5d" }}
                            ></div>
                            <span className="text-gray-600">신규 수업</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <CanvasSchedule
                  customBlocks={createTabBlocks}
                  onTimeSlotClick={handleTimeSlotClick}
                  editMode="admin"
                  showDensity={selectedStudents.length > 0}
                  customDensityData={densityData}
                  densityTooltipData={tooltipData}
                />

                {/* Density Info */}
                {selectedStudents.length > 0 && (
                  <div className="p-4 mt-4 border-0 flat-surface bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        일정 밀집도 안내
                      </span>
                    </div>
                    <p className="text-xs text-blue-700">
                      선택한 {selectedStudents.length}명 학생의 기존 일정(수업 +
                      개인일정)을 바탕으로 시간대별 밀집도를 표시합니다.
                      배경색이 옅은 시간대가 수업 개설에 더 적합합니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* MANAGE TAB - Existing Class Management */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Left Panel - Class List (1/4) */}
            <div className="lg:col-span-1">
              {/* Filter */}
              <div className="p-4 mb-6 border-0 flat-card rounded-2xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                  수업 필터
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      value: "all",
                      label: "전체 수업",
                      count: allClasses.length,
                      icon: Settings,
                    },
                    {
                      value: "scheduled",
                      label: "시간 확정",
                      count: scheduledClasses.length,
                      icon: CheckCircle,
                    },
                    {
                      value: "unscheduled",
                      label: "시간 미확정",
                      count: unscheduledClasses.length,
                      icon: AlertCircle,
                    },
                  ].map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.value}
                        onClick={() =>
                          setFilterType(
                            filter.value as "all" | "scheduled" | "unscheduled"
                          )
                        }
                        className={`w-full text-left px-3 py-2 rounded-2xl text-sm transition-all duration-200 ${
                          filterType === filter.value
                            ? "flat-surface bg-primary-50 text-primary-700 border-0"
                            : "flat-card bg-neu-100 text-gray-700 hover:flat-pressed"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{filter.label}</span>
                          </div>
                          <span className="text-xs">{filter.count}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Class List */}
              <div className="p-4 border-0 flat-card rounded-2xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                  수업 목록
                </h3>
                <div className="space-y-2 overflow-y-auto max-h-96">
                  {filteredClasses.length === 0 ? (
                    <p className="py-4 text-sm text-center text-gray-500">
                      수업이 없습니다.
                    </p>
                  ) : (
                    filteredClasses.map((cls) => {
                      const isScheduled =
                        cls.day_of_week !== null &&
                        cls.start_time !== null &&
                        cls.end_time !== null;
                      const isSelected = selectedClass?.id === cls.id;

                      return (
                        <div
                          key={cls.id}
                          onClick={() => handleClassClick(cls)}
                          className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "flat-surface bg-primary-50 border-0"
                              : "flat-card bg-neu-100 hover:flat-pressed"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: cls.color }}
                                />
                                <span className="text-sm font-medium text-gray-800">
                                  {cls.title}
                                </span>
                                {isScheduled ? (
                                  <CheckCircle className="w-4 h-4 text-success-500" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-warning-500" />
                                )}
                              </div>

                              {cls.description && (
                                <p className="mb-2 text-xs text-gray-600">
                                  {cls.description}
                                </p>
                              )}

                              <div className="space-y-1 text-xs text-gray-600">
                                {isScheduled && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {
                                      [
                                        "일",
                                        "월",
                                        "화",
                                        "수",
                                        "목",
                                        "금",
                                        "토",
                                      ][cls.day_of_week!]
                                    }{" "}
                                    {cls.start_time} - {cls.end_time}
                                  </div>
                                )}
                                {cls.room && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {cls.room}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  최대 {cls.max_students || 20}명
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Timetable (3/4) */}
            <div className="lg:col-span-3">
              {selectedClass ? (
                <div>
                  {/* Selected Class Info */}
                  <div className="p-4 mb-6 border-0 flat-card rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {selectedClass.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          수강생 {selectedClassStudents.length}명 / 최대{" "}
                          {selectedClass.max_students || 20}명
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: selectedClass.color }}
                        />
                        <span className="text-sm text-gray-600">
                          {selectedClass.day_of_week !== null &&
                          selectedClass.start_time
                            ? "시간 확정"
                            : "시간 미확정"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timetable */}
                  <CanvasSchedule
                    key={`class-${selectedClass.id}-${selectedClassStudents.length}`}
                    customBlocks={managementTabBlocks}
                    onBlocksChange={handleBlocksChange}
                    editMode="admin"
                    showDensity={selectedClassStudents.length > 0}
                    customDensityData={managementDensityData}
                    densityTooltipData={managementTooltipData}
                  />
                </div>
              ) : (
                <div className="p-8 text-center border-0 flat-card rounded-2xl">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-800">
                    수업을 선택해주세요
                  </h3>
                  <p className="text-gray-500">
                    좌측 목록에서 수업을 클릭하면 시간표에서 수업 시간을 설정할
                    수 있습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </PageLayout>
    </>
  );
}
