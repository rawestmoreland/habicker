
import { useSupabase } from "@/lib/context/supabase";
import { useMutation, useQueryClient } from "react-query";

export function useUpdateHabit() {
  const { supabase } = useSupabase()

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { name?: string; description?: string } }) => await supabase?.from('habits').update(payload).eq('id', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    }
  })
}