import { useSupabase } from "@/lib/context/supabase";
import { useMutation, useQueryClient } from "react-query";

export function useDeleteHabit() {
  const { supabase } = useSupabase()

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (habitId: string) => await supabase?.from('habits').delete().eq('id', habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  })
}