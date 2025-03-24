import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Medicine, Category } from '@/lib/types';

export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchMedicines();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Categories error:', error);
      toast.error('Error fetching categories');
    }
  };

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*, category:categories(*)')
        .order('name');

      if (error) throw error;
      setMedicines(data || []);
    } catch (error) {
      console.error('Medicines error:', error);
      toast.error('Error fetching medicines');
    } finally {
      setLoading(false);
    }
  };

  const searchMedicines = async (query: string, filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    requiresPrescription?: boolean;
    sortBy?: string;
  } = {}) => {
    try {
      setLoading(true);

      let queryBuilder = supabase
        .from('medicines')
        .select('*, category:categories(*)');

      // Apply filters one by one, checking for undefined values
      if (query?.trim()) {
        queryBuilder = queryBuilder.ilike('name', `%${query.trim()}%`);
      }

      if (filters.category && filters.category !== 'all') {
        queryBuilder = queryBuilder.eq('category_id', filters.category);
      }

      if (typeof filters.minPrice === 'number' && filters.minPrice > 0) {
        queryBuilder = queryBuilder.gte('price', filters.minPrice);
      }

      if (typeof filters.maxPrice === 'number' && filters.maxPrice < 1000) {
        queryBuilder = queryBuilder.lte('price', filters.maxPrice);
      }

      if (typeof filters.requiresPrescription === 'boolean') {
        queryBuilder = queryBuilder.eq('requires_prescription', filters.requiresPrescription);
      }

      // Apply sorting
      const sortOrder = { ascending: filters.sortBy?.includes('-asc') };
      switch (filters.sortBy?.split('-')[0]) {
        case 'name':
          queryBuilder = queryBuilder.order('name', sortOrder);
          break;
        case 'price':
          queryBuilder = queryBuilder.order('price', sortOrder);
          break;
        case 'manufacturer':
          queryBuilder = queryBuilder.order('manufacturer', sortOrder);
          break;
        default:
          queryBuilder = queryBuilder.order('name', { ascending: true });
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw error;
      }

      // Post-process the data for price sorting if needed
      if (filters.sortBy?.startsWith('price')) {
        const sortedData = [...(data || [])].sort((a, b) => {
          const priceA = a.discount_price || a.price;
          const priceB = b.discount_price || b.price;
          return filters.sortBy?.includes('-asc') 
            ? priceA - priceB 
            : priceB - priceA;
        });
        setMedicines(sortedData);
      } else {
        setMedicines(data || []);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Error searching medicines');
    } finally {
      setLoading(false);
    }
  };

  return {
    medicines,
    categories,
    loading,
    searchMedicines,
  };
}