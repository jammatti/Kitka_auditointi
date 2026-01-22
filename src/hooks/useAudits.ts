/* ============================================================================
   Audit Hooks
   React Query hooks for managing audit data
   ============================================================================ */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { Audit, AuditFilters, Phase, Behavior } from '../types';

type AuditRow = Database['public']['Tables']['audits']['Row'];
type AuditInsert = Database['public']['Tables']['audits']['Insert'];
type AuditUpdate = Database['public']['Tables']['audits']['Update'];
type PhaseRow = Database['public']['Tables']['phases']['Row'];
type BehaviorRow = Database['public']['Tables']['behaviors']['Row'];

// Extended audit type with related data
export interface AuditWithDetails extends AuditRow {
  phases?: (PhaseRow & { behaviors?: BehaviorRow[] })[];
  member_count?: number;
  completion_percentage?: number;
}

/**
 * Fetch all audits for the current user's organization
 */
export function useAudits(filters?: AuditFilters) {
  return useQuery({
    queryKey: ['audits', filters],
    queryFn: async (): Promise<Audit[]> => {
      let query = supabase
        .from('audits')
        .select(
          `
          *,
          profiles!audits_created_by_fkey(name),
          audit_members(count)
        `
        )
        .order('updated_at', { ascending: false });

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.organization_id) {
        query = query.eq('organization_id', filters.organization_id);
      }

      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      if (filters?.search) {
        query = query.or(
          `process_name.ilike.%${filters.search}%,team_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch audits: ${error.message}`);
      }

      return data as Audit[];
    },
  });
}

/**
 * Fetch a single audit with all related data
 */
export function useAudit(auditId: string | undefined) {
  return useQuery({
    queryKey: ['audit', auditId],
    queryFn: async (): Promise<AuditWithDetails> => {
      if (!auditId) {
        throw new Error('Audit ID is required');
      }

      const { data, error } = await supabase
        .from('audits')
        .select(
          `
          *,
          profiles!audits_created_by_fkey(name, email),
          audit_members(
            id,
            role,
            invited_at,
            accepted_at,
            profiles(name, email)
          ),
          phases(
            *,
            behaviors(
              *,
              time_entries(*),
              ease_scores(*),
              equity_checks(*)
            )
          ),
          wage_rates(*)
        `
        )
        .eq('id', auditId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch audit: ${error.message}`);
      }

      return data as AuditWithDetails;
    },
    enabled: !!auditId,
  });
}

/**
 * Create a new audit
 */
export function useCreateAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AuditInsert): Promise<Audit> => {
      // Create the audit
      const { data: audit, error: auditError } = await supabase
        .from('audits')
        .insert(data)
        .select()
        .single();

      if (auditError) {
        throw new Error(`Failed to create audit: ${auditError.message}`);
      }

      // Add creator as audit owner
      const { error: memberError } = await supabase.from('audit_members').insert({
        audit_id: audit.id,
        user_id: data.created_by,
        role: 'owner',
        invited_by: data.created_by,
      });

      if (memberError) {
        console.error('Failed to add audit member:', memberError);
      }

      // Add default wage rates (Finnish context)
      const defaultWageRates = [
        {
          audit_id: audit.id,
          actor_type: 'customer',
          hourly_rate: 21.93,
          notes: 'Keskimääräinen suomalainen tuntipalkka',
        },
        {
          audit_id: audit.id,
          actor_type: 'caseworker',
          hourly_rate: 25.3,
          notes: 'KVTES virkailijapalkka',
        },
        {
          audit_id: audit.id,
          actor_type: 'specialist',
          hourly_rate: 30.75,
          notes: 'KVTES erikoisvirkailija',
        },
        {
          audit_id: audit.id,
          actor_type: 'external_partner',
          hourly_rate: 20.36,
          notes: 'Ulkopuolinen palveluntarjoaja',
        },
      ];

      const { error: wageRateError } = await supabase
        .from('wage_rates')
        .insert(defaultWageRates);

      if (wageRateError) {
        console.error('Failed to add default wage rates:', wageRateError);
      }

      return audit as Audit;
    },
    onSuccess: () => {
      // Invalidate audits list to refetch
      queryClient.invalidateQueries({ queryKey: ['audits'] });
    },
  });
}

/**
 * Update an existing audit
 */
export function useUpdateAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: AuditUpdate;
    }): Promise<Audit> => {
      const { data, error } = await supabase
        .from('audits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update audit: ${error.message}`);
      }

      return data as Audit;
    },
    onSuccess: (data) => {
      // Update both the list and the individual audit cache
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['audit', data.id] });
    },
  });
}

