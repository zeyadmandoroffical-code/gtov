'use client'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_KEY, SUPABASE_URL } from './env'

let client: SupabaseClient | null = null

/** Logged-in client for the admin dashboard (session lives in cookies). */
export function browserClient() {
  if (!client) client = createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
  return client
}
