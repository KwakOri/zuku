export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      assistants: {
        Row: {
          assigned_grades: number[];
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          subjects: string[];
          teacher_id: string | null;
          user_id: string | null;
        };
        Insert: {
          assigned_grades: number[];
          email?: string | null;
          id: string;
          name: string;
          phone?: string | null;
          subjects: string[];
          teacher_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          assigned_grades?: number[];
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          subjects?: string[];
          teacher_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "assistants_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "teachers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assistants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      class_exceptions: {
        Row: {
          class_id: string;
          date: string;
          id: string;
          new_end_time: string | null;
          new_room: string | null;
          new_start_time: string | null;
          reason: string | null;
          substitute_teacher_id: string | null;
          type: string;
        };
        Insert: {
          class_id: string;
          date: string;
          id: string;
          new_end_time?: string | null;
          new_room?: string | null;
          new_start_time?: string | null;
          reason?: string | null;
          substitute_teacher_id?: string | null;
          type: string;
        };
        Update: {
          class_id?: string;
          date?: string;
          id?: string;
          new_end_time?: string | null;
          new_room?: string | null;
          new_start_time?: string | null;
          reason?: string | null;
          substitute_teacher_id?: string | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_exceptions_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_exceptions_substitute_teacher_id_fkey";
            columns: ["substitute_teacher_id"];
            isOneToOne: false;
            referencedRelation: "teachers";
            referencedColumns: ["id"];
          }
        ];
      };
      class_students: {
        Row: {
          class_id: string;
          enrolled_date: string;
          id: string;
          status: string;
          student_id: number;
        };
        Insert: {
          class_id: string;
          enrolled_date: string;
          id: string;
          status: string;
          student_id: number;
        };
        Update: {
          class_id?: string;
          enrolled_date?: string;
          id?: string;
          status?: string;
          student_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_students_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          }
        ];
      };
      classes: {
        Row: {
          color: string;
          day_of_week: number;
          description: string | null;
          end_time: string;
          id: string;
          max_students: number | null;
          room: string | null;
          rrule: string | null;
          start_time: string;
          subject: string;
          teacher_id: string | null;
          teacher_name: string;
          title: string;
        };
        Insert: {
          color: string;
          day_of_week: number;
          description?: string | null;
          end_time: string;
          id: string;
          max_students?: number | null;
          room?: string | null;
          rrule?: string | null;
          start_time: string;
          subject: string;
          teacher_id?: string | null;
          teacher_name: string;
          title: string;
        };
        Update: {
          color?: string;
          day_of_week?: number;
          description?: string | null;
          end_time?: string;
          id?: string;
          max_students?: number | null;
          room?: string | null;
          rrule?: string | null;
          start_time?: string;
          subject?: string;
          teacher_id?: string | null;
          teacher_name?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "teachers";
            referencedColumns: ["id"];
          }
        ];
      };
      high_school_homework_records: {
        Row: {
          accuracy: number;
          achievement: string;
          assistant_id: string;
          class_id: string;
          completion_rate: number;
          created_date: string;
          date: string;
          homework_range: string;
          id: string;
          notes: string | null;
          student_id: number;
        };
        Insert: {
          accuracy: number;
          achievement: string;
          assistant_id: string;
          class_id: string;
          completion_rate: number;
          created_date: string;
          date: string;
          homework_range: string;
          id: string;
          notes?: string | null;
          student_id: number;
        };
        Update: {
          accuracy?: number;
          achievement?: string;
          assistant_id?: string;
          class_id?: string;
          completion_rate?: number;
          created_date?: string;
          date?: string;
          homework_range?: string;
          id?: string;
          notes?: string | null;
          student_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "high_school_homework_records_assistant_id_fkey";
            columns: ["assistant_id"];
            isOneToOne: false;
            referencedRelation: "assistants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "high_school_homework_records_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "high_school_homework_records_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          }
        ];
      };
      middle_school_records: {
        Row: {
          attendance: string;
          class_id: string;
          created_date: string;
          homework: string;
          id: string;
          last_modified: string;
          notes: string;
          participation: number;
          student_id: number;
          teacher_id: string;
          understanding: number;
          week_of: string;
        };
        Insert: {
          attendance: string;
          class_id: string;
          created_date: string;
          homework: string;
          id: string;
          last_modified: string;
          notes: string;
          participation: number;
          student_id: number;
          teacher_id: string;
          understanding: number;
          week_of: string;
        };
        Update: {
          attendance?: string;
          class_id?: string;
          created_date?: string;
          homework?: string;
          id?: string;
          last_modified?: string;
          notes?: string;
          participation?: number;
          student_id?: number;
          teacher_id?: string;
          understanding?: number;
          week_of?: string;
        };
        Relationships: [
          {
            foreignKeyName: "middle_school_records_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "middle_school_records_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "middle_school_records_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "teachers";
            referencedColumns: ["id"];
          }
        ];
      };
      signup_invitations: {
        Row: {
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          role: string;
          token: string;
          used_at: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          expires_at: string;
          id?: string;
          invited_by: string;
          role: string;
          token: string;
          used_at?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          role?: string;
          token?: string;
          used_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "signup_invitations_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      student_schedules: {
        Row: {
          color: string;
          created_date: string;
          day_of_week: number;
          description: string | null;
          end_time: string;
          id: string;
          location: string | null;
          recurring: boolean | null;
          rrule: string | null;
          start_time: string;
          status: string;
          student_id: number;
          title: string;
          type: string;
        };
        Insert: {
          color: string;
          created_date: string;
          day_of_week: number;
          description?: string | null;
          end_time: string;
          id: string;
          location?: string | null;
          recurring?: boolean | null;
          rrule?: string | null;
          start_time: string;
          status: string;
          student_id: number;
          title: string;
          type: string;
        };
        Update: {
          color?: string;
          created_date?: string;
          day_of_week?: number;
          description?: string | null;
          end_time?: string;
          id?: string;
          location?: string | null;
          recurring?: boolean | null;
          rrule?: string | null;
          start_time?: string;
          status?: string;
          student_id?: number;
          title?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_schedules_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          }
        ];
      };
      students: {
        Row: {
          email: string | null;
          grade: number;
          id: number;
          name: string;
          parent_phone: string | null;
          phone: string | null;
        };
        Insert: {
          email?: string | null;
          grade: number;
          id?: number;
          name: string;
          parent_phone?: string | null;
          phone?: string | null;
        };
        Update: {
          email?: string | null;
          grade?: number;
          id?: number;
          name?: string;
          parent_phone?: string | null;
          phone?: string | null;
        };
        Relationships: [];
      };
      teachers: {
        Row: {
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          subjects: string[];
          user_id: string | null;
        };
        Insert: {
          email?: string | null;
          id: string;
          name: string;
          phone?: string | null;
          subjects: string[];
          user_id?: string | null;
        };
        Update: {
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          subjects?: string[];
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "teachers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          is_active: boolean;
          name: string;
          password_hash: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          is_active?: boolean;
          name: string;
          password_hash: string;
          role: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          password_hash?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
