# Supabase Integration Layer

This directory contains React hooks for interacting with the Supabase backend using React Query for state management, caching, and optimistic updates.

## Setup

### 1. Wrap your app with QueryClientProvider

Update your `main.tsx` or `App.tsx`:

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Available Hooks

### Authentication Hooks

#### `useAuth()`

Main authentication hook providing user state and auth operations.

```tsx
import { useAuth } from './hooks';

function LoginPage() {
  const { user, profile, loading, signIn, signOut } = useAuth();

  const handleLogin = async () => {
    const { error } = await signIn({
      email: 'user@example.com',
      password: 'password123',
    });

    if (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {profile?.name}</div>;

  return <button onClick={handleLogin}>Sign In</button>;
}
```

**Available methods:**
- `signUp(data)` - Create new user account
- `signIn(data)` - Sign in existing user
- `signOut()` - Sign out current user
- `resetPassword(email)` - Send password reset email
- `updatePassword(newPassword)` - Update user password
- `updateProfile(updates)` - Update user profile
- `refreshProfile()` - Refresh profile from database

#### `useRequireAuth()`

Hook that redirects to login if user is not authenticated.

```tsx
function ProtectedPage() {
  const auth = useRequireAuth(); // Redirects if not logged in

  return <div>Protected content</div>;
}
```

---

### Audit Hooks

#### `useAudits(filters?)`

Fetch list of audits with optional filtering.

```tsx
import { useAudits } from './hooks';

function AuditList() {
  const { data: audits, isLoading, error } = useAudits({
    status: ['draft', 'in_progress'],
    search: 'sairausvakuutus',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {audits?.map((audit) => (
        <li key={audit.id}>{audit.process_name}</li>
      ))}
    </ul>
  );
}
```

#### `useAudit(auditId)`

Fetch single audit with all related data (phases, behaviors, members, wage rates).

```tsx
function AuditDetail({ auditId }: { auditId: string }) {
  const { data: audit, isLoading } = useAudit(auditId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{audit?.process_name}</h1>
      <p>Phases: {audit?.phases?.length}</p>
      <p>Status: {audit?.status}</p>
    </div>
  );
}
```

#### `useCreateAudit()`

Create a new audit with automatic owner assignment and default wage rates.

```tsx
import { useCreateAudit } from './hooks';

function CreateAuditForm() {
  const { mutate: createAudit, isPending } = useCreateAudit();
  const { user } = useAuth();

  const handleSubmit = () => {
    createAudit({
      process_name: 'New Process',
      team_name: 'Team Name',
      organization_id: 'org-id',
      created_by: user!.id,
      status: 'draft',
      annual_customers: 1000,
    });
  };

  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Audit'}
    </button>
  );
}
```

#### `useUpdateAudit()`

Update audit properties.

```tsx
const { mutate: updateAudit } = useUpdateAudit();

updateAudit({
  id: 'audit-id',
  updates: {
    status: 'in_progress',
    process_name: 'Updated Name',
  },
});
```

#### Other Audit Hooks

- `useDeleteAudit()` - Delete an audit
- `useAuditMembers(auditId)` - Fetch audit members
- `useAddAuditMember()` - Add member to audit
- `useUpdateAuditMember()` - Update member role
- `useRemoveAuditMember()` - Remove member
- `useWageRates(auditId)` - Fetch wage rates
- `useUpdateWageRates()` - Update wage rates

---

### Phase Hooks

#### `usePhases(auditId)`

Fetch all phases for an audit, ordered by `order_index`.

```tsx
function PhaseList({ auditId }: { auditId: string }) {
  const { data: phases, isLoading } = usePhases(auditId);

  return (
    <ol>
      {phases?.map((phase) => (
        <li key={phase.id}>{phase.name}</li>
      ))}
    </ol>
  );
}
```

#### `useCreatePhase()`

Create a new phase. Auto-assigns order_index if not provided.

```tsx
const { mutate: createPhase } = useCreatePhase();

createPhase({
  audit_id: 'audit-id',
  name: 'Application Phase',
  description: 'Customer submits application',
  order_index: 0, // Optional, auto-assigned if omitted
});
```

#### `useReorderPhases()`

Reorder phases with optimistic updates.

```tsx
const { mutate: reorderPhases } = useReorderPhases();

reorderPhases({
  auditId: 'audit-id',
  phaseOrders: [
    { id: 'phase-1', order_index: 1 },
    { id: 'phase-2', order_index: 0 },
    { id: 'phase-3', order_index: 2 },
  ],
});
```

#### Other Phase Hooks

- `usePhase(phaseId)` - Fetch single phase with behaviors
- `useUpdatePhase()` - Update phase
- `useDeletePhase()` - Delete phase
- `useDuplicatePhase()` - Duplicate phase with all behaviors

---

### Behavior Hooks

#### `useBehaviors(phaseId)`

Fetch all behaviors for a phase.

```tsx
function BehaviorList({ phaseId }: { phaseId: string }) {
  const { data: behaviors, isLoading } = useBehaviors(phaseId);

  return (
    <ul>
      {behaviors?.map((behavior) => (
        <li key={behavior.id}>
          {behavior.name} ({behavior.actor_type})
        </li>
      ))}
    </ul>
  );
}
```

#### `useBehavior(behaviorId)`

Fetch single behavior with all assessments (time, ease, equity).

