import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export class StudentService {
  private supabase = createAdminSupabaseClient();

  async getStudents(): Promise<Tables<"students">[]> {
    const { data, error } = await this.supabase
      .from("students")
      .select("*")
      .order("name");

    if (error) {
      throw new Error(`Failed to fetch students: ${error.message}`);
    }

    return data || [];
  }

  async getStudentById(id: number): Promise<Tables<"students">> {
    const { data, error } = await this.supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Student not found");
      }
      throw new Error(`Failed to fetch student: ${error.message}`);
    }

    return data;
  }

  async createStudent(studentData: TablesInsert<"students">): Promise<Tables<"students">> {
    const { data, error } = await this.supabase
      .from("students")
      .insert([studentData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create student: ${error.message}`);
    }

    return data;
  }

  async updateStudent(id: number, updateData: TablesUpdate<"students">): Promise<Tables<"students">> {
    const { data, error } = await this.supabase
      .from("students")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update student: ${error.message}`);
    }

    return data;
  }

  async deleteStudent(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("students")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete student: ${error.message}`);
    }
  }

  async getStudentsByGrade(grade: number): Promise<Tables<"students">[]> {
    const { data, error } = await this.supabase
      .from("students")
      .select("*")
      .eq("grade", grade)
      .order("name");

    if (error) {
      throw new Error(`Failed to fetch students by grade: ${error.message}`);
    }

    return data || [];
  }

  async searchStudents(searchTerm: string): Promise<Tables<"students">[]> {
    const { data, error } = await this.supabase
      .from("students")
      .select("*")
      .or(`name.ilike.%${searchTerm}%, email.ilike.%${searchTerm}%, phone.ilike.%${searchTerm}%`)
      .order("name");

    if (error) {
      throw new Error(`Failed to search students: ${error.message}`);
    }

    return data || [];
  }
}