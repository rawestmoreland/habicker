import { useSupabase } from "@/lib/context/supabase";
import { useQueryClient, useMutation } from "react-query";

export function useDeleteHabitTracking() {
  const { supabase } = useSupabase()
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitTrackingId: string) => await supabase?.from('habit_trackings').delete().eq('id', habitTrackingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}