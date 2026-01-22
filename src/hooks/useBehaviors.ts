/* ============================================================================
   Behavior Hooks
   React Query hooks for managing behaviors and their assessments
   ============================================================================ */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { Behavior, TimeEntry, EaseScore, EquityCheck } from '../types';

type BehaviorRow = Database['public']['Tables']['behaviors']['Row'];
type BehaviorInsert = Database['public']['Tables']['behaviors']['Insert'];
type BehaviorUpdate = Database['public']['Tables']['behaviors']['Update'];
type TimeEntryInsert = Database['public']['Tables']['time_entries']['Insert'];
type TimeEntryUpdate = Database['public']['Tables']['time_entries']['Update'];
type EaseScoreInsert = Database['public']['Tables']['ease_scores']['Insert'];
type EaseScoreUpdate = Database['public']['Tables']['ease_scores']['Update'];
type EquityCheckInsert = Database['public']['Tables']['equity_checks']['Insert'];
type EquityCheckUpdate = Database['public']['Tables']['equity_checks']['Update'];

/* ============================================================================
   Behavior CRUD Operations
   ============================================================================ */

/**
 * Fetch all behaviors for a phase
 */
export function useBehaviors(phaseId: string | undefined) {
  return useQuery({
    queryKey: ['behaviors', phaseId],
    queryFn: async (): Promise<Behavior[]> => {
      if (!phaseId) {
        throw new Error('Phase ID is required');
      }

      const { data, error } = await supabase
        .from('behaviors')
        .select('*')
        .eq('phase_id', phaseId)
        .order('order_index', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch behaviors: ${error.message}`);
      }

      return data as Behavior[];
    },
    enabled: !!phaseId,
  });
}

/**
 * Fetch a single behavior with all assessments
 */
export function useBehavior(behaviorId: string | undefined) {
  return useQuery({
    queryKey: ['behavior', behaviorId],
    queryFn: async () => {
      if (!behaviorId) {
        throw new Error('Behavior ID is required');
      }

      const { data, error } = await supabase
        .from('behaviors')
        .select(
          `
          *,
          time_entries(*),
          ease_scores(*),
          equity_checks(*)
        `
        )
        .eq('id', behaviorId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch behavior: ${error.message}`);
      }

      return data;
    },
    enabled: !!behaviorId,
  });
}

/**
 * Create a new behavior
 */
export function useCreateBehavior() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BehaviorInsert): Promise<Behavior> => {
      // If no order_index provided, get the max order_index and add 1
      let orderIndex = data.order_index;

      if (orderIndex === undefined) {
        const { data: existingBehaviors } = await supabase
          .from('behaviors')
          .select('order_index')
          .eq('phase_id', data.phase_id)
          .order('order_index', { ascending: false })
          .limit(1);

        orderIndex =
          existingBehaviors && existingBehaviors.length > 0
            ? existingBehaviors[0].order_index + 1
            : 0;
      }

      const { data: behavior, error } = await supabase
        .from('behaviors')
        .insert({ ...data, order_index: orderIndex })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create behavior: ${error.message}`);
      }

      return behavior as Behavior;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['behaviors', data.phase_id] });
      queryClient.invalidateQueries({ queryKey: ['phase', data.phase_id] });

      // Get audit_id from phase to invalidate audit cache
      const phase = queryClient.getQueryData<any>(['phase', data.phase_id]);
      if (phase?.audit_id) {
        queryClient.invalidateQueries({ queryKey: ['audit', phase.audit_id] });
      }
    },
  });
}

/**
 * Update a behavior
 */
export function useUpdateBehavior() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      phaseId,
      updates,
    }: {
      id: string;
      phaseId: string;
      updates: BehaviorUpdate;
    }): Promise<Behavior> => {
      const { data, error } = await supabase
        .from('behaviors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update behavior: ${error.message}`);
      }

      return data as Behavior;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['behaviors', variables.phaseId] });
      queryClient.invalidateQueries({ queryKey: ['behavior', data.id] });
      queryClient.invalidateQueries({ queryKey: ['phase', variables.phaseId] });
    },
  });
}

