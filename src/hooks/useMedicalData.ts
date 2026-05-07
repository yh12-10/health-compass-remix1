import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DBSymptom {
  id: string;
  name: string;
  name_ar: string | null;
  category_id: string;
  category_name: string;
}

export interface DBCategory {
  id: string;
  name: string;
  display_order: number;
}

export function useSymptomCategories() {
  return useQuery({
    queryKey: ['symptom_categories'],
    queryFn: async (): Promise<DBCategory[]> => {
      const { data, error } = await supabase
        .from('symptom_categories')
        .select('id, name, display_order')
        .order('display_order');
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

export function useSymptoms() {
  return useQuery({
    queryKey: ['symptoms'],
    queryFn: async (): Promise<DBSymptom[]> => {
      const { data, error } = await supabase
        .from('symptoms')
        .select('id, name, name_ar, category_id, symptom_categories(name)');
      if (error) throw error;
      return (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        name_ar: s.name_ar,
        category_id: s.category_id,
        category_name: s.symptom_categories?.name || '',
      }));
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}
