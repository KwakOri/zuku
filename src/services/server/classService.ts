import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

interface ClassWithTeacher extends Tables<"classes"> {
  teacher?: {
    id: string;
    name: string;
  } | null;
  subject?: Tables<"subjects"> | null;
  class_composition?: Tables<"class_composition">[];
}

interface ClassWithStudents extends Tables<"classes"> {
  students?: {
    id: number;
    name: string;
    grade: number;
    enrolled_date: string;
  }[];
}

interface ClassStudentRelation {
  student: {
    id: number;
    name: string;
    grade: number;
  };
  enrolled_date: string;
}

export class ClassService {
  private supabase = createAdminSupabaseClient();

  async getClasses(): Promise<ClassWithTeacher[]> {
    const { data, error } = await this.supabase
      .from("classes")
      .select(`
        *,
        teacher:teachers(id, name)
      `)
      .order("day_of_week")
      .order("start_time");

    if (error) {
      throw new Error(`Failed to fetch classes: ${error.message}`);
    }

    return data || [];
  }

  async getClassById(id: string): Promise<ClassWithTeacher> {
    const { data, error } = await this.supabase
      .from("classes")
      .select(`
        *,
        teacher:teachers(id, name)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Class not found");
      }
      throw new Error(`Failed to fetch class: ${error.message}`);
    }

    return data;
  }

  async getClassWithStudents(id: string): Promise<ClassWithStudents> {
    const { data, error } = await this.supabase
      .from("classes")
      .select(`
        *,
        class_students!inner(
          enrolled_date,
          student:students(id, name, grade)
        )
      `)
      .eq("id", id)
      .eq("class_students.status", "active")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Class not found");
      }
      throw new Error(`Failed to fetch class with students: ${error.message}`);
    }

    // 데이터 구조 변환
    const classData = {
      ...data,
      students: data.class_students?.map((cs: ClassStudentRelation) => ({
        id: cs.student.id,
        name: cs.student.name,
        grade: cs.student.grade,
        enrolled_date: cs.enrolled_date,
      })) || []
    } as ClassWithStudents;

    // class_students 속성 제거
    delete (classData as Record<string, unknown>).class_students;

    return classData;
  }

  async createClass(classData: TablesInsert<"classes">): Promise<ClassWithTeacher> {
    const { data, error } = await this.supabase
      .from("classes")
      .insert([classData])
      .select(`
        *,
        teacher:teachers(id, name)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create class: ${error.message}`);
    }

    return data;
  }

  async updateClass(id: string, updateData: TablesUpdate<"classes">): Promise<ClassWithTeacher> {
    const { data, error } = await this.supabase
      .from("classes")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        teacher:teachers(id, name)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update class: ${error.message}`);
    }

    return data;
  }

  async deleteClass(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("classes")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete class: ${error.message}`);
    }
  }

  async getClassesByTeacher(teacherId: string): Promise<ClassWithTeacher[]> {
    const { data, error } = await this.supabase
      .from("classes")
      .select(`
        *,
        teacher:teachers(id, name)
      `)
      .eq("teacher_id", teacherId)
      .order("day_of_week")
      .order("start_time");

    if (error) {
      throw new Error(`Failed to fetch classes by teacher: ${error.message}`);
    }

    return data || [];
  }

  async getClassesByDayOfWeek(dayOfWeek: number): Promise<ClassWithTeacher[]> {
    const { data, error } = await this.supabase
      .from("classes")
      .select(`
        *,
        teacher:teachers(id, name)
      `)
      .eq("day_of_week", dayOfWeek)
      .order("start_time");

    if (error) {
      throw new Error(`Failed to fetch classes by day: ${error.message}`);
    }

    return data || [];
  }

  async getClassesBySubject(subject: string): Promise<ClassWithTeacher[]> {
    const { data, error } = await this.supabase
      .from("classes")
      .select(`
        *,
        teacher:teachers(id, name)
      `)
      .eq("subject", subject)
      .order("day_of_week")
      .order("start_time");

    if (error) {
      throw new Error(`Failed to fetch classes by subject: ${error.message}`);
    }

    return data || [];
  }
}