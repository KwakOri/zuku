export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assistant_subjects: {
        Row: {
          assistant_id: string
          created_at: string | null
          id: string
          subject_id: string
          updated_at: string | null
        }
        Insert: {
          assistant_id: string
          created_at?: string | null
          id?: string
          subject_id: string
          updated_at?: string | null
        }
        Update: {
          assistant_id?: string
          created_at?: string | null
          id?: string
          subject_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistant_subjects_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      assistants: {
        Row: {
          assigned_grades: number[]
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          password_hash: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_grades?: number[]
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          password_hash?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_grades?: number[]
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          password_hash?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_students: {
        Row: {
          backup_data: Json
          backup_date: string
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          student_count: number
        }
        Insert: {
          backup_data: Json
          backup_date?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          student_count: number
        }
        Update: {
          backup_data?: Json
          backup_date?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          student_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "backup_students_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      class_composition: {
        Row: {
          class_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          type: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          type: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_composition_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_exceptions: {
        Row: {
          class_id: string
          created_at: string | null
          date: string
          id: string
          new_end_time: string | null
          new_room: string | null
          new_start_time: string | null
          reason: string | null
          substitute_teacher_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          date: string
          id?: string
          new_end_time?: string | null
          new_room?: string | null
          new_start_time?: string | null
          reason?: string | null
          substitute_teacher_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          date?: string
          id?: string
          new_end_time?: string | null
          new_room?: string | null
          new_start_time?: string | null
          reason?: string | null
          substitute_teacher_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_exceptions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_exceptions_substitute_teacher_id_fkey"
            columns: ["substitute_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      class_students: {
        Row: {
          class_id: string
          created_at: string | null
          enrolled_date: string
          id: string
          status: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          enrolled_date?: string
          id?: string
          status?: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          enrolled_date?: string
          id?: string
          status?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          color: string
          course_type: string
          created_at: string | null
          description: string | null
          id: string
          max_students: number | null
          room: string | null
          rrule: string | null
          split_type: string | null
          subject_id: string | null
          teacher_id: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string
          course_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          max_students?: number | null
          room?: string | null
          rrule?: string | null
          split_type?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string
          course_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          max_students?: number | null
          room?: string | null
          rrule?: string | null
          split_type?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      compositions_students: {
        Row: {
          class_id: string | null
          composition_id: string
          created_at: string | null
          enrolled_date: string
          id: string
          status: string
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          composition_id: string
          created_at?: string | null
          enrolled_date?: string
          id?: string
          status?: string
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          composition_id?: string
          created_at?: string | null
          enrolled_date?: string
          id?: string
          status?: string
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compositions_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compositions_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_compositions_composition_id_fkey"
            columns: ["composition_id"]
            isOneToOne: false
            referencedRelation: "class_composition"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_records_high: {
        Row: {
          accuracy: number
          achievement: string
          assistant_id: string
          class_id: string
          completion_rate: number
          created_at: string | null
          created_date: string
          date: string
          homework_range: string
          id: string
          notes: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          accuracy: number
          achievement: string
          assistant_id: string
          class_id: string
          completion_rate: number
          created_at?: string | null
          created_date?: string
          date: string
          homework_range: string
          id?: string
          notes?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          accuracy?: number
          achievement?: string
          assistant_id?: string
          class_id?: string
          completion_rate?: number
          created_at?: string | null
          created_date?: string
          date?: string
          homework_range?: string
          id?: string
          notes?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homework_records_high_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_records_high_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_records_high_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_records_middle: {
        Row: {
          attendance: string
          class_id: string
          created_at: string | null
          created_date: string
          homework: string
          id: string
          last_modified: string
          notes: string
          participation: number
          student_id: string
          understanding: number
          updated_at: string | null
          week_of: string
        }
        Insert: {
          attendance: string
          class_id: string
          created_at?: string | null
          created_date?: string
          homework: string
          id?: string
          last_modified?: string
          notes?: string
          participation: number
          student_id: string
          understanding: number
          updated_at?: string | null
          week_of: string
        }
        Update: {
          attendance?: string
          class_id?: string
          created_at?: string | null
          created_date?: string
          homework?: string
          id?: string
          last_modified?: string
          notes?: string
          participation?: number
          student_id?: string
          understanding?: number
          updated_at?: string | null
          week_of?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_records_middle_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_records_middle_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string | null
          id: string
          level: Database["public"]["Enums"]["school_level"]
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: Database["public"]["Enums"]["school_level"]
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: Database["public"]["Enums"]["school_level"]
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      signup_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signup_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      student_schedules: {
        Row: {
          color: string
          created_at: string | null
          created_date: string
          day_of_week: number
          description: string | null
          end_time: string
          id: string
          location: string | null
          recurring: boolean | null
          rrule: string | null
          start_time: string
          status: string
          student_id: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          created_date?: string
          day_of_week: number
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          recurring?: boolean | null
          rrule?: string | null
          start_time: string
          status?: string
          student_id: string
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          created_date?: string
          day_of_week?: number
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          recurring?: boolean | null
          rrule?: string | null
          start_time?: string
          status?: string
          student_id?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_schedules_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          birth_date: string | null
          class_name: string | null
          created_at: string | null
          email: string | null
          enrollment_status: string | null
          gender: string | null
          grade: number
          id: string
          is_active: boolean | null
          name: string
          parent_phone: string | null
          password_hash: string | null
          phone: string | null
          school_id: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          class_name?: string | null
          created_at?: string | null
          email?: string | null
          enrollment_status?: string | null
          gender?: string | null
          grade: number
          id?: string
          is_active?: boolean | null
          name: string
          parent_phone?: string | null
          password_hash?: string | null
          phone?: string | null
          school_id?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          class_name?: string | null
          created_at?: string | null
          email?: string | null
          enrollment_status?: string | null
          gender?: string | null
          grade?: number
          id?: string
          is_active?: boolean | null
          name?: string
          parent_phone?: string | null
          password_hash?: string | null
          phone?: string | null
          school_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          id: string
          subject_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          subject_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          subject_name?: string | null
        }
        Relationships: []
      }
      teacher_subjects: {
        Row: {
          created_at: string | null
          id: string
          subject_id: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          subject_id: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          subject_id?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          password_hash: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          password_hash?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          password_hash?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          password_hash: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          password_hash: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          password_hash?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      school_level: "middle" | "high"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      school_level: ["middle", "high"],
    },
  },
} as const
