import { useSupabase } from '@/lib/context/supabase';
import { useQueryClient, useMutation } from '@tanstack/react-query';

export function useDeleteHabitTracking() {
  const { supabase } = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitTrackingId: string | number) =>
      await supabase
        ?.from('habit_trackings')
        .delete()
        .eq('id', habitTrackingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}