/**
 * Delete an audit
 */
export function useDeleteAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (auditId: string): Promise<void> => {
      const { error } = await supabase.from('audits').delete().eq('id', auditId);

      if (error) {
        throw new Error(`Failed to delete audit: ${error.message}`);
      }
    },
    onSuccess: () => {
      // Invalidate audits list
      queryClient.invalidateQueries({ queryKey: ['audits'] });
    },
  });
}

/**
 * Fetch audit members
 */
export function useAuditMembers(auditId: string | undefined) {
  return useQuery({
    queryKey: ['audit-members', auditId],
    queryFn: async () => {
      if (!auditId) {
        throw new Error('Audit ID is required');
      }

      const { data, error } = await supabase
        .from('audit_members')
        .select(
          `
          *,
          profiles(name, email),
          invited_by_profile:profiles!audit_members_invited_by_fkey(name)
        `
        )
        .eq('audit_id', auditId);

      if (error) {
        throw new Error(`Failed to fetch audit members: ${error.message}`);
      }

      return data;
    },
    enabled: !!auditId,
  });
}

/**
 * Add a member to an audit
 */
export function useAddAuditMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      auditId,
      userId,
      role,
      invitedBy,
    }: {
      auditId: string;
      userId: string;
      role: 'owner' | 'editor' | 'contributor' | 'viewer';
      invitedBy: string;
    }) => {
      const { data, error } = await supabase
        .from('audit_members')
        .insert({
          audit_id: auditId,
          user_id: userId,
          role,
          invited_by: invitedBy,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add audit member: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['audit-members', variables.auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit', variables.auditId] });
    },
  });
}

/**
 * Update audit member role
 */
export function useUpdateAuditMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      auditId,
      role,
    }: {
      memberId: string;
      auditId: string;
      role: 'owner' | 'editor' | 'contributor' | 'viewer';
    }) => {
      const { data, error } = await supabase
        .from('audit_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update audit member: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['audit-members', variables.auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit', variables.auditId] });
    },
  });
}

/**
 * Remove a member from an audit
 */
export function useRemoveAuditMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, auditId }: { memberId: string; auditId: string }) => {
      const { error } = await supabase.from('audit_members').delete().eq('id', memberId);

      if (error) {
        throw new Error(`Failed to remove audit member: ${error.message}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['audit-members', variables.auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit', variables.auditId] });
    },
  });
}

/**
 * Fetch wage rates for an audit
 */
export function useWageRates(auditId: string | undefined) {
  return useQuery({
    queryKey: ['wage-rates', auditId],
    queryFn: async () => {
      if (!auditId) {
        throw new Error('Audit ID is required');
      }

      const { data, error } = await supabase
        .from('wage_rates')
        .select('*')
        .eq('audit_id', auditId);

      if (error) {
        throw new Error(`Failed to fetch wage rates: ${error.message}`);
      }

      return data;
    },
    enabled: !!auditId,
  });
}

/**
 * Update wage rates for an audit
 */
export function useUpdateWageRates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      auditId,
      rates,
    }: {
      auditId: string;
      rates: Array<{
        actor_type: string;
        hourly_rate: number;
        notes?: string;
      }>;
    }) => {
      // Delete existing rates
      await supabase.from('wage_rates').delete().eq('audit_id', auditId);

      // Insert new rates
      const { data, error } = await supabase
        .from('wage_rates')
        .insert(
          rates.map((rate) => ({
            audit_id: auditId,
            ...rate,
          }))
        )
        .select();

      if (error) {
        throw new Error(`Failed to update wage rates: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wage-rates', variables.auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit', variables.auditId] });
    },
  });
}
