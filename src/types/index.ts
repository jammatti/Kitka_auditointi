export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Audit {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'in_progress' | 'completed';
}

export interface JourneyStep {
  id: string;
  audit_id: string;
  step_number: number;
  title: string;
  description?: string;
  time_estimate?: number;
  ease_rating?: number;
  created_at: string;
}

export type TabType = 'setup' | 'journey' | 'time' | 'ease' | 'summary';
