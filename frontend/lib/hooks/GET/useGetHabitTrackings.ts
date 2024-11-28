import { useSupabase } from '@/lib/context/supabase';
import { useQuery } from '@tanstack/react-query';

export function useGetHabitTrackings(habitId: string) {
  const { supabase } = useSupabase();

  return useQuery({
    queryKey: ['habit-trackings', { habitId }],
    queryFn: async () =>
      await supabase
        ?.from('habit_trackings')
        .select('*')
        .eq('habit_id', habitId),
    enabled: !!supabase,
  });
}
