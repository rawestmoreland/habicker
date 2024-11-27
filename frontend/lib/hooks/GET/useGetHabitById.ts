import { useSupabase } from '@/lib/context/supabase';
import { useQuery } from '@tanstack/react-query';

export function useGetHabitById(id: string) {
  const { supabase } = useSupabase();

  return useQuery({
    queryKey: ['habit', id],
    queryFn: async () =>
      await supabase
        ?.from('habits')
        .select('*, habit_trackings(*)')
        .eq('id', id)
        .maybeSingle(),
    enabled: !!supabase,
  });
}
