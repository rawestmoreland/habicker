import { useSupabase } from '@/lib/context/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateHabitTracking() {
  const { supabase } = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) =>
      await supabase?.from('habit_trackings').insert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}
