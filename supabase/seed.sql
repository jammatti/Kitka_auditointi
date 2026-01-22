-- ============================================================================
-- Kitka Auditointi - Supabase Seed File
-- Multi-user Sludge Audit Tool for Finnish Government Services
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SCHEMA: Organizations
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('government', 'municipal', 'agency', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SCHEMA: Users (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SCHEMA: Audits
-- ============================================================================

CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  description TEXT,
  annual_customers INTEGER NOT NULL DEFAULT 0,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  start_date DATE,
  completion_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'contributor', 'viewer')),
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(audit_id, user_id)
);

CREATE TABLE IF NOT EXISTS wage_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  annual_salary DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(audit_id, actor_type)
);

-- ============================================================================
-- SCHEMA: Journey (Phases and Behaviors)
-- ============================================================================

CREATE TABLE IF NOT EXISTS phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS behaviors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  reference_code TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('customer', 'caseworker', 'supervisor', 'specialist', 'system', 'external_partner', 'other')),
  behavior_type TEXT NOT NULL, -- References behavior_types.code
  order_index INTEGER NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_digital BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SCHEMA: Assessments
-- ============================================================================

CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  behavior_id UUID NOT NULL REFERENCES behaviors(id) ON DELETE CASCADE,
  time_minutes INTEGER NOT NULL DEFAULT 0,
  idle_wait_days INTEGER NOT NULL DEFAULT 0,
  customer_percentage INTEGER NOT NULL DEFAULT 100,
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
  data_source TEXT,
  notes TEXT,
  assessed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(behavior_id)
);

CREATE TABLE IF NOT EXISTS ease_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  behavior_id UUID NOT NULL REFERENCES behaviors(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 1 AND 5),
  understanding_score INTEGER CHECK (understanding_score BETWEEN 1 AND 5),
  access_score INTEGER CHECK (access_score BETWEEN 1 AND 5),
  completion_score INTEGER CHECK (completion_score BETWEEN 1 AND 5),
  support_score INTEGER CHECK (support_score BETWEEN 1 AND 5),
  feedback_score INTEGER CHECK (feedback_score BETWEEN 1 AND 5),
  friction_points TEXT[], -- Array of text
  improvement_suggestions TEXT[], -- Array of text
  notes TEXT,
  assessed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(behavior_id)
);

CREATE TABLE IF NOT EXISTS equity_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  behavior_id UUID NOT NULL REFERENCES behaviors(id) ON DELETE CASCADE,
  stress_stigma BOOLEAN NOT NULL DEFAULT false,
  dont_ask_twice BOOLEAN NOT NULL DEFAULT false,
  language_barriers BOOLEAN NOT NULL DEFAULT false,
  digital_exclusion BOOLEAN NOT NULL DEFAULT false,
  accessibility_issues BOOLEAN NOT NULL DEFAULT false,
  equity_concerns TEXT[], -- Array of text
  mitigation_ideas TEXT[], -- Array of text
  notes TEXT,
  assessed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(behavior_id)
);

-- ============================================================================
-- SCHEMA: Reference Data
-- ============================================================================

