// Supabase JS client — solo para prod (auth, storage, realtime)
// Consultas de DB: usar lib/db/client.ts → getDb()
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Server Actions / API routes — service key, omite RLS
export function createServerClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY!)
}

// Browser / client components — publishable key (antes "anon key")
export function createBrowserClient() {
  return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
}