```tsx
function BehaviorDetail({ behaviorId }: { behaviorId: string }) {
  const { data: behavior } = useBehavior(behaviorId);

  return (
    <div>
      <h2>{behavior?.name}</h2>
      <p>Type: {behavior?.behavior_type}</p>
      <p>Actor: {behavior?.actor_type}</p>
      {behavior?.time_entries && (
        <p>Time: {behavior.time_entries[0].time_minutes} minutes</p>
      )}
    </div>
  );
}
```

#### `useCreateBehavior()`

Create a new behavior.

```tsx
const { mutate: createBehavior } = useCreateBehavior();

createBehavior({
  phase_id: 'phase-id',
  name: 'Read instructions',
  reference_code: 'RU-01',
  actor_type: 'customer',
  behavior_type: 'RU-01',
  order_index: 0,
  is_required: true,
  is_digital: false,
});
```

#### Assessment Hooks

Save time entries, ease scores, and equity checks:

```tsx
const { mutate: saveTimeEntry } = useSaveTimeEntry();
const { mutate: saveEaseScore } = useSaveEaseScore();
const { mutate: saveEquityCheck } = useSaveEquityCheck();

// Save time entry
saveTimeEntry({
  behaviorId: 'behavior-id',
  data: {
    time_minutes: 15,
    idle_wait_days: 0,
    customer_percentage: 100,
    confidence_level: 'high',
    assessed_by: user.id,
  },
});

// Save ease score
saveEaseScore({
  behaviorId: 'behavior-id',
  data: {
    overall_score: 3,
    understanding_score: 4,
    access_score: 3,
    completion_score: 2,
    support_score: 3,
    feedback_score: 4,
    friction_points: ['Confusing terminology'],
    assessed_by: user.id,
  },
});

// Save equity check
saveEquityCheck({
  behaviorId: 'behavior-id',
  data: {
    stress_stigma: true,
    dont_ask_twice: false,
    language_barriers: true,
    digital_exclusion: false,
    accessibility_issues: true,
    equity_concerns: ['Language barriers for non-Finnish speakers'],
    assessed_by: user.id,
  },
});
```

#### Reference Data

```tsx
const { data: behaviorTypes } = useBehaviorTypes();
const { data: infoTypes } = useBehaviorTypesByCategory('information');
```

#### Other Behavior Hooks

- `useUpdateBehavior()` - Update behavior
- `useDeleteBehavior()` - Delete behavior
- `useReorderBehaviors()` - Reorder behaviors (with optimistic updates)
- `useDuplicateBehavior()` - Duplicate behavior (without assessments)

---

## TypeScript Types

All hooks are fully typed using the TypeScript types defined in:
- `/src/types/index.ts` - Application types
- `/src/types/database.ts` - Supabase database types

Import types as needed:

```tsx
import type { Audit, Phase, Behavior } from '../types';
import type { Database } from '../types/database';
```

## Error Handling

All hooks throw errors that can be caught by React Query's error boundaries:

```tsx
function MyComponent() {
  const { data, error, isError } = useAudits();

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return <div>{/* render data */}</div>;
}
```

Or use error boundaries:

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <MyComponent />
</ErrorBoundary>
```

## Loading States

All query hooks provide loading states:

```tsx
const { data, isLoading, isFetching } = useAudits();

if (isLoading) return <div>Loading...</div>;
if (isFetching) return <div>Refreshing...</div>;
```

Mutation hooks provide pending states:

```tsx
const { mutate, isPending } = useCreateAudit();

<button disabled={isPending}>
  {isPending ? 'Creating...' : 'Create'}
</button>
```

## Optimistic Updates

Reordering operations use optimistic updates for instant UI feedback:

```tsx
const { mutate: reorderPhases } = useReorderPhases();

// UI updates immediately, rolls back on error
reorderPhases({
  auditId: 'audit-id',
  phaseOrders: newOrder,
});
```

## Cache Invalidation

Mutations automatically invalidate related queries to keep data fresh:

```tsx
// Creating a phase invalidates:
// - ['phases', auditId]
// - ['audit', auditId]

// Updating a behavior invalidates:
// - ['behaviors', phaseId]
// - ['behavior', behaviorId]
// - ['phase', phaseId]
```

## React Query Devtools

The React Query Devtools are included for debugging cache and queries:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

## Best Practices

1. **Always check `isLoading`** before accessing `data`
2. **Use optimistic updates** for better UX on reordering operations
3. **Handle errors gracefully** with error states or boundaries
4. **Invalidate related queries** when data changes
5. **Use `enabled` option** to conditionally fetch data
6. **Set appropriate `staleTime`** for different data types
7. **Leverage React Query Devtools** during development

## Example: Complete Component

```tsx
import { useAudit, usePhases, useCreatePhase } from './hooks';

function AuditView({ auditId }: { auditId: string }) {
  const { data: audit, isLoading: auditLoading } = useAudit(auditId);
  const { data: phases, isLoading: phasesLoading } = usePhases(auditId);
  const { mutate: createPhase, isPending } = useCreatePhase();

  const handleAddPhase = () => {
    createPhase({
      audit_id: auditId,
      name: 'New Phase',
      order_index: phases?.length || 0,
    });
  };

  if (auditLoading || phasesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{audit?.process_name}</h1>
      <h2>Phases ({phases?.length})</h2>
      <ul>
        {phases?.map((phase) => (
          <li key={phase.id}>{phase.name}</li>
        ))}
      </ul>
      <button onClick={handleAddPhase} disabled={isPending}>
        {isPending ? 'Adding...' : 'Add Phase'}
      </button>
    </div>
  );
}
```