CREATE TABLE IF NOT EXISTS behavior_types (
  code TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('information', 'documentation', 'decision', 'communication', 'processing', 'verification', 'waiting')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  typical_actors TEXT[] NOT NULL, -- Array of actor types
  examples TEXT[] -- Array of example descriptions
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_audits_organization ON audits(organization_id);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_audit_members_audit ON audit_members(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_members_user ON audit_members(user_id);
CREATE INDEX IF NOT EXISTS idx_phases_audit ON phases(audit_id);
CREATE INDEX IF NOT EXISTS idx_behaviors_phase ON behaviors(phase_id);
CREATE INDEX IF NOT EXISTS idx_behaviors_type ON behaviors(behavior_type);
CREATE INDEX IF NOT EXISTS idx_time_entries_behavior ON time_entries(behavior_id);
CREATE INDEX IF NOT EXISTS idx_ease_scores_behavior ON ease_scores(behavior_id);
CREATE INDEX IF NOT EXISTS idx_equity_checks_behavior ON equity_checks(behavior_id);

-- ============================================================================
-- TRIGGERS for Updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wage_rates_updated_at BEFORE UPDATE ON wage_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phases_updated_at BEFORE UPDATE ON phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_behaviors_updated_at BEFORE UPDATE ON behaviors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ease_scores_updated_at BEFORE UPDATE ON ease_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equity_checks_updated_at BEFORE UPDATE ON equity_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Behavior Types (NSW Sludge Tool Reference Data)
-- ============================================================================

-- CATEGORY: Reading & Understanding (11 types)
INSERT INTO behavior_types (code, category, name, description, typical_actors, examples) VALUES
('RU-01', 'information', 'Reading instructions', 'Reading and comprehending written instructions, guidelines, or requirements', ARRAY['customer'], ARRAY['Reading eligibility criteria', 'Understanding application requirements', 'Reading terms and conditions']),
('RU-02', 'information', 'Understanding eligibility', 'Determining whether one meets the criteria for a service or benefit', ARRAY['customer', 'caseworker'], ARRAY['Checking income thresholds', 'Verifying residency requirements', 'Understanding age limits']),
('RU-03', 'information', 'Understanding language', 'Interpreting specialized or technical language, jargon, or legal terms', ARRAY['customer'], ARRAY['Understanding legal terminology', 'Interpreting bureaucratic language', 'Decoding technical jargon']),
('RU-04', 'information', 'Reading correspondence', 'Reading and understanding letters, emails, or messages from government', ARRAY['customer'], ARRAY['Reading decision letters', 'Understanding notification emails', 'Reviewing status updates']),
('RU-05', 'information', 'Understanding consequences', 'Understanding the implications, obligations, or results of actions or decisions', ARRAY['customer'], ARRAY['Understanding penalties for non-compliance', 'Knowing appeal rights', 'Understanding payment obligations']),
('RU-06', 'information', 'Comparing options', 'Evaluating and comparing different service options, providers, or approaches', ARRAY['customer'], ARRAY['Comparing service packages', 'Evaluating different application pathways', 'Choosing between benefit options']),
('RU-07', 'information', 'Understanding timing', 'Understanding deadlines, processing times, or when things will happen', ARRAY['customer'], ARRAY['Knowing application deadlines', 'Understanding waiting periods', 'Anticipating decision timeframes']),
('RU-08', 'information', 'Reading evidence requirements', 'Understanding what supporting documents or proof is needed', ARRAY['customer', 'caseworker'], ARRAY['Knowing which ID documents to provide', 'Understanding proof of income requirements', 'Determining document formats required']),
('RU-09', 'information', 'Understanding rights', 'Understanding entitlements, rights to privacy, or complaint mechanisms', ARRAY['customer'], ARRAY['Knowing appeal rights', 'Understanding privacy protections', 'Learning about complaint processes']),
('RU-10', 'information', 'Understanding digital requirements', 'Understanding technical or digital requirements for online services', ARRAY['customer'], ARRAY['Understanding browser requirements', 'Knowing device compatibility', 'Understanding digital ID requirements']),
('RU-11', 'information', 'Reading FAQs and help content', 'Searching for and reading help documentation, FAQs, or guidance', ARRAY['customer'], ARRAY['Reading online help articles', 'Searching knowledge bases', 'Reviewing FAQ sections']);

-- CATEGORY: Seeking & Navigating (4 types)
INSERT INTO behavior_types (code, category, name, description, typical_actors, examples) VALUES
('SN-01', 'information', 'Finding the right service', 'Locating which government service, department, or program applies', ARRAY['customer'], ARRAY['Identifying the correct agency', 'Finding the right program', 'Determining which service to use']),
('SN-02', 'information', 'Navigating websites', 'Finding information or services on government websites', ARRAY['customer'], ARRAY['Using search functions', 'Navigating menu structures', 'Finding specific pages']),
('SN-03', 'information', 'Finding contact information', 'Locating phone numbers, addresses, or other ways to contact government', ARRAY['customer'], ARRAY['Finding phone numbers', 'Locating office addresses', 'Finding email contacts']),
('SN-04', 'information', 'Accessing digital services', 'Logging in, creating accounts, or accessing online services', ARRAY['customer'], ARRAY['Creating user accounts', 'Using digital ID', 'Managing passwords', 'Two-factor authentication']);

-- CATEGORY: Preparing or Providing Information (7 types)
INSERT INTO behavior_types (code, category, name, description, typical_actors, examples) VALUES
('PP-01', 'documentation', 'Gathering documents', 'Collecting required identification, proof, or supporting documents', ARRAY['customer'], ARRAY['Obtaining birth certificates', 'Collecting bank statements', 'Gathering medical records']),
('PP-02', 'documentation', 'Completing forms', 'Filling out application forms, declarations, or questionnaires', ARRAY['customer'], ARRAY['Filling application forms', 'Completing declarations', 'Answering questionnaires']),
('PP-03', 'documentation', 'Getting help from others', 'Seeking assistance from family, friends, or support services', ARRAY['customer'], ARRAY['Asking family for help', 'Using advocacy services', 'Getting translation assistance']),
('PP-04', 'documentation', 'Organizing information', 'Sorting, scanning, copying, or organizing documents and information', ARRAY['customer', 'caseworker'], ARRAY['Scanning documents', 'Making copies', 'Organizing files', 'Creating folders']),
('PP-05', 'documentation', 'Getting signatures or approvals', 'Obtaining signatures, certifications, or approvals from third parties', ARRAY['customer'], ARRAY['Getting doctor signatures', 'Obtaining employer approvals', 'Getting certified copies']),
('PP-06', 'documentation', 'Translating documents', 'Getting documents translated or certified for language requirements', ARRAY['customer'], ARRAY['Translating foreign documents', 'Getting certified translations', 'Using translation services']),
('PP-07', 'documentation', 'Creating evidence', 'Creating documents, photos, or records as proof of circumstances', ARRAY['customer'], ARRAY['Taking photos', 'Creating statutory declarations', 'Writing statements']);

-- CATEGORY: Interacting (6 types)
INSERT INTO behavior_types (code, category, name, description, typical_actors, examples) VALUES
('IN-01', 'communication', 'Calling or messaging', 'Contacting government via phone, chat, or messaging', ARRAY['customer'], ARRAY['Calling service centers', 'Using live chat', 'Sending messages through portals']),
('IN-02', 'communication', 'Visiting in person', 'Traveling to and visiting government offices or service centers', ARRAY['customer'], ARRAY['Visiting service offices', 'Attending appointments', 'Going to shopfronts']),
('IN-03', 'communication', 'Explaining circumstances', 'Describing situations, needs, or circumstances to government staff', ARRAY['customer', 'caseworker'], ARRAY['Explaining financial hardship', 'Describing medical conditions', 'Clarifying situations']),
('IN-04', 'communication', 'Responding to requests', 'Providing additional information, clarifications, or responses when asked', ARRAY['customer'], ARRAY['Answering follow-up questions', 'Providing missing information', 'Clarifying details']),
('IN-05', 'communication', 'Attending appointments', 'Participating in scheduled meetings, interviews, or assessments', ARRAY['customer'], ARRAY['Attending interviews', 'Participating in assessments', 'Going to medical examinations']),
('IN-06', 'communication', 'Negotiating or advocating', 'Requesting reconsideration, explaining special circumstances, or advocating', ARRAY['customer'], ARRAY['Requesting extensions', 'Explaining special circumstances', 'Advocating for needs']);

-- CATEGORY: Problem Solving (3 types)
INSERT INTO behavior_types (code, category, name, description, typical_actors, examples) VALUES
('PS-01', 'processing', 'Resolving errors', 'Identifying and fixing errors in forms, systems, or submissions', ARRAY['customer', 'caseworker'], ARRAY['Fixing form errors', 'Resolving technical issues', 'Correcting submission problems']),
('PS-02', 'processing', 'Finding workarounds', 'Finding alternative approaches when standard processes do not work', ARRAY['customer', 'caseworker'], ARRAY['Using alternative submission methods', 'Finding backup processes', 'Adapting to system limitations']),
('PS-03', 'processing', 'Understanding rejections', 'Understanding why applications or requests were rejected and what to do next', ARRAY['customer'], ARRAY['Reading rejection reasons', 'Understanding next steps', 'Learning about appeal options']);

-- CATEGORY: Waiting (2 types)
INSERT INTO behavior_types (code, category, name, description, typical_actors, examples) VALUES
('WT-01', 'waiting', 'Waiting for processing', 'Time spent waiting for government to process requests or make decisions', ARRAY['customer'], ARRAY['Waiting for application processing', 'Waiting for decisions', 'Waiting for reviews']),
('WT-02', 'waiting', 'Waiting in queues', 'Time spent waiting on hold, in physical queues, or for appointments', ARRAY['customer'], ARRAY['Waiting on phone', 'Queuing in person', 'Waiting for available appointments']);

-- CATEGORY: Transactions (2 types)
INSERT INTO behavior_types (code, category, name, description, typical_actors, examples) VALUES
('TR-01', 'processing', 'Submitting applications', 'Submitting forms, applications, or requests through various channels', ARRAY['customer'], ARRAY['Submitting online forms', 'Mailing applications', 'Lodging in person']),
('TR-02', 'processing', 'Making payments', 'Paying fees, charges, or debts to government', ARRAY['customer'], ARRAY['Paying application fees', 'Making debt payments', 'Paying fines']);

-- CATEGORY: Receiving Outcomes (3 types)
INSERT INTO behavior_types (code, category, name, description, typical_actors, examples) VALUES
('RO-01', 'communication', 'Receiving decisions', 'Being notified of decisions, approvals, or rejections', ARRAY['customer'], ARRAY['Receiving approval letters', 'Getting rejection notices', 'Receiving decision notifications']),
('RO-02', 'communication', 'Receiving payments or services', 'Receiving benefits, payments, services, or entitlements', ARRAY['customer'], ARRAY['Receiving benefit payments', 'Getting services delivered', 'Accessing entitlements']),
('RO-03', 'communication', 'Confirming receipt', 'Confirming that applications, documents, or information was received', ARRAY['customer'], ARRAY['Checking submission status', 'Confirming document receipt', 'Verifying application lodged']);

-- CATEGORY: Government Action (2 types)
INSERT INTO behavior_types (code, category, name, description, typical_actors, examples) VALUES
('GA-01', 'verification', 'Verifying information', 'Government staff verifying, checking, or validating customer information', ARRAY['caseworker', 'specialist'], ARRAY['Checking identity documents', 'Verifying income information', 'Validating addresses']),
('GA-02', 'decision', 'Making decisions', 'Government staff assessing, evaluating, and making decisions on cases', ARRAY['caseworker', 'supervisor', 'specialist'], ARRAY['Assessing eligibility', 'Making approval decisions', 'Determining benefit amounts']);

-- ============================================================================
-- SEED DATA: Sample Organization and Test User
-- ============================================================================

-- Insert sample organization
INSERT INTO organizations (id, name, type, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Kela (Finnish Social Insurance Institution)', 'government', NOW(), NOW());

-- Note: Users must be created through Supabase Auth first
-- This is a placeholder for the profile that will be created after auth signup
-- When a user signs up, you'll need to insert into profiles table like:
-- INSERT INTO profiles (id, email, name, organization_id, role)
-- VALUES (auth_user_id, 'test@example.com', 'Test User', '00000000-0000-0000-0000-000000000001', 'admin');

-- ============================================================================
-- SEED DATA: Sample Audit with Default Finnish Wage Rates
-- ============================================================================

-- Sample audit (uncomment and update user IDs after creating test users)
-- INSERT INTO audits (id, process_name, team_name, description, annual_customers, organization_id, created_by, status, start_date)
-- VALUES (
--   '00000000-0000-0000-0000-000000000010',
--   'Sairausvakuutuskorvauksen hakeminen',
--   'Kela Sairausvakuutus',
--   'Prosessi sairausvakuutuskorvauksen hakemiselle ja käsittelylle',
--   50000,
--   '00000000-0000-0000-0000-000000000001',
--   'user_id_here', -- Replace with actual user ID
--   'draft',
--   NOW()
-- );

-- Default Finnish wage rates (template for new audits)
-- These are typical hourly rates in euros for the Finnish context
-- Usage: Copy these values when creating a new audit
--
-- Customer (asiakas): €21.93/hour
--   Based on average Finnish hourly wage for reference person time
--   Source: Statistics Finland, average hourly earnings 2024
--
-- Government Staff 1 (virkailija): €25.30/hour
--   Entry to mid-level caseworker
--   Based on Finnish municipal salary scales
--
-- Government Staff 2 (erikoisvirkailija): €30.75/hour
--   Senior caseworker or specialist
--   Based on Finnish municipal salary scales for specialists
--
-- Third Party (kolmas osapuoli): €20.36/hour
--   External partners, contractors
--   Based on typical service provider rates
--
-- Example SQL to insert default rates for an audit:
/*
INSERT INTO wage_rates (audit_id, actor_type, hourly_rate, notes) VALUES
  ('audit_id_here', 'customer', 21.93, 'Keskimääräinen suomalainen tuntipalkka, Tilastokeskus 2024'),
  ('audit_id_here', 'caseworker', 25.30, 'KVTES virkailijapalkka, perus-/keskitaso'),
  ('audit_id_here', 'specialist', 30.75, 'KVTES erikoisvirkailija/asiantuntija'),
  ('audit_id_here', 'external_partner', 20.36, 'Ulkopuolinen palveluntarjoaja, tyypillinen tuntihinta');
*/

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE wage_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ease_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE equity_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_types ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can view their own organization
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Profiles: Users can view profiles in their organization
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can view org profiles" ON profiles
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Audits: Users can view audits they're members of or in their organization
CREATE POLICY "Users can view own org audits" ON audits
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create audits" ON audits
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Audit owners can update" ON audits
  FOR UPDATE USING (
    id IN (SELECT audit_id FROM audit_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
  );

CREATE POLICY "Audit owners can delete" ON audits
  FOR DELETE USING (
    id IN (SELECT audit_id FROM audit_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- Audit members: Users can view members of audits they belong to
CREATE POLICY "Users can view audit members" ON audit_members
  FOR SELECT USING (
    audit_id IN (SELECT audit_id FROM audit_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Audit owners can manage members" ON audit_members
  FOR ALL USING (
    audit_id IN (SELECT audit_id FROM audit_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
  );

-- Wage rates: Users can view/edit rates for audits they're members of
CREATE POLICY "Users can view wage rates" ON wage_rates
  FOR SELECT USING (
    audit_id IN (SELECT audit_id FROM audit_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Editors can manage wage rates" ON wage_rates
  FOR ALL USING (
    audit_id IN (SELECT audit_id FROM audit_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor', 'contributor'))
  );

-- Phases: Users can view/edit phases for audits they're members of
CREATE POLICY "Users can view phases" ON phases
  FOR SELECT USING (
    audit_id IN (SELECT audit_id FROM audit_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Contributors can manage phases" ON phases
  FOR ALL USING (
    audit_id IN (SELECT audit_id FROM audit_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor', 'contributor'))
  );

-- Behaviors: Users can view/edit behaviors for audits they're members of
CREATE POLICY "Users can view behaviors" ON behaviors
  FOR SELECT USING (
    phase_id IN (
      SELECT p.id FROM phases p
      JOIN audit_members am ON p.audit_id = am.audit_id
      WHERE am.user_id = auth.uid()
    )
  );

CREATE POLICY "Contributors can manage behaviors" ON behaviors
  FOR ALL USING (
    phase_id IN (
      SELECT p.id FROM phases p
      JOIN audit_members am ON p.audit_id = am.audit_id
      WHERE am.user_id = auth.uid() AND am.role IN ('owner', 'editor', 'contributor')
    )
  );

-- Time entries: Users can view/edit for audits they're members of
CREATE POLICY "Users can view time entries" ON time_entries
  FOR SELECT USING (
    behavior_id IN (
      SELECT b.id FROM behaviors b
      JOIN phases p ON b.phase_id = p.id
      JOIN audit_members am ON p.audit_id = am.audit_id
      WHERE am.user_id = auth.uid()
    )
  );

CREATE POLICY "Contributors can manage time entries" ON time_entries
  FOR ALL USING (
    behavior_id IN (
      SELECT b.id FROM behaviors b
      JOIN phases p ON b.phase_id = p.id
      JOIN audit_members am ON p.audit_id = am.audit_id
      WHERE am.user_id = auth.uid() AND am.role IN ('owner', 'editor', 'contributor')
    )
  );

-- Ease scores: Users can view/edit for audits they're members of
CREATE POLICY "Users can view ease scores" ON ease_scores
  FOR SELECT USING (
    behavior_id IN (
      SELECT b.id FROM behaviors b
      JOIN phases p ON b.phase_id = p.id
      JOIN audit_members am ON p.audit_id = am.audit_id
      WHERE am.user_id = auth.uid()
    )
  );

CREATE POLICY "Contributors can manage ease scores" ON ease_scores
  FOR ALL USING (
    behavior_id IN (
      SELECT b.id FROM behaviors b
      JOIN phases p ON b.phase_id = p.id
      JOIN audit_members am ON p.audit_id = am.audit_id
      WHERE am.user_id = auth.uid() AND am.role IN ('owner', 'editor', 'contributor')
    )
  );

-- Equity checks: Users can view/edit for audits they're members of
CREATE POLICY "Users can view equity checks" ON equity_checks
  FOR SELECT USING (
    behavior_id IN (
      SELECT b.id FROM behaviors b
      JOIN phases p ON b.phase_id = p.id
      JOIN audit_members am ON p.audit_id = am.audit_id
      WHERE am.user_id = auth.uid()
    )
  );

CREATE POLICY "Contributors can manage equity checks" ON equity_checks
  FOR ALL USING (
    behavior_id IN (
      SELECT b.id FROM behaviors b
      JOIN phases p ON b.phase_id = p.id
      JOIN audit_members am ON p.audit_id = am.audit_id
      WHERE am.user_id = auth.uid() AND am.role IN ('owner', 'editor', 'contributor')
    )
  );

-- Behavior types: All authenticated users can view reference data
CREATE POLICY "All users can view behavior types" ON behavior_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- HELPFUL QUERIES FOR DEVELOPMENT
-- ============================================================================

-- Query to get all behavior types organized by category
-- SELECT category, COUNT(*) as count, ARRAY_AGG(name ORDER BY code) as behaviors
-- FROM behavior_types
-- GROUP BY category
-- ORDER BY category;

-- Query to get wage rate summary
-- SELECT actor_type, hourly_rate, hourly_rate * 1920 as estimated_annual_salary
-- FROM wage_rates
-- WHERE audit_id = 'audit_id_here';

-- Query to calculate total behavior costs
-- SELECT
--   b.name,
--   te.time_minutes,
--   wr.hourly_rate,
--   (te.time_minutes / 60.0 * wr.hourly_rate) as cost_per_instance,
--   (te.time_minutes / 60.0 * wr.hourly_rate * a.annual_customers) as annual_cost
-- FROM behaviors b
-- JOIN time_entries te ON b.id = te.behavior_id
-- JOIN wage_rates wr ON b.actor_type = wr.actor_type
-- JOIN phases p ON b.phase_id = p.id
-- JOIN audits a ON p.audit_id = a.id
-- WHERE a.id = 'audit_id_here';