/**
 * Delete a behavior
 */
export function useDeleteBehavior() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      phaseId,
    }: {
      id: string;
      phaseId: string;
    }): Promise<void> => {
      const { error } = await supabase.from('behaviors').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete behavior: ${error.message}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['behaviors', variables.phaseId] });
      queryClient.invalidateQueries({ queryKey: ['phase', variables.phaseId] });
    },
  });
}

/**
 * Reorder behaviors within a phase
 */
export function useReorderBehaviors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      phaseId,
      behaviorOrders,
    }: {
      phaseId: string;
      behaviorOrders: Array<{ id: string; order_index: number }>;
    }): Promise<void> => {
      const updates = behaviorOrders.map(({ id, order_index }) =>
        supabase.from('behaviors').update({ order_index }).eq('id', id)
      );

      const results = await Promise.all(updates);

      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        throw new Error(
          `Failed to reorder behaviors: ${errors.map((e) => e.error?.message).join(', ')}`
        );
      }
    },
    onMutate: async ({ phaseId, behaviorOrders }) => {
      await queryClient.cancelQueries({ queryKey: ['behaviors', phaseId] });

      const previousBehaviors = queryClient.getQueryData<Behavior[]>(['behaviors', phaseId]);

      if (previousBehaviors) {
        const reorderedBehaviors = [...previousBehaviors].sort((a, b) => {
          const aOrder = behaviorOrders.find((b) => b.id === a.id)?.order_index ?? a.order_index;
          const bOrder = behaviorOrders.find((b) => b.id === b.id)?.order_index ?? b.order_index;
          return aOrder - bOrder;
        });

        queryClient.setQueryData(['behaviors', phaseId], reorderedBehaviors);
      }

      return { previousBehaviors, phaseId };
    },
    onError: (err, variables, context) => {
      if (context?.previousBehaviors) {
        queryClient.setQueryData(['behaviors', context.phaseId], context.previousBehaviors);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['behaviors', variables.phaseId] });
      queryClient.invalidateQueries({ queryKey: ['phase', variables.phaseId] });
    },
  });
}

/* ============================================================================
   Time Entry Operations
   ============================================================================ */

/**
 * Create or update time entry for a behavior
 */
export function useSaveTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      behaviorId,
      data,
    }: {
      behaviorId: string;
      data: Omit<TimeEntryInsert, 'behavior_id'>;
    }): Promise<TimeEntry> => {
      // Check if time entry already exists
      const { data: existing } = await supabase
        .from('time_entries')
        .select('id')
        .eq('behavior_id', behaviorId)
        .single();

      if (existing) {
        // Update existing
        const { data: updated, error } = await supabase
          .from('time_entries')
          .update(data as TimeEntryUpdate)
          .eq('behavior_id', behaviorId)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update time entry: ${error.message}`);
        }

        return updated as TimeEntry;
      } else {
        // Create new
        const { data: created, error } = await supabase
          .from('time_entries')
          .insert({ ...data, behavior_id: behaviorId })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create time entry: ${error.message}`);
        }

        return created as TimeEntry;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['behavior', variables.behaviorId] });
    },
  });
}

/* ============================================================================
   Ease Score Operations
   ============================================================================ */

/**
 * Create or update ease score for a behavior
 */
export function useSaveEaseScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      behaviorId,
      data,
    }: {
      behaviorId: string;
      data: Omit<EaseScoreInsert, 'behavior_id'>;
    }): Promise<EaseScore> => {
      // Check if ease score already exists
      const { data: existing } = await supabase
        .from('ease_scores')
        .select('id')
        .eq('behavior_id', behaviorId)
        .single();

      if (existing) {
        // Update existing
        const { data: updated, error } = await supabase
          .from('ease_scores')
          .update(data as EaseScoreUpdate)
          .eq('behavior_id', behaviorId)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update ease score: ${error.message}`);
        }

        return updated as EaseScore;
      } else {
        // Create new
        const { data: created, error } = await supabase
          .from('ease_scores')
          .insert({ ...data, behavior_id: behaviorId })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create ease score: ${error.message}`);
        }

        return created as EaseScore;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['behavior', variables.behaviorId] });
    },
  });
}

