import { useAuth } from "@/lib/context/auth"
import { useSupabase } from "@/lib/context/supabase"
import { useMutation, useQueryClient } from "react-query"

export function useCreateHabit() {
  const { supabase } = useSupabase()
  const queryClient = useQueryClient()

  const { session } = useAuth()

  return useMutation({
    mutationFn: async (payload: any) => await supabase?.from('habits').insert({ ...payload, user_id: session?.user.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    }
  })
}