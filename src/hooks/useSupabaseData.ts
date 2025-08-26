import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

// Generic hook for fetching data from Supabase
export function useSupabaseData<T extends keyof Tables>(
  tableName: T,
  options?: {
    select?: string;
    filter?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  const [data, setData] = useState<Tables[T]['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [tableName, JSON.stringify(options)]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured() || !supabase) {
        console.log('Supabase not configured');
        setData([]);
        setLoading(false);
        return;
      }

      let query = supabase.from(tableName).select(options?.select || '*');

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
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching data:', err);
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

// Hook for getting price between two locations
export function usePrice(fromLocationId: string, toLocationId: string, vehicleTypeId: string) {
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fromLocationId && toLocationId && vehicleTypeId) {
      fetchPrice();
    }
  }, [fromLocationId, toLocationId, vehicleTypeId]);

  const fetchPrice = async () => {
    try {
      setLoading(true);
      
      if (!isSupabaseConfigured() || !supabase) {
        setPrice(0);
        return;
      }

      const { data, error } = await supabase
        .from('price_rules')
        .select('price')
        .eq('from_location_id', fromLocationId)
        .eq('to_location_id', toLocationId)
        .eq('vehicle_type_id', vehicleTypeId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching price:', error);
        setPrice(0);
        return;
      }

      setPrice(data?.price || 0);
    } catch (err) {
      console.error('Error fetching price:', err);
      setPrice(0);
    } finally {
      setLoading(false);
    }
  };

  return { price, loading };
}