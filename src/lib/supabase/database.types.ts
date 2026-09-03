export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      exercise_logs: {
        Row: {
          day_exercise_id: string
          done: boolean
          exercise_id: string
          id: string
          load_kg: number | null
          note: string | null
          reps: number | null
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          day_exercise_id: string
          done?: boolean
          exercise_id: string
          id?: string
          load_kg?: number | null
          note?: string | null
          reps?: number | null
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          day_exercise_id?: string
          done?: boolean
          exercise_id?: string
          id?: string
          load_kg?: number | null
          note?: string | null
          reps?: number | null
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'exercise_logs_day_exercise_id_fkey'
            columns: ['day_exercise_id']
            isOneToOne: false
            referencedRelation: 'training_day_exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exercise_logs_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exercise_logs_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'workout_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      exercises: {
        Row: {
          cue: string | null
          equipment: string
          id: string
          media_end_path: string | null
          media_start_path: string | null
          name: string
          primary_muscle: string
          slug: string
        }
        Insert: {
          cue?: string | null
          equipment: string
          id?: string
          media_end_path?: string | null
          media_start_path?: string | null
          name: string
          primary_muscle: string
          slug: string
        }
        Update: {
          cue?: string | null
          equipment?: string
          id?: string
          media_end_path?: string | null
          media_start_path?: string | null
          name?: string
          primary_muscle?: string
          slug?: string
        }
        Relationships: []
      }
      meal_items: {
        Row: {
          amount: string
          id: string
          name: string
          note: string | null
          option_id: string
          position: number
        }
        Insert: {
          amount: string
          id?: string
          name: string
          note?: string | null
          option_id: string
          position: number
        }
        Update: {
          amount?: string
          id?: string
          name?: string
          note?: string | null
          option_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: 'meal_items_option_id_fkey'
            columns: ['option_id']
            isOneToOne: false
            referencedRelation: 'meal_options'
            referencedColumns: ['id']
          },
        ]
      }
      meal_options: {
        Row: {
          id: string
          label: string | null
          meal_id: string
          note: string | null
          position: number
        }
        Insert: {
          id?: string
          label?: string | null
          meal_id: string
          note?: string | null
          position: number
        }
        Update: {
          id?: string
          label?: string | null
          meal_id?: string
          note?: string | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: 'meal_options_meal_id_fkey'
            columns: ['meal_id']
            isOneToOne: false
            referencedRelation: 'meals'
            referencedColumns: ['id']
          },
        ]
      }
      meal_plans: {
        Row: {
          carb_g: number
          created_at: string
          fat_g: number
          id: string
          is_active: boolean
          kcal_target: number
          name: string
          protein_g: number
          protein_min_g: number | null
          user_id: string
          water_max_l: number | null
          water_min_l: number
        }
        Insert: {
          carb_g: number
          created_at?: string
          fat_g: number
          id?: string
          is_active?: boolean
          kcal_target: number
          name: string
          protein_g: number
          protein_min_g?: number | null
          user_id: string
          water_max_l?: number | null
          water_min_l: number
        }
        Update: {
          carb_g?: number
          created_at?: string
          fat_g?: number
          id?: string
          is_active?: boolean
          kcal_target?: number
          name?: string
          protein_g?: number
          protein_min_g?: number | null
          user_id?: string
          water_max_l?: number | null
          water_min_l?: number
        }
        Relationships: []
      }
      meals: {
        Row: {
          id: string
          kcal: number | null
          name: string
          note: string | null
          plan_id: string
          position: number
          protein_g: number | null
          time_evening: string
          time_fasted: string
        }
        Insert: {
          id?: string
          kcal?: number | null
          name: string
          note?: string | null
          plan_id: string
          position: number
          protein_g?: number | null
          time_evening: string
          time_fasted: string
        }
        Update: {
          id?: string
          kcal?: number | null
          name?: string
          note?: string | null
          plan_id?: string
          position?: number
          protein_g?: number | null
          time_evening?: string
          time_fasted?: string
        }
        Relationships: [
          {
            foreignKeyName: 'meals_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'meal_plans'
            referencedColumns: ['id']
          },
        ]
      }
      plan_notes: {
        Row: {
          body: string
          id: string
          kind: string
          plan_id: string
          position: number
          title: string
        }
        Insert: {
          body: string
          id?: string
          kind: string
          plan_id: string
          position: number
          title: string
        }
        Update: {
          body?: string
          id?: string
          kind?: string
          plan_id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'plan_notes_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'meal_plans'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          birth_date: string | null
          created_at: string
          default_meal_schedule: Database['public']['Enums']['meal_schedule']
          display_name: string
          height_cm: number | null
          id: string
          level: Database['public']['Enums']['training_level']
          theme: string
          time_zone: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          default_meal_schedule?: Database['public']['Enums']['meal_schedule']
          display_name: string
          height_cm?: number | null
          id: string
          level?: Database['public']['Enums']['training_level']
          theme?: string
          time_zone?: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          default_meal_schedule?: Database['public']['Enums']['meal_schedule']
          display_name?: string
          height_cm?: number | null
          id?: string
          level?: Database['public']['Enums']['training_level']
          theme?: string
          time_zone?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_blocks: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          started_on: string
          total_weeks: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          started_on: string
          total_weeks?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          started_on?: string
          total_weeks?: number
          user_id?: string
        }
        Relationships: []
      }
      training_day_exercises: {
        Row: {
          day_id: string
          exercise_partnered_id: string
          exercise_solo_id: string | null
          id: string
          note: string | null
          position: number
          reps: string
          rest_seconds: number | null
          sets: number
          skip_on_deload: boolean
          strength_reps: string | null
          strength_sets: number | null
        }
        Insert: {
          day_id: string
          exercise_partnered_id: string
          exercise_solo_id?: string | null
          id?: string
          note?: string | null
          position: number
          reps: string
          rest_seconds?: number | null
          sets: number
          skip_on_deload?: boolean
          strength_reps?: string | null
          strength_sets?: number | null
        }
        Update: {
          day_id?: string
          exercise_partnered_id?: string
          exercise_solo_id?: string | null
          id?: string
          note?: string | null
          position?: number
          reps?: string
          rest_seconds?: number | null
          sets?: number
          skip_on_deload?: boolean
          strength_reps?: string | null
          strength_sets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'training_day_exercises_day_id_fkey'
            columns: ['day_id']
            isOneToOne: false
            referencedRelation: 'training_days'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'training_day_exercises_exercise_partnered_id_fkey'
            columns: ['exercise_partnered_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'training_day_exercises_exercise_solo_id_fkey'
            columns: ['exercise_solo_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
        ]
      }
      training_days: {
        Row: {
          block_id: string
          duration_minutes: number | null
          focus: string | null
          id: string
          title: string
          weekday: number
        }
        Insert: {
          block_id: string
          duration_minutes?: number | null
          focus?: string | null
          id?: string
          title: string
          weekday: number
        }
        Update: {
          block_id?: string
          duration_minutes?: number | null
          focus?: string | null
          id?: string
          title?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: 'training_days_block_id_fkey'
            columns: ['block_id']
            isOneToOne: false
            referencedRelation: 'training_blocks'
            referencedColumns: ['id']
          },
        ]
      }
      workout_sessions: {
        Row: {
          day_id: string
          ended_at: string | null
          id: string
          local_date: string
          mode: string
          started_at: string
          user_id: string
          week_number: number | null
        }
        Insert: {
          day_id: string
          ended_at?: string | null
          id?: string
          local_date: string
          mode?: string
          started_at?: string
          user_id: string
          week_number?: number | null
        }
        Update: {
          day_id?: string
          ended_at?: string | null
          id?: string
          local_date?: string
          mode?: string
          started_at?: string
          user_id?: string
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'workout_sessions_day_id_fkey'
            columns: ['day_id']
            isOneToOne: false
            referencedRelation: 'training_days'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      meal_schedule: 'manha_jejum' | 'tarde_noite'
      training_level: 'iniciante' | 'intermediario' | 'avancado'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      meal_schedule: ['manha_jejum', 'tarde_noite'],
      training_level: ['iniciante', 'intermediario', 'avancado'],
    },
  },
} as const
