import { useSupabase } from '@/lib/context/supabase';
import { useQuery } from '@tanstack/react-query';

export function useGetUserHabits() {
  const { supabase } = useSupabase();

  return useQuery({
    queryKey: ['habits'],
    queryFn: async () =>
      await supabase?.from('habits').select('*, habit_trackings(*)'),
    enabled: !!supabase,
  });
}
