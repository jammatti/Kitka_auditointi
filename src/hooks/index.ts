/* ============================================================================
   Hooks Index
   Export all custom hooks from a single location
   ============================================================================ */

// Authentication hooks
export {
  useAuth,
  useRequireAuth,
} from './useAuth';

// Audit hooks
export {
  useAudits,
  useAudit,
  useCreateAudit,
  useUpdateAudit,
  useDeleteAudit,
  useAuditMembers,
  useAddAuditMember,
  useUpdateAuditMember,
  useRemoveAuditMember,
  useWageRates,
  useUpdateWageRates,
} from './useAudits';

// Phase hooks
export {
  usePhases,
  usePhase,
  useCreatePhase,
  useUpdatePhase,
  useDeletePhase,
  useReorderPhases,
  useDuplicatePhase,
} from './usePhases';

// Behavior hooks
export {
  useBehaviors,
  useBehavior,
  useCreateBehavior,
  useUpdateBehavior,
  useDeleteBehavior,
  useReorderBehaviors,
  useDuplicateBehavior,
  useSaveTimeEntry,
  useSaveEaseScore,
  useSaveEquityCheck,
  useBehaviorTypes,
  useBehaviorTypesByCategory,
} from './useBehaviors';
