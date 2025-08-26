import { useState, useEffect } from 'react';
import { adminSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

// Admin hook that uses service role key
export function useAdminData<T extends keyof Tables>(
  tableName: T,
  options?: {
    select?: string;
    filter?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [tableName, JSON.stringify(options)]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured() || !adminSupabase) {
        console.log('Supabase not configured for admin operations');
        setData([]);
        setError('Supabase yapılandırması bulunamadı. Lütfen "Connect to Supabase" butonuna tıklayın.');
        setLoading(false);
        return;
      }

      let query = adminSupabase.from(tableName).select(options?.select || '*');

      // Apply filters
      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        });
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setData(result || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching admin data:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

// Admin operations using service role key
export const adminOperations = {
  // Create
  async create<T extends keyof Tables>(
    tableName: T, 
    data: Tables[T]['Insert']
  ): Promise<{ data: any; error: any }> {
    if (!isSupabaseConfigured() || !adminSupabase) {
      return { 
        data: null, 
        error: { message: 'Supabase yapılandırması bulunamadı. Lütfen "Connect to Supabase" butonuna tıklayın.' }
      };
    }
    
    try {
      const result = await adminSupabase.from(tableName).insert(data).select().single();
      return result;
    } catch (error) {
      console.error('Admin create error:', error);
      return { data: null, error };
    }
  },

  // Update
  async update<T extends keyof Tables>(
    tableName: T, 
    id: string, 
    data: Tables[T]['Update']
  ): Promise<{ data: any; error: any }> {
    if (!isSupabaseConfigured() || !adminSupabase) {
      return { 
        data: null, 
        error: { message: 'Supabase yapılandırması bulunamadı. Lütfen "Connect to Supabase" butonuna tıklayın.' }
      };
    }
    
    try {
      const result = await adminSupabase.from(tableName).update(data).eq('id', id).select().single();
      return result;
    } catch (error) {
      console.error('Admin update error:', error);
      return { data: null, error };
    }
  },

  // Delete
  async delete<T extends keyof Tables>(
    tableName: T, 
    id: string
  ): Promise<{ data: any; error: any }> {
    if (!isSupabaseConfigured() || !adminSupabase) {
      return { 
        data: null, 
        error: { message: 'Supabase yapılandırması bulunamadı. Lütfen "Connect to Supabase" butonuna tıklayın.' }
      };
    }
    
    try {
      const result = await adminSupabase.from(tableName).delete().eq('id', id);
      return result;
    } catch (error) {
      console.error('Admin delete error:', error);
      return { data: null, error };
    }
  },

  // Toggle status
  async toggleStatus<T extends keyof Tables>(
    tableName: T, 
    id: string, 
    currentStatus: boolean
  ): Promise<{ data: any; error: any }> {
    if (!isSupabaseConfigured() || !adminSupabase) {
      return { 
        data: null, 
        error: { message: 'Supabase yapılandırması bulunamadı. Lütfen "Connect to Supabase" butonuna tıklayın.' }
      };
    }
    
    try {
      const result = await adminSupabase
        .from(tableName)
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id);
      return result;
    } catch (error) {
      console.error('Admin toggle status error:', error);
      return { data: null, error };
    }
  }
};