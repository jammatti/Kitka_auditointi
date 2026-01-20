/* ============================================================================
   User and Organization Types
   ============================================================================ */

export interface User {
  id: string;
  email: string;
  name: string;
  organization_id: string;
  role: 'admin' | 'member' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'government' | 'municipal' | 'agency' | 'other';
  created_at: string;
  updated_at: string;
}

/* ============================================================================
   Audit Types
   ============================================================================ */

export type AuditStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export type AuditMemberRole = 'owner' | 'editor' | 'contributor' | 'viewer';

export interface Audit {
  id: string;
  process_name: string;
  team_name: string;
  description?: string;
  annual_customers: number;
  organization_id: string;
  created_by: string;
  status: AuditStatus;
  start_date?: string;
  completion_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditMember {
  id: string;
  audit_id: string;
  user_id: string;
  role: AuditMemberRole;
  invited_by: string;
  invited_at: string;
  accepted_at?: string;
}

export interface WageRate {
  id: string;
  audit_id: string;
  actor_type: string;
  hourly_rate: number;
  annual_salary?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/* ============================================================================
   Journey Types (Phases and Behaviors)
   ============================================================================ */

export interface Phase {
  id: string;
  audit_id: string;
  name: string;
  description?: string;
  order_index: number;
  behaviors?: Behavior[];
  created_at: string;
  updated_at: string;
}

export type ActorType =
  | 'customer'
  | 'caseworker'
  | 'supervisor'
  | 'specialist'
  | 'system'
  | 'external_partner'
  | 'other';

export type BehaviorCategory =
  | 'information'
  | 'documentation'
  | 'decision'
  | 'communication'
  | 'processing'
  | 'verification'
  | 'waiting';

export interface Behavior {
  id: string;
  phase_id: string;
  name: string;
  description?: string;
  reference_code: string;
  actor_type: ActorType;
  behavior_type: string; // References BehaviorType code
  order_index: number;
  is_required: boolean;
  is_digital: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/* ============================================================================
   Assessment Types
   ============================================================================ */

export interface TimeEntry {
  id: string;
  behavior_id: string;
  time_minutes: number;
  idle_wait_days: number;
  customer_percentage: number; // Percentage of customers who complete this step
  confidence_level?: 'low' | 'medium' | 'high';
  data_source?: string;
  notes?: string;
  assessed_by: string;
  assessed_at: string;
  updated_at: string;
}

export type EaseCriterion =
  | 'understanding'
  | 'access'
  | 'completion'
  | 'support'
  | 'feedback';

export interface EaseCriteriaScores {
  understanding?: number; // 1-5 scale
  access?: number;
  completion?: number;
  support?: number;
  feedback?: number;
}

export interface EaseScore {
  id: string;
  behavior_id: string;
  overall_score: number; // 1-5 scale (1 = very difficult, 5 = very easy)
  criteria_scores: EaseCriteriaScores;
  friction_points?: string[];
  improvement_suggestions?: string[];
  notes?: string;
  assessed_by: string;
  assessed_at: string;
  updated_at: string;
}

export interface EquityCheck {
  id: string;
  behavior_id: string;
  stress_stigma: boolean; // Does this cause stress or stigma?
  dont_ask_twice: boolean; // Do we ask for information we already have?
  language_barriers: boolean;
  digital_exclusion: boolean;
  accessibility_issues: boolean;
  equity_concerns?: string[];
  mitigation_ideas?: string[];
  notes?: string;
  assessed_by: string;
  assessed_at: string;
  updated_at: string;
}

/* ============================================================================
   Reference Data Types
   ============================================================================ */

export interface BehaviorType {
  code: string;
  category: BehaviorCategory;
  name: string;
  description: string;
  typical_actors: ActorType[];
  examples?: string[];
}

export interface ActorTypeDefinition {
  code: ActorType;
  name: string;
  description: string;
  typical_wage_range?: {
    min: number;
    max: number;
  };
}

/* ============================================================================
   Calculated Types
   ============================================================================ */

export interface BehaviorCostCalculation {
  labor_cost_per_instance: number;
  annual_labor_cost: number;
  wait_time_cost?: number;
  total_cost_estimate: number;
}

export interface BehaviorWithCalculations extends Behavior {
  time_entry?: TimeEntry;
  ease_score?: EaseScore;
  equity_check?: EquityCheck;
  calculations?: BehaviorCostCalculation;
  priority_score?: number; // Calculated based on cost, ease, equity
}

export interface PhaseWithCalculations extends Phase {
  behaviors: BehaviorWithCalculations[];
  total_time_minutes: number;
  total_cost: number;
  average_ease_score: number;
  equity_issues_count: number;
}

export interface AuditSummary {
  audit_id: string;
  total_phases: number;
  total_behaviors: number;
  total_time_minutes: number;
  total_labor_cost: number;
  average_ease_score: number;
  total_equity_issues: number;
  completion_percentage: number;
  priority_behaviors: BehaviorWithCalculations[];
  quick_wins: BehaviorWithCalculations[];
  high_impact_opportunities: BehaviorWithCalculations[];
  generated_at: string;
}

/* ============================================================================
   UI and Form Types
   ============================================================================ */

export type TabType = 'setup' | 'journey' | 'time' | 'ease' | 'equity' | 'summary';

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
}

/* ============================================================================
   API Response Types
   ============================================================================ */

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/* ============================================================================
   Filter and Sort Types
   ============================================================================ */

export interface AuditFilters {
  status?: AuditStatus[];
  organization_id?: string;
  created_by?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

/* ============================================================================
   Export Types
   ============================================================================ */

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  include_calculations: boolean;
  include_notes: boolean;
  include_recommendations: boolean;
  sections?: TabType[];
}
