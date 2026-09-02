import 'server-only'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export type SessionUser = {
  id: string
  email: string
  displayName: string
}

/**
 * Usuário da requisição atual, ou `null`. Usa `getUser`, que valida o token no
 * servidor do Supabase — `getSession` apenas lê o cookie e é falsificável.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return null

  return {
    id: user.id,
    email: user.email,
    displayName:
      (user.user_metadata?.display_name as string | undefined) ?? user.email.split('@')[0]!,
  }
}

/** Igual a `getCurrentUser`, mas exige sessão. Use em páginas privadas. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}
