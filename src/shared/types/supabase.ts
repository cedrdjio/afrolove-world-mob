// Auto-generated from the live Supabase schema via `mcp__Supabase__generate_typescript_types`.
// Regenerate after every migration under supabase/migrations/ — do not hand-edit.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      education_levels: {
        Row: {
          id: string;
          is_active: boolean;
          key: string;
          label: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          is_active?: boolean;
          key: string;
          label: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          is_active?: boolean;
          key?: string;
          label?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      interests: {
        Row: {
          icon: string | null;
          id: string;
          is_active: boolean;
          key: string;
          label: string;
          sort_order: number;
        };
        Insert: {
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          key: string;
          label: string;
          sort_order?: number;
        };
        Update: {
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          key?: string;
          label?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      kyc_submissions: {
        Row: {
          doc_type: string;
          id: string;
          id_back_path: string | null;
          id_front_path: string;
          profile_id: string;
          rejection_reason: string | null;
          reviewed_at: string | null;
          selfie_path: string;
          status: string;
          submitted_at: string;
        };
        Insert: {
          doc_type: string;
          id?: string;
          id_back_path?: string | null;
          id_front_path: string;
          profile_id: string;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          selfie_path: string;
          status?: string;
          submitted_at?: string;
        };
        Update: {
          doc_type?: string;
          id?: string;
          id_back_path?: string | null;
          id_front_path?: string;
          profile_id?: string;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          selfie_path?: string;
          status?: string;
          submitted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'kyc_submissions_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      languages: {
        Row: {
          id: string;
          is_active: boolean;
          key: string;
          label: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          is_active?: boolean;
          key: string;
          label: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          is_active?: boolean;
          key?: string;
          label?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          created_at: string;
          id: string;
          profile_a: string;
          profile_b: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          profile_a: string;
          profile_b: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          profile_a?: string;
          profile_b?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'matches_profile_a_fkey';
            columns: ['profile_a'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_profile_b_fkey';
            columns: ['profile_b'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profile_interests: {
        Row: {
          interest_id: string;
          profile_id: string;
        };
        Insert: {
          interest_id: string;
          profile_id: string;
        };
        Update: {
          interest_id?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profile_interests_interest_id_fkey';
            columns: ['interest_id'];
            isOneToOne: false;
            referencedRelation: 'interests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profile_interests_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profile_languages: {
        Row: {
          language_id: string;
          profile_id: string;
        };
        Insert: {
          language_id: string;
          profile_id: string;
        };
        Update: {
          language_id?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profile_languages_language_id_fkey';
            columns: ['language_id'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profile_languages_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profile_photos: {
        Row: {
          created_at: string;
          id: string;
          is_primary: boolean;
          position: number;
          profile_id: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          position?: number;
          profile_id: string;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          position?: number;
          profile_id?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profile_photos_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          birth_date: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          drinking: string | null;
          education_level_id: string | null;
          email: string | null;
          first_name: string | null;
          gender: string | null;
          gym_habit: string | null;
          has_pets: string | null;
          height_cm: number | null;
          id: string;
          is_verified: boolean;
          last_active_at: string;
          last_name: string | null;
          latitude: number | null;
          location: unknown;
          location_updated_at: string | null;
          longitude: number | null;
          looking_for: string | null;
          onboarding_completed: boolean;
          profession: string | null;
          profile_completed: boolean;
          relationship_goal_id: string | null;
          religion_id: string | null;
          smoking: string | null;
          updated_at: string;
          wants_children: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          birth_date?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          drinking?: string | null;
          education_level_id?: string | null;
          email?: string | null;
          first_name?: string | null;
          gender?: string | null;
          gym_habit?: string | null;
          has_pets?: string | null;
          height_cm?: number | null;
          id: string;
          is_verified?: boolean;
          last_active_at?: string;
          last_name?: string | null;
          latitude?: number | null;
          location?: unknown;
          location_updated_at?: string | null;
          longitude?: number | null;
          looking_for?: string | null;
          onboarding_completed?: boolean;
          profession?: string | null;
          profile_completed?: boolean;
          relationship_goal_id?: string | null;
          religion_id?: string | null;
          smoking?: string | null;
          updated_at?: string;
          wants_children?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          birth_date?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          drinking?: string | null;
          education_level_id?: string | null;
          email?: string | null;
          first_name?: string | null;
          gender?: string | null;
          gym_habit?: string | null;
          has_pets?: string | null;
          height_cm?: number | null;
          id?: string;
          is_verified?: boolean;
          last_active_at?: string;
          last_name?: string | null;
          latitude?: number | null;
          location?: unknown;
          location_updated_at?: string | null;
          longitude?: number | null;
          looking_for?: string | null;
          onboarding_completed?: boolean;
          profession?: string | null;
          profile_completed?: boolean;
          relationship_goal_id?: string | null;
          religion_id?: string | null;
          smoking?: string | null;
          updated_at?: string;
          wants_children?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_education_level_id_fkey';
            columns: ['education_level_id'];
            isOneToOne: false;
            referencedRelation: 'education_levels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_relationship_goal_id_fkey';
            columns: ['relationship_goal_id'];
            isOneToOne: false;
            referencedRelation: 'relationship_goals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_religion_id_fkey';
            columns: ['religion_id'];
            isOneToOne: false;
            referencedRelation: 'religions';
            referencedColumns: ['id'];
          },
        ];
      };
      relationship_goals: {
        Row: {
          id: string;
          is_active: boolean;
          key: string;
          label: string;
          sort_order: number;
          subtitle: string | null;
        };
        Insert: {
          id?: string;
          is_active?: boolean;
          key: string;
          label: string;
          sort_order?: number;
          subtitle?: string | null;
        };
        Update: {
          id?: string;
          is_active?: boolean;
          key?: string;
          label?: string;
          sort_order?: number;
          subtitle?: string | null;
        };
        Relationships: [];
      };
      religions: {
        Row: {
          id: string;
          is_active: boolean;
          key: string;
          label: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          is_active?: boolean;
          key: string;
          label: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          is_active?: boolean;
          key?: string;
          label?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      swipes: {
        Row: {
          action: string;
          created_at: string;
          id: string;
          swiper_id: string;
          target_id: string;
          updated_at: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: string;
          swiper_id: string;
          target_id: string;
          updated_at?: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: string;
          swiper_id?: string;
          target_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'swipes_swiper_id_fkey';
            columns: ['swiper_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'swipes_target_id_fkey';
            columns: ['target_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_my_profile_stats: {
        Args: never;
        Returns: {
          likes_received: number;
          match_rate: number;
          matches_count: number;
        }[];
      };
      get_public_profile: {
        Args: { p_profile_id: string };
        Returns: {
          age: number;
          avatar_url: string;
          bio: string;
          city: string;
          country: string;
          distance_km: number;
          first_name: string;
          gender: string;
          height_cm: number;
          id: string;
          interest_names: string[];
          is_verified: boolean;
          last_active_at: string;
          photo_urls: string[];
          profession: string;
        }[];
      };
      search_profiles: {
        Args: {
          p_age_max?: number;
          p_age_min?: number;
          p_limit?: number;
          p_max_distance_km?: number;
          p_new_only?: boolean;
          p_offset?: number;
          p_online_recently?: boolean;
          p_query?: string;
          p_verified_only?: boolean;
        };
        Returns: {
          age: number;
          avatar_url: string;
          bio: string;
          city: string;
          compatibility: number;
          country: string;
          created_at: string;
          distance_km: number;
          first_name: string;
          gender: string;
          id: string;
          interest_names: string[];
          is_verified: boolean;
          last_active_at: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
