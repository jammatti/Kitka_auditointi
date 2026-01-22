# Supabase Database Setup

This directory contains the database schema and seed data for the Kitka Auditointi application.

## Files

- `seed.sql` - Complete database schema with reference data and sample data

## What's Included

### 1. Database Schema

Complete table definitions for:
- **Organizations** - Government agencies and municipalities
- **Profiles** - User profiles (extends Supabase auth.users)
- **Audits** - Sludge audit projects
- **Audit Members** - Multi-user collaboration with roles
- **Wage Rates** - Configurable hourly rates per actor type
- **Phases** - Journey map phases
- **Behaviors** - Individual behaviors/steps in the journey
- **Time Entries** - Time and effort assessments
- **Ease Scores** - Ease of use assessments (1-5 scale)
- **Equity Checks** - Equity and accessibility assessments
- **Behavior Types** - Reference data for behavior categorization

### 2. Behavior Types Reference Data

40 behavior types from the NSW Sludge Tool, organized into 8 categories:

1. **Reading & Understanding** (11 types) - RU-01 to RU-11
2. **Seeking & Navigating** (4 types) - SN-01 to SN-04
3. **Preparing or Providing Information** (7 types) - PP-01 to PP-07
4. **Interacting** (6 types) - IN-01 to IN-06
5. **Problem Solving** (3 types) - PS-01 to PS-03
6. **Waiting** (2 types) - WT-01 to WT-02
7. **Transactions** (2 types) - TR-01 to TR-02
8. **Receiving Outcomes** (3 types) - RO-01 to RO-03

### 3. Default Finnish Wage Rates

Reference hourly rates for Finnish context:

- **Customer** (Asiakas): €21.93/hour
  - Based on average Finnish hourly wage
  - Source: Statistics Finland 2024

- **Government Staff 1** (Virkailija): €25.30/hour
  - Entry to mid-level caseworker
  - Based on Finnish municipal salary scales (KVTES)

- **Government Staff 2** (Erikoisvirkailija): €30.75/hour
  - Senior caseworker or specialist
  - Based on KVTES specialist scales

- **Third Party** (Kolmas osapuoli): €20.36/hour
  - External partners, contractors
  - Based on typical service provider rates

### 4. Sample Organization

- **Kela** (Finnish Social Insurance Institution) - Pre-configured for testing

### 5. Row Level Security (RLS) Policies

Complete security policies ensuring:
- Users can only access data from their organization
- Audit members can only access audits they belong to
- Role-based permissions (owner, editor, contributor, viewer)
- All behavior types are publicly readable (reference data)

## Setup Instructions

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `seed.sql`
5. Run the query

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Initialize Supabase in your project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Run the seed file
supabase db reset
# Or apply migrations manually
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/seed.sql
```

### Option 3: Using psql directly

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres" -f supabase/seed.sql
```

## Creating Your First Test User

After running the seed file, create a test user:

1. **Sign up through your application** or use Supabase dashboard to create an auth user

2. **Insert a profile** for the user:

```sql
-- Replace 'auth_user_id_here' with the actual UUID from auth.users
INSERT INTO profiles (id, email, name, organization_id, role)
VALUES (
  'auth_user_id_here',
  'test@example.com',
  'Test User',
  '00000000-0000-0000-0000-000000000001', -- Kela organization
  'admin'
);
```

3. **Create a sample audit**:

```sql
INSERT INTO audits (
  id,
  process_name,
  team_name,
  description,
  annual_customers,
  organization_id,
  created_by,
  status,
  start_date
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Sairausvakuutuskorvauksen hakeminen',
  'Kela Sairausvakuutus',
  'Prosessi sairausvakuutuskorvauksen hakemiselle ja käsittelylle',
  50000,
  '00000000-0000-0000-0000-000000000001',
  'your_user_id_here',
  'draft',
  NOW()
);

-- Add yourself as audit owner
INSERT INTO audit_members (audit_id, user_id, role, invited_by)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'your_user_id_here',
  'owner',
  'your_user_id_here'
);

-- Add default wage rates to the audit
INSERT INTO wage_rates (audit_id, actor_type, hourly_rate, notes) VALUES
  ('00000000-0000-0000-0000-000000000010', 'customer', 21.93, 'Keskimääräinen suomalainen tuntipalkka, Tilastokeskus 2024'),
  ('00000000-0000-0000-0000-000000000010', 'caseworker', 25.30, 'KVTES virkailijapalkka, perus-/keskitaso'),
  ('00000000-0000-0000-0000-000000000010', 'specialist', 30.75, 'KVTES erikoisvirkailija/asiantuntija'),
  ('00000000-0000-0000-0000-000000000010', 'external_partner', 20.36, 'Ulkopuolinen palveluntarjoaja');
```

## Helpful Queries

### View all behavior types by category

```sql
SELECT
  category,
  COUNT(*) as count,
  ARRAY_AGG(name ORDER BY code) as behaviors
FROM behavior_types
GROUP BY category
ORDER BY category;
```

### Get wage rate summary for an audit

```sql
SELECT
  actor_type,
  hourly_rate,
  hourly_rate * 1920 as estimated_annual_salary
FROM wage_rates
WHERE audit_id = 'your_audit_id';
```

### Calculate total behavior costs

```sql
SELECT
  b.name,
  te.time_minutes,
  wr.hourly_rate,
  (te.time_minutes / 60.0 * wr.hourly_rate) as cost_per_instance,
  (te.time_minutes / 60.0 * wr.hourly_rate * a.annual_customers) as annual_cost
FROM behaviors b
JOIN time_entries te ON b.id = te.behavior_id
JOIN wage_rates wr ON b.actor_type = wr.actor_type
JOIN phases p ON b.phase_id = p.id
JOIN audits a ON p.audit_id = a.id
WHERE a.id = 'your_audit_id'
ORDER BY annual_cost DESC;
```

## Environment Variables

Make sure your `.env` file has the correct Supabase connection details:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only access data from their own organization
- Audit members have role-based access control
- Reference data (behavior_types) is readable by all authenticated users
- Passwords and sensitive data should never be committed to the repository

## Next Steps

1. Run the seed file to set up your database
2. Create a test user through your application
3. Insert the user profile with the SQL above
4. Create a sample audit to test the application
5. Build out the React components to interact with this data

## Support

For questions or issues with the database setup, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