/* ============================================================================
   Equity Check Operations
   ============================================================================ */

/**
 * Create or update equity check for a behavior
 */
export function useSaveEquityCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      behaviorId,
      data,
    }: {
      behaviorId: string;
      data: Omit<EquityCheckInsert, 'behavior_id'>;
    }): Promise<EquityCheck> => {
      // Check if equity check already exists
      const { data: existing } = await supabase
        .from('equity_checks')
        .select('id')
        .eq('behavior_id', behaviorId)
        .single();

      if (existing) {
        // Update existing
        const { data: updated, error } = await supabase
          .from('equity_checks')
          .update(data as EquityCheckUpdate)
          .eq('behavior_id', behaviorId)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update equity check: ${error.message}`);
        }

        return updated as EquityCheck;
      } else {
        // Create new
        const { data: created, error } = await supabase
          .from('equity_checks')
          .insert({ ...data, behavior_id: behaviorId })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create equity check: ${error.message}`);
        }

        return created as EquityCheck;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['behavior', variables.behaviorId] });
    },
  });
}

/* ============================================================================
   Behavior Type Reference Data
   ============================================================================ */

/**
 * Fetch all behavior types (reference data)
 */
export function useBehaviorTypes() {
  return useQuery({
    queryKey: ['behavior-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('behavior_types')
        .select('*')
        .order('code', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch behavior types: ${error.message}`);
      }

      return data;
    },
    staleTime: Infinity, // Reference data doesn't change often
  });
}

/**
 * Fetch behavior types filtered by category
 */
export function useBehaviorTypesByCategory(
  category?:
    | 'information'
    | 'documentation'
    | 'decision'
    | 'communication'
    | 'processing'
    | 'verification'
    | 'waiting'
) {
  return useQuery({
    queryKey: ['behavior-types', category],
    queryFn: async () => {
      let query = supabase.from('behavior_types').select('*').order('code', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch behavior types: ${error.message}`);
      }

      return data;
    },
    staleTime: Infinity,
  });
}

/**
 * Duplicate a behavior (without assessments)
 */
export function useDuplicateBehavior() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      behaviorId,
      phaseId,
    }: {
      behaviorId: string;
      phaseId: string;
    }): Promise<Behavior> => {
      // Fetch the behavior
      const { data: original, error: fetchError } = await supabase
        .from('behaviors')
        .select('*')
        .eq('id', behaviorId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch behavior: ${fetchError.message}`);
      }

      // Get the max order index
      const { data: existingBehaviors } = await supabase
        .from('behaviors')
        .select('order_index')
        .eq('phase_id', phaseId)
        .order('order_index', { ascending: false })
        .limit(1);

      const newOrderIndex =
        existingBehaviors && existingBehaviors.length > 0
          ? existingBehaviors[0].order_index + 1
          : 0;

      // Create new behavior
      const { data: newBehavior, error: createError } = await supabase
        .from('behaviors')
        .insert({
          phase_id: phaseId,
          name: `${original.name} (Copy)`,
          description: original.description,
          reference_code: original.reference_code,
          actor_type: original.actor_type,
          behavior_type: original.behavior_type,
          order_index: newOrderIndex,
          is_required: original.is_required,
          is_digital: original.is_digital,
          notes: original.notes,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to duplicate behavior: ${createError.message}`);
      }

      return newBehavior as Behavior;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['behaviors', variables.phaseId] });
      queryClient.invalidateQueries({ queryKey: ['phase', variables.phaseId] });
    },
  });
}
