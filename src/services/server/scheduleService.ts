import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

interface StudentScheduleWithStudent extends Tables<"student_schedules"> {
  student?: {
    id: string;
    name: string;
    grade: number;
  } | null;
}

interface ClassStudentWithDetails extends Tables<"class_students"> {
  student?: {
    id: string;
    name: string;
    grade: number;
    phone: string | null;
    parent_phone: string | null;
    email: string | null;
  } | null;
  class?: {
    id: string;
    title: string;
  } | null;
}

export class ScheduleService {
  private supabase = createAdminSupabaseClient();

  // 학생 개인 일정 관리
  async getStudentSchedules(studentId?: string): Promise<StudentScheduleWithStudent[]> {
    let query = this.supabase
      .from("student_schedules")
      .select(`
        *,
        student:students(id, name, grade)
      `)
      .eq("status", "active")
      .order("day_of_week")
      .order("start_time");

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch student schedules: ${error.message}`);
    }

    return data || [];
  }

  async getStudentScheduleById(id: string): Promise<StudentScheduleWithStudent> {
    const { data, error } = await this.supabase
      .from("student_schedules")
      .select(`
        *,
        student:students(id, name, grade)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Schedule not found");
      }
      throw new Error(`Failed to fetch schedule: ${error.message}`);
    }

    return data;
  }

  async createStudentSchedule(scheduleData: TablesInsert<"student_schedules">): Promise<StudentScheduleWithStudent> {
    const { data, error } = await this.supabase
      .from("student_schedules")
      .insert([scheduleData])
      .select(`
        *,
        student:students(id, name, grade)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create schedule: ${error.message}`);
    }

    return data;
  }

  async updateStudentSchedule(id: string, updateData: TablesUpdate<"student_schedules">): Promise<StudentScheduleWithStudent> {
    const { data, error } = await this.supabase
      .from("student_schedules")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        student:students(id, name, grade)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update schedule: ${error.message}`);
    }

    return data;
  }

  async deleteStudentSchedule(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("student_schedules")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete schedule: ${error.message}`);
    }
  }

  // 수업-학생 관계 관리
  async getClassStudents(classId?: string, studentId?: string): Promise<ClassStudentWithDetails[]> {
    let query = this.supabase
      .from("class_students")
      .select(`
        *,
        student:students(id, name, grade, phone, parent_phone, email),
        class:classes(id, title)
      `)
      .eq("status", "active");

    if (classId) {
      query = query.eq("class_id", classId);
    }

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data, error } = await query.order("enrolled_date", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch class students: ${error.message}`);
    }

    return data || [];
  }

  async enrollStudentInClass(enrollmentData: TablesInsert<"class_students">): Promise<ClassStudentWithDetails> {
    // 중복 등록 체크
    const { data: existing } = await this.supabase
      .from("class_students")
      .select("id")
      .eq("class_id", enrollmentData.class_id)
      .eq("student_id", enrollmentData.student_id)
      .eq("status", "active")
      .single();

    if (existing) {
      throw new Error("Student is already enrolled in this class");
    }

    const { data, error } = await this.supabase
      .from("class_students")
      .insert([enrollmentData])
      .select(`
        *,
        student:students(id, name, grade, phone, parent_phone, email),
        class:classes(id, title)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to enroll student: ${error.message}`);
    }

    return data;
  }

  async unenrollStudentFromClass(classId: string, studentId: string): Promise<void> {
    const { error } = await this.supabase
      .from("class_students")
      .update({ status: "inactive" })
      .eq("class_id", classId)
      .eq("student_id", studentId);

    if (error) {
      throw new Error(`Failed to unenroll student: ${error.message}`);
    }
  }

  // 종합 스케줄 조회
  async getStudentCompleteSchedule(studentId: string) {
    // 학생의 수업 일정 조회
    const classSchedules = await this.getClassStudents(undefined, studentId);
    
    // 학생의 개인 일정 조회
    const personalSchedules = await this.getStudentSchedules(studentId);

    return {
      classSchedules,
      personalSchedules,
    };
  }

  // 시간표 밀집도 분석을 위한 데이터 조회
  async getScheduleDensityData() {
    const [studentSchedules, classStudents] = await Promise.all([
      this.getStudentSchedules(),
      this.getClassStudents(),
    ]);

    return {
      studentSchedules,
      classStudents,
    };
  }

  // 시간대별 가용한 학생 조회
  async getAvailableStudentsAtTime(dayOfWeek: number, startTime: string, endTime: string, excludeClassId?: string) {
    // 해당 시간대에 개인 일정이 있는 학생 조회
    const { data: busyWithPersonal } = await this.supabase
      .from("student_schedules")
      .select("student_id")
      .eq("day_of_week", dayOfWeek)
      .eq("status", "active")
      .lte("start_time", endTime)
      .gte("end_time", startTime);

    // 해당 시간대에 다른 수업이 있는 학생 조회
    let classQuery = this.supabase
      .from("class_students")
      .select(`
        student_id,
        class:classes!inner(start_time, end_time, day_of_week)
      `)
      .eq("status", "active")
      .eq("class.day_of_week", dayOfWeek)
      .lte("class.start_time", endTime)
      .gte("class.end_time", startTime);

    if (excludeClassId) {
      classQuery = classQuery.neq("class_id", excludeClassId);
    }

    const { data: busyWithClass } = await classQuery;

    const busyStudentIds = new Set([
      ...(busyWithPersonal?.map(item => item.student_id) || []),
      ...(busyWithClass?.map(item => item.student_id) || []),
    ]);

    // 전체 학생에서 바쁜 학생들 제외
    const { data: availableStudents } = await this.supabase
      .from("students")
      .select("*")
      .not("id", "in", `(${Array.from(busyStudentIds).join(",")})`);

    return availableStudents || [];
  }
}