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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          id: string
          meta: Json
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          id?: string
          meta?: Json
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          id?: string
          meta?: Json
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      admin_broadcasts: {
        Row: {
          audience: Json
          body: string
          created_at: string
          created_by: string | null
          id: string
          recipients_count: number
          scheduled_for: string | null
          sent_at: string | null
          status: string
          title: string
        }
        Insert: {
          audience?: Json
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          recipients_count?: number
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          title: string
        }
        Update: {
          audience?: Json
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          recipients_count?: number
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      admin_invites: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          invited_by: string | null
          role: Database["public"]["Enums"]["admin_role"]
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          display_name: string | null
          is_active: boolean
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_warnings: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          message: string
          profile_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          message: string
          profile_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          message?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_warnings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country_key: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          country_key?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          country_key?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_key_fkey"
            columns: ["country_key"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["key"]
          },
        ]
      }
      client_logs: {
        Row: {
          context: Json | null
          created_at: string
          event: string
          id: string
          level: string
          message: string | null
          profile_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          event: string
          id?: string
          level?: string
          message?: string | null
          profile_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          event?: string
          id?: string
          level?: string
          message?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          emoji: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          emoji?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          emoji?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_percent: number
          is_active: boolean
          max_redemptions: number | null
          plan_key: string | null
          redeemed_count: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_percent: number
          is_active?: boolean
          max_redemptions?: number | null
          plan_key?: string | null
          redeemed_count?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_percent?: number
          is_active?: boolean
          max_redemptions?: number | null
          plan_key?: string | null
          redeemed_count?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_plan_key_fkey"
            columns: ["plan_key"]
            isOneToOne: false
            referencedRelation: "premium_plans"
            referencedColumns: ["key"]
          },
        ]
      }
      education_levels: {
        Row: {
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      interests: {
        Row: {
          icon: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          icon?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          icon?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      kyc_submissions: {
        Row: {
          doc_type: string
          id: string
          id_back_path: string | null
          id_front_path: string
          profile_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          selfie_path: string
          status: string
          submitted_at: string
        }
        Insert: {
          doc_type: string
          id?: string
          id_back_path?: string | null
          id_front_path: string
          profile_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_path: string
          status?: string
          submitted_at?: string
        }
        Update: {
          doc_type?: string
          id?: string
          id_back_path?: string | null
          id_front_path?: string
          profile_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_path?: string
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_submissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          content: string
          key: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          content: string
          key: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          content?: string
          key?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      lifestyle_options: {
        Row: {
          category: string
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          value: string | null
        }
        Insert: {
          category: string
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          value?: string | null
        }
        Update: {
          category?: string
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          value?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          profile_a: string
          profile_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_a: string
          profile_b: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_a?: string
          profile_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_profile_a_fkey"
            columns: ["profile_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_profile_b_fkey"
            columns: ["profile_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          channel: string
          id: string
          is_active: boolean
          key: string
          name: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          body: string
          channel: string
          id?: string
          is_active?: boolean
          key: string
          name: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          channel?: string
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: string
          profile_id: string
          read_at: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          profile_id: string
          read_at?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          profile_id?: string
          read_at?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      occupations: {
        Row: {
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          amount_source_cents: number | null
          created_at: string
          currency: string
          id: string
          invoice_id: string
          paid_at: string | null
          payment_method: string | null
          plan_key: string
          profile_id: string
          provider: string
          provider_tx_id: string | null
          provider_uuid: string | null
          raw: Json | null
          status: string
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          amount_source_cents?: number | null
          created_at?: string
          currency?: string
          id?: string
          invoice_id: string
          paid_at?: string | null
          payment_method?: string | null
          plan_key: string
          profile_id: string
          provider?: string
          provider_tx_id?: string | null
          provider_uuid?: string | null
          raw?: Json | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_source_cents?: number | null
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string
          paid_at?: string | null
          payment_method?: string | null
          plan_key?: string
          profile_id?: string
          provider?: string
          provider_tx_id?: string | null
          provider_uuid?: string | null
          raw?: Json | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_plan_key_fkey"
            columns: ["plan_key"]
            isOneToOne: false
            referencedRelation: "premium_plans"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "payment_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_plans: {
        Row: {
          currency: string
          description: string | null
          duration_days: number
          is_active: boolean
          key: string
          label: string
          price_cents: number
          provider_product_ids: Json
          sort_order: number
        }
        Insert: {
          currency?: string
          description?: string | null
          duration_days: number
          is_active?: boolean
          key: string
          label: string
          price_cents: number
          provider_product_ids?: Json
          sort_order?: number
        }
        Update: {
          currency?: string
          description?: string | null
          duration_days?: number
          is_active?: boolean
          key?: string
          label?: string
          price_cents?: number
          provider_product_ids?: Json
          sort_order?: number
        }
        Relationships: []
      }
      profile_favorites: {
        Row: {
          created_at: string
          profile_id: string
          target_id: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          target_id: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_favorites_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_interests: {
        Row: {
          interest_id: string
          profile_id: string
        }
        Insert: {
          interest_id: string
          profile_id: string
        }
        Update: {
          interest_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_languages: {
        Row: {
          language_id: string
          profile_id: string
        }
        Insert: {
          language_id: string
          profile_id: string
        }
        Update: {
          language_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_languages_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_languages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_photos: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          moderation_status: string
          position: number
          profile_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          moderation_status?: string
          position?: number
          profile_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          moderation_status?: string
          position?: number
          profile_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          target_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          target_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          target_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string
          drinking: string | null
          education_level_id: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          gym_habit: string | null
          has_pets: string | null
          height_cm: number | null
          id: string
          is_verified: boolean
          last_active_at: string
          last_name: string | null
          latitude: number | null
          location: unknown
          location_updated_at: string | null
          longitude: number | null
          looking_for: string | null
          notification_prefs: Json
          onboarding_completed: boolean
          privacy_prefs: Json
          profession: string | null
          profile_completed: boolean
          relationship_goal_id: string | null
          religion_id: string | null
          smoking: string | null
          status_changed_at: string | null
          status_reason: string | null
          suspended_until: string | null
          updated_at: string
          wants_children: string | null
        }
        Insert: {
          account_status?: string
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          drinking?: string | null
          education_level_id?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          gym_habit?: string | null
          has_pets?: string | null
          height_cm?: number | null
          id: string
          is_verified?: boolean
          last_active_at?: string
          last_name?: string | null
          latitude?: number | null
          location?: unknown
          location_updated_at?: string | null
          longitude?: number | null
          looking_for?: string | null
          notification_prefs?: Json
          onboarding_completed?: boolean
          privacy_prefs?: Json
          profession?: string | null
          profile_completed?: boolean
          relationship_goal_id?: string | null
          religion_id?: string | null
          smoking?: string | null
          status_changed_at?: string | null
          status_reason?: string | null
          suspended_until?: string | null
          updated_at?: string
          wants_children?: string | null
        }
        Update: {
          account_status?: string
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          drinking?: string | null
          education_level_id?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          gym_habit?: string | null
          has_pets?: string | null
          height_cm?: number | null
          id?: string
          is_verified?: boolean
          last_active_at?: string
          last_name?: string | null
          latitude?: number | null
          location?: unknown
          location_updated_at?: string | null
          longitude?: number | null
          looking_for?: string | null
          notification_prefs?: Json
          onboarding_completed?: boolean
          privacy_prefs?: Json
          profession?: string | null
          profile_completed?: boolean
          relationship_goal_id?: string | null
          religion_id?: string | null
          smoking?: string | null
          status_changed_at?: string | null
          status_reason?: string | null
          suspended_until?: string | null
          updated_at?: string
          wants_children?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_education_level_id_fkey"
            columns: ["education_level_id"]
            isOneToOne: false
            referencedRelation: "education_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_relationship_goal_id_fkey"
            columns: ["relationship_goal_id"]
            isOneToOne: false
            referencedRelation: "relationship_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_religion_id_fkey"
            columns: ["religion_id"]
            isOneToOne: false
            referencedRelation: "religions"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          platform: string | null
          profile_id: string
          token: string
          updated_at: string
        }
        Insert: {
          platform?: string | null
          profile_id: string
          token: string
          updated_at?: string
        }
        Update: {
          platform?: string | null
          profile_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_goals: {
        Row: {
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          subtitle: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          subtitle?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          subtitle?: string | null
        }
        Relationships: []
      }
      religions: {
        Row: {
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          reviewed_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          reviewed_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan_key: string
          profile_id: string
          provider: string
          provider_ref: string | null
          starts_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_key: string
          profile_id: string
          provider?: string
          provider_ref?: string | null
          starts_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_key?: string
          profile_id?: string
          provider?: string
          provider_ref?: string | null
          starts_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_key_fkey"
            columns: ["plan_key"]
            isOneToOne: false
            referencedRelation: "premium_plans"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          is_from_member: boolean
          is_internal: boolean
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_from_member?: boolean
          is_internal?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_from_member?: boolean
          is_internal?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          id: string
          priority: string
          profile_id: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          priority?: string
          profile_id?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          priority?: string
          profile_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          action: string
          created_at: string
          id: string
          swiper_id: string
          target_id: string
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          swiper_id: string
          target_id: string
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          swiper_id?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_favorite: { Args: { p_target_id: string }; Returns: undefined }
      admin_analytics: { Args: { p_days?: number }; Returns: Json }
      admin_audience_count: { Args: { p_audience: Json }; Returns: number }
      admin_audience_profiles: {
        Args: { p_audience: Json }
        Returns: {
          profile_id: string
        }[]
      }
      admin_audit_list: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_target_type?: string
        }
        Returns: Json
      }
      admin_cancel_broadcast: { Args: { p_id: string }; Returns: undefined }
      admin_cancel_invite: { Args: { p_email: string }; Returns: undefined }
      admin_cancel_subscription: {
        Args: { p_refund?: boolean; p_subscription_id: string }
        Returns: undefined
      }
      admin_catalog_allowed: { Args: { p_catalog: string }; Returns: boolean }
      admin_catalog_delete: {
        Args: { p_catalog: string; p_id: string }
        Returns: undefined
      }
      admin_catalog_list: { Args: { p_catalog: string }; Returns: Json }
      admin_catalog_upsert: {
        Args: { p_catalog: string; p_row: Json }
        Returns: undefined
      }
      admin_conversation_messages: {
        Args: { p_limit?: number; p_match_id: string }
        Returns: Json
      }
      admin_dashboard_charts: { Args: { p_days?: number }; Returns: Json }
      admin_dashboard_stats: { Args: never; Returns: Json }
      admin_delete_coupon: { Args: { p_code: string }; Returns: undefined }
      admin_delete_user: { Args: { p_user_id: string }; Returns: undefined }
      admin_get_settings: { Args: never; Returns: Json }
      admin_get_ticket: { Args: { p_ticket_id: string }; Returns: Json }
      admin_get_user_details: { Args: { p_user_id: string }; Returns: Json }
      admin_grant_role: {
        Args: {
          p_display_name?: string
          p_email: string
          p_role: Database["public"]["Enums"]["admin_role"]
        }
        Returns: undefined
      }
      admin_grant_subscription: {
        Args: { p_plan_key: string; p_user_id: string }
        Returns: string
      }
      admin_list_admins: { Args: never; Returns: Json }
      admin_list_coupons: { Args: never; Returns: Json }
      admin_list_kyc: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_status?: string
        }
        Returns: Json
      }
      admin_list_photos: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_status?: string
        }
        Returns: Json
      }
      admin_list_reports: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_status?: string
        }
        Returns: Json
      }
      admin_list_subscriptions: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_status?: string
        }
        Returns: Json
      }
      admin_list_templates: { Args: never; Returns: Json }
      admin_list_tickets: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_status?: string
        }
        Returns: Json
      }
      admin_list_users: {
        Args: {
          p_gender?: string
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_status?: string
          p_verified?: boolean
        }
        Returns: Json
      }
      admin_login_logs: { Args: { p_limit?: number }; Returns: Json }
      admin_moderate_photo: {
        Args: { p_action: string; p_note?: string; p_photo_id: string }
        Returns: undefined
      }
      admin_moderation_stats: { Args: never; Returns: Json }
      admin_notification_history: { Args: { p_limit?: number }; Returns: Json }
      admin_premium_stats: { Args: never; Returns: Json }
      admin_recent_activity: {
        Args: { p_limit?: number }
        Returns: {
          detail: string
          happened_at: string
          kind: string
          label: string
        }[]
      }
      admin_reply_ticket: {
        Args: { p_body: string; p_internal?: boolean; p_ticket_id: string }
        Returns: undefined
      }
      admin_review_kyc: {
        Args: { p_ids: string[]; p_reason?: string; p_status: string }
        Returns: number
      }
      admin_review_reports: {
        Args: { p_ids: string[]; p_status: string }
        Returns: number
      }
      admin_revoke_role: { Args: { p_user_id: string }; Returns: undefined }
      admin_role_level: { Args: never; Returns: number }
      admin_search_profiles: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          account_status: string
          avatar_url: string
          city: string
          country: string
          email: string
          first_name: string
          id: string
          is_verified: boolean
          last_name: string
        }[]
      }
      admin_send_notification: {
        Args: {
          p_audience?: Json
          p_body: string
          p_scheduled_for?: string
          p_title: string
        }
        Returns: Json
      }
      admin_set_account_status: {
        Args: { p_reason?: string; p_status: string; p_user_id: string }
        Returns: undefined
      }
      admin_set_admin_active: {
        Args: { p_active: boolean; p_user_id: string }
        Returns: undefined
      }
      admin_set_profile_verified: {
        Args: { p_user_id: string; p_verified: boolean }
        Returns: undefined
      }
      admin_temp_ban: {
        Args: { p_days: number; p_reason: string; p_user_id: string }
        Returns: undefined
      }
      admin_update_profile: {
        Args: { p_patch: Json; p_user_id: string }
        Returns: Json
      }
      admin_update_setting: {
        Args: { p_key: string; p_value: Json }
        Returns: undefined
      }
      admin_update_ticket: {
        Args: { p_patch: Json; p_ticket_id: string }
        Returns: undefined
      }
      admin_upsert_coupon: {
        Args: { p_code: string; p_patch: Json }
        Returns: undefined
      }
      admin_upsert_plan: {
        Args: { p_key: string; p_patch: Json }
        Returns: undefined
      }
      admin_upsert_template: {
        Args: { p_id: string; p_patch: Json }
        Returns: undefined
      }
      admin_verify_email: { Args: { p_user_id: string }; Returns: undefined }
      admin_warn_user: {
        Args: { p_message: string; p_user_id: string }
        Returns: undefined
      }
      count_search_profiles: {
        Args: {
          p_age_max?: number
          p_age_min?: number
          p_interest_ids?: string[]
          p_max_distance_km?: number
          p_verified_only?: boolean
        }
        Returns: number
      }
      fail_camerpay_payment: {
        Args: { p_provider_uuid: string; p_raw?: Json; p_status: string }
        Returns: undefined
      }
      get_app_secret: { Args: { p_name: string }; Returns: string }
      get_client_logs: {
        Args: { p_level?: string; p_limit?: number }
        Returns: {
          context: Json | null
          created_at: string
          event: string
          id: string
          level: string
          message: string | null
          profile_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "client_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_my_blocked_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          blocked_at: string
          blocked_id: string
          first_name: string
        }[]
      }
      get_my_conversations: {
        Args: never
        Returns: {
          last_message: string
          last_message_at: string
          last_message_sender_id: string
          match_id: string
          matched_at: string
          partner_avatar_url: string
          partner_first_name: string
          partner_id: string
          partner_is_verified: boolean
          partner_last_active_at: string
          unread_count: number
        }[]
      }
      get_my_entitlements: {
        Args: never
        Returns: {
          favorites_count: number
          favorites_limit: number
          is_premium: boolean
          likers_count: number
          likes_limit: number
          likes_used_today: number
          plan_label: string
          premium_until: string
          super_likes_limit: number
          super_likes_used_today: number
          swipes_limit: number
          swipes_used_today: number
        }[]
      }
      get_my_favorite_ids: {
        Args: never
        Returns: {
          target_id: string
        }[]
      }
      get_my_favorites: {
        Args: never
        Returns: {
          action: string
          avatar_url: string
          city: string
          first_name: string
          is_matched: boolean
          is_verified: boolean
          liked_at: string
          profile_id: string
        }[]
      }
      get_my_likers: {
        Args: never
        Returns: {
          action: string
          avatar_url: string
          city: string
          first_name: string
          is_verified: boolean
          liked_at: string
          profile_id: string
        }[]
      }
      get_my_profile_stats: {
        Args: never
        Returns: {
          likes_received: number
          match_rate: number
          matches_count: number
          views_count: number
        }[]
      }
      get_public_profile: {
        Args: { p_profile_id: string }
        Returns: {
          age: number
          avatar_url: string
          bio: string
          city: string
          country: string
          distance_km: number
          drinking: string
          education_level_id: string
          first_name: string
          gender: string
          gym_habit: string
          has_pets: string
          height_cm: number
          id: string
          interest_ids: string[]
          is_verified: boolean
          language_ids: string[]
          last_active_at: string
          photo_urls: string[]
          profession: string
          religion_id: string
          smoking: string
          wants_children: string
        }[]
      }
      get_saved_favorites: {
        Args: never
        Returns: {
          avatar_url: string
          city: string
          first_name: string
          is_verified: boolean
          profile_id: string
          saved_at: string
        }[]
      }
      grant_subscription: {
        Args: {
          p_plan_key: string
          p_profile_id: string
          p_provider: string
          p_provider_ref?: string
        }
        Returns: string
      }
      has_active_premium: { Args: { p_profile_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_blocked_between: { Args: { a: string; b: string }; Returns: boolean }
      mark_messages_read: { Args: { p_match_id: string }; Returns: undefined }
      privacy_pref: { Args: { k: string; p: Json }; Returns: boolean }
      purchase_subscription_dev: {
        Args: { p_plan_key: string }
        Returns: {
          premium_until: string
          subscription_id: string
        }[]
      }
      record_profile_view: {
        Args: { p_profile_id: string }
        Returns: undefined
      }
      remove_favorite: { Args: { p_target_id: string }; Returns: undefined }
      search_profiles: {
        Args: {
          p_age_max?: number
          p_age_min?: number
          p_interest_ids?: string[]
          p_limit?: number
          p_max_distance_km?: number
          p_new_only?: boolean
          p_offset?: number
          p_online_recently?: boolean
          p_query?: string
          p_verified_only?: boolean
        }
        Returns: {
          age: number
          avatar_url: string
          bio: string
          city: string
          compatibility: number
          country: string
          created_at: string
          distance_km: number
          first_name: string
          gender: string
          id: string
          interest_names: string[]
          is_verified: boolean
          last_active_at: string
        }[]
      }
      settle_camerpay_payment: {
        Args: {
          p_amount: number
          p_paid_at?: string
          p_payment_method?: string
          p_provider_tx_id?: string
          p_provider_uuid: string
          p_raw?: Json
        }
        Returns: string
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "moderator" | "support" | "viewer"
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
      admin_role: ["super_admin", "admin", "moderator", "support", "viewer"],
    },
  },
} as const
