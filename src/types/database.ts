/* ============================================================================
   Supabase Database Types
   Auto-generated types matching the database schema
   ============================================================================ */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          type: 'government' | 'municipal' | 'agency' | 'other';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'government' | 'municipal' | 'agency' | 'other';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'government' | 'municipal' | 'agency' | 'other';
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          organization_id: string;
          role: 'admin' | 'member' | 'viewer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          organization_id: string;
          role: 'admin' | 'member' | 'viewer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          organization_id?: string;
          role?: 'admin' | 'member' | 'viewer';
          created_at?: string;
          updated_at?: string;
        };
      };
      audits: {
        Row: {
          id: string;
          process_name: string;
          team_name: string;
          description: string | null;
          annual_customers: number;
          organization_id: string;
          created_by: string;
          status: 'draft' | 'in_progress' | 'completed' | 'archived';
          start_date: string | null;
          completion_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          process_name: string;
          team_name: string;
          description?: string | null;
          annual_customers?: number;
          organization_id: string;
          created_by: string;
          status?: 'draft' | 'in_progress' | 'completed' | 'archived';
          start_date?: string | null;
          completion_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          process_name?: string;
          team_name?: string;
          description?: string | null;
          annual_customers?: number;
          organization_id?: string;
          created_by?: string;
          status?: 'draft' | 'in_progress' | 'completed' | 'archived';
          start_date?: string | null;
          completion_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_members: {
        Row: {
          id: string;
          audit_id: string;
          user_id: string;
          role: 'owner' | 'editor' | 'contributor' | 'viewer';
          invited_by: string;
          invited_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          audit_id: string;
          user_id: string;
          role: 'owner' | 'editor' | 'contributor' | 'viewer';
          invited_by: string;
          invited_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          audit_id?: string;
          user_id?: string;
          role?: 'owner' | 'editor' | 'contributor' | 'viewer';
          invited_by?: string;
          invited_at?: string;
          accepted_at?: string | null;
        };
      };
      wage_rates: {
        Row: {
          id: string;
          audit_id: string;
          actor_type: string;
          hourly_rate: number;
          annual_salary: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          audit_id: string;
          actor_type: string;
          hourly_rate: number;
          annual_salary?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          audit_id?: string;
          actor_type?: string;
          hourly_rate?: number;
          annual_salary?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      phases: {
        Row: {
          id: string;
          audit_id: string;
          name: string;
          description: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          audit_id: string;
          name: string;
          description?: string | null;
          order_index: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          audit_id?: string;
          name?: string;
          description?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      behaviors: {
        Row: {
          id: string;
          phase_id: string;
          name: string;
          description: string | null;
          reference_code: string;
          actor_type: 'customer' | 'caseworker' | 'supervisor' | 'specialist' | 'system' | 'external_partner' | 'other';
          behavior_type: string;
          order_index: number;
          is_required: boolean;
          is_digital: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phase_id: string;
          name: string;
          description?: string | null;
          reference_code: string;
          actor_type: 'customer' | 'caseworker' | 'supervisor' | 'specialist' | 'system' | 'external_partner' | 'other';
          behavior_type: string;
          order_index: number;
          is_required?: boolean;
          is_digital?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phase_id?: string;
          name?: string;
          description?: string | null;
          reference_code?: string;
          actor_type?: 'customer' | 'caseworker' | 'supervisor' | 'specialist' | 'system' | 'external_partner' | 'other';
          behavior_type?: string;
          order_index?: number;
          is_required?: boolean;
          is_digital?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      time_entries: {
        Row: {
          id: string;
          behavior_id: string;
          time_minutes: number;
          idle_wait_days: number;
          customer_percentage: number;
          confidence_level: 'low' | 'medium' | 'high' | null;
          data_source: string | null;
          notes: string | null;
          assessed_by: string;
          assessed_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          behavior_id: string;
          time_minutes?: number;
          idle_wait_days?: number;
          customer_percentage?: number;
          confidence_level?: 'low' | 'medium' | 'high' | null;
          data_source?: string | null;
          notes?: string | null;
          assessed_by: string;
          assessed_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          behavior_id?: string;
          time_minutes?: number;
          idle_wait_days?: number;
          customer_percentage?: number;
          confidence_level?: 'low' | 'medium' | 'high' | null;
          data_source?: string | null;
          notes?: string | null;
          assessed_by?: string;
          assessed_at?: string;
          updated_at?: string;
        };
      };
      ease_scores: {
        Row: {
          id: string;
          behavior_id: string;
          overall_score: number;
          understanding_score: number | null;
          access_score: number | null;
          completion_score: number | null;
          support_score: number | null;
          feedback_score: number | null;
          friction_points: string[] | null;
          improvement_suggestions: string[] | null;
          notes: string | null;
          assessed_by: string;
          assessed_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          behavior_id: string;
          overall_score: number;
          understanding_score?: number | null;
          access_score?: number | null;
          completion_score?: number | null;
          support_score?: number | null;
          feedback_score?: number | null;
          friction_points?: string[] | null;
          improvement_suggestions?: string[] | null;
          notes?: string | null;
          assessed_by: string;
          assessed_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          behavior_id?: string;
          overall_score?: number;
          understanding_score?: number | null;
          access_score?: number | null;
          completion_score?: number | null;
          support_score?: number | null;
          feedback_score?: number | null;
          friction_points?: string[] | null;
          improvement_suggestions?: string[] | null;
          notes?: string | null;
          assessed_by?: string;
          assessed_at?: string;
          updated_at?: string;
        };
      };
      equity_checks: {
        Row: {
          id: string;
          behavior_id: string;
          stress_stigma: boolean;
          dont_ask_twice: boolean;
          language_barriers: boolean;
          digital_exclusion: boolean;
          accessibility_issues: boolean;
          equity_concerns: string[] | null;
          mitigation_ideas: string[] | null;
          notes: string | null;
          assessed_by: string;
          assessed_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          behavior_id: string;
          stress_stigma?: boolean;
          dont_ask_twice?: boolean;
          language_barriers?: boolean;
          digital_exclusion?: boolean;
          accessibility_issues?: boolean;
          equity_concerns?: string[] | null;
          mitigation_ideas?: string[] | null;
          notes?: string | null;
          assessed_by: string;
          assessed_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          behavior_id?: string;
          stress_stigma?: boolean;
          dont_ask_twice?: boolean;
          language_barriers?: boolean;
          digital_exclusion?: boolean;
          accessibility_issues?: boolean;
          equity_concerns?: string[] | null;
          mitigation_ideas?: string[] | null;
          notes?: string | null;
          assessed_by?: string;
          assessed_at?: string;
          updated_at?: string;
        };
      };
      behavior_types: {
        Row: {
          code: string;
          category: 'information' | 'documentation' | 'decision' | 'communication' | 'processing' | 'verification' | 'waiting';
          name: string;
          description: string;
          typical_actors: string[];
          examples: string[] | null;
        };
        Insert: {
          code: string;
          category: 'information' | 'documentation' | 'decision' | 'communication' | 'processing' | 'verification' | 'waiting';
          name: string;
          description: string;
          typical_actors: string[];
          examples?: string[] | null;
        };
        Update: {
          code?: string;
          category?: 'information' | 'documentation' | 'decision' | 'communication' | 'processing' | 'verification' | 'waiting';
          name?: string;
          description?: string;
          typical_actors?: string[];
          examples?: string[] | null;
        };
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
  };
}
