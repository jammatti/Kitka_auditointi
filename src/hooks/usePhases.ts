/* ============================================================================
   Phase Hooks
   React Query hooks for managing phase data
   ============================================================================ */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { Phase } from '../types';

type PhaseRow = Database['public']['Tables']['phases']['Row'];
type PhaseInsert = Database['public']['Tables']['phases']['Insert'];
type PhaseUpdate = Database['public']['Tables']['phases']['Update'];

/**
 * Fetch all phases for an audit
 */
export function usePhases(auditId: string | undefined) {
  return useQuery({
    queryKey: ['phases', auditId],
    queryFn: async (): Promise<Phase[]> => {
      if (!auditId) {
        throw new Error('Audit ID is required');
      }

      const { data, error } = await supabase
        .from('phases')
        .select('*')
        .eq('audit_id', auditId)
        .order('order_index', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch phases: ${error.message}`);
      }

      return data as Phase[];
    },
    enabled: !!auditId,
  });
}

/**
 * Fetch a single phase with all behaviors
 */
export function usePhase(phaseId: string | undefined) {
  return useQuery({
    queryKey: ['phase', phaseId],
    queryFn: async (): Promise<PhaseRow & { behaviors: any[] }> => {
      if (!phaseId) {
        throw new Error('Phase ID is required');
      }

      const { data, error } = await supabase
        .from('phases')
        .select(
          `
          *,
          behaviors(
            *,
            time_entries(*),
            ease_scores(*),
            equity_checks(*)
          )
        `
        )
        .eq('id', phaseId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch phase: ${error.message}`);
      }

      return data;
    },
    enabled: !!phaseId,
  });
}

/**
 * Create a new phase
 */
export function useCreatePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PhaseInsert): Promise<Phase> => {
      // If no order_index provided, get the max order_index and add 1
      let orderIndex = data.order_index;

      if (orderIndex === undefined) {
        const { data: existingPhases } = await supabase
          .from('phases')
          .select('order_index')
          .eq('audit_id', data.audit_id)
          .order('order_index', { ascending: false })
          .limit(1);

        orderIndex = existingPhases && existingPhases.length > 0
          ? existingPhases[0].order_index + 1
          : 0;
      }

      const { data: phase, error } = await supabase
        .from('phases')
        .insert({ ...data, order_index: orderIndex })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create phase: ${error.message}`);
      }

      return phase as Phase;
    },
    onSuccess: (data) => {
      // Invalidate phases list and audit details
      queryClient.invalidateQueries({ queryKey: ['phases', data.audit_id] });
      queryClient.invalidateQueries({ queryKey: ['audit', data.audit_id] });
    },
  });
}

/**
 * Update a phase
 */
export function useUpdatePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      auditId,
      updates,
    }: {
      id: string;
      auditId: string;
      updates: PhaseUpdate;
    }): Promise<Phase> => {
      const { data, error } = await supabase
        .from('phases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update phase: ${error.message}`);
      }

      return data as Phase;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ['phases', variables.auditId] });
      queryClient.invalidateQueries({ queryKey: ['phase', data.id] });
      queryClient.invalidateQueries({ queryKey: ['audit', variables.auditId] });
    },
  });
}

/**
 * Delete a phase
 */
export function useDeletePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, auditId }: { id: string; auditId: string }): Promise<void> => {
      const { error } = await supabase.from('phases').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete phase: ${error.message}`);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate phases list and audit
      queryClient.invalidateQueries({ queryKey: ['phases', variables.auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit', variables.auditId] });
    },
  });
}

/**
 * Reorder phases within an audit
 */
export function useReorderPhases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      auditId,
      phaseOrders,
    }: {
      auditId: string;
      phaseOrders: Array<{ id: string; order_index: number }>;
    }): Promise<void> => {
      // Update each phase with new order_index
      const updates = phaseOrders.map(({ id, order_index }) =>
        supabase.from('phases').update({ order_index }).eq('id', id)
      );

      const results = await Promise.all(updates);

      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        throw new Error(
          `Failed to reorder phases: ${errors.map((e) => e.error?.message).join(', ')}`
        );
      }
    },
    onMutate: async ({ auditId, phaseOrders }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['phases', auditId] });

      // Snapshot the previous value
      const previousPhases = queryClient.getQueryData<Phase[]>(['phases', auditId]);

      // Optimistically update to the new value
      if (previousPhases) {
        const reorderedPhases = [...previousPhases].sort((a, b) => {
          const aOrder = phaseOrders.find((p) => p.id === a.id)?.order_index ?? a.order_index;
          const bOrder = phaseOrders.find((p) => p.id === b.id)?.order_index ?? b.order_index;
          return aOrder - bOrder;
        });

        queryClient.setQueryData(['phases', auditId], reorderedPhases);
      }

      // Return context with previous value
      return { previousPhases, auditId };
    },
    onError: (err, variables, context) => {
      // If mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPhases) {
        queryClient.setQueryData(['phases', context.auditId], context.previousPhases);
      }
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['phases', variables.auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit', variables.auditId] });
    },
  });
}

/**
 * Duplicate a phase (with all its behaviors)
 */
export function useDuplicatePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      phaseId,
      auditId,
    }: {
      phaseId: string;
      auditId: string;
    }): Promise<Phase> => {
      // Fetch the phase with all behaviors
      const { data: originalPhase, error: fetchError } = await supabase
        .from('phases')
        .select(
          `
          *,
          behaviors(*)
        `
        )
        .eq('id', phaseId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch phase: ${fetchError.message}`);
      }

      // Get the max order index
      const { data: existingPhases } = await supabase
        .from('phases')
        .select('order_index')
        .eq('audit_id', auditId)
        .order('order_index', { ascending: false })
        .limit(1);

      const newOrderIndex =
        existingPhases && existingPhases.length > 0
          ? existingPhases[0].order_index + 1
          : 0;

      // Create new phase
      const { data: newPhase, error: createError } = await supabase
        .from('phases')
        .insert({
          audit_id: auditId,
          name: `${originalPhase.name} (Copy)`,
          description: originalPhase.description,
          order_index: newOrderIndex,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create phase: ${createError.message}`);
      }

      // Duplicate behaviors if any
      if (originalPhase.behaviors && originalPhase.behaviors.length > 0) {
        const newBehaviors = originalPhase.behaviors.map((behavior: any, index: number) => ({
          phase_id: newPhase.id,
          name: behavior.name,
          description: behavior.description,
          reference_code: behavior.reference_code,
          actor_type: behavior.actor_type,
          behavior_type: behavior.behavior_type,
          order_index: index,
          is_required: behavior.is_required,
          is_digital: behavior.is_digital,
          notes: behavior.notes,
        }));

        const { error: behaviorsError } = await supabase
          .from('behaviors')
          .insert(newBehaviors);

        if (behaviorsError) {
          console.error('Failed to duplicate behaviors:', behaviorsError);
        }
      }

      return newPhase as Phase;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phases', variables.auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit', variables.auditId] });
    },
  });
}
