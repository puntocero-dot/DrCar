import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/types/database'

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // During build/prerender, env vars may not be available
    // Return a proxy that won't throw but won't work either
    return new Proxy({} as ReturnType<typeof createClientComponentClient<Database>>, {
      get: () => () => ({ data: null, error: { message: 'Supabase not configured' } }),
    })
  }
  return createClientComponentClient<Database>()
}
