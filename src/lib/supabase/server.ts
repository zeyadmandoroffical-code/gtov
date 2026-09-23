import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_KEY, SUPABASE_URL } from './env'

/** Cookie-aware client for route handlers / server components (admin checks). */
export async function serverClient() {
  const store = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          /* called from a server component: the proxy refreshes the session instead */
        }
      },
    },
  })
}

export async function requireAdmin() {
  const sb = await serverClient()
  const { data } = await sb.rpc('is_admin')
  return data === true ? sb : null
}
