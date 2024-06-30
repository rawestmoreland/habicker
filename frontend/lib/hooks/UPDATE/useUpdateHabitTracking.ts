import { useSupabase } from "@/lib/context/supabase";
import { useMutation, useQueryClient } from "react-query";

export function useUpdateHabitTracking() {
  const { supabase } = useSupabase()

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: String; payload: { note?: string, completed_on_date?: boolean } }) => await supabase?.from('habit_trackings').update(payload).eq('id', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    }
  })
}