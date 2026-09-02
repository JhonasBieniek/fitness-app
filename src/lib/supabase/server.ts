import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { publicEnv } from '@/lib/env'

import type { Database } from './database.types'

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * Toda leitura passa por RLS: o usuário só enxerga as próprias linhas.
 */
export async function createClient() {
  const env = publicEnv()

  const cookieStore = await cookies()

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // Server Components não podem escrever cookies. O middleware já
            // renovou a sessão antes de chegar aqui, então isso é seguro.
          }
        },
      },
    },
  )
}
