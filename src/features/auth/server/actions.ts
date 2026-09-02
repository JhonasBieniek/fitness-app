'use server'

import type { Route } from 'next'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { credentialsSchema } from '@/features/auth/domain/credentials'
import { createClient } from '@/lib/supabase/server'

export type SignInState = { error: string | null }

/**
 * Destino do redirect pós-login. O valor vem da query string, então é entrada
 * do usuário: só passam caminhos internos, o que fecha a porta para open redirect.
 *
 * O cast para `Route` é necessário porque `typedRoutes` só conhece rotas
 * literais, e aqui a rota só é conhecida em tempo de execução.
 */
function safeRedirectTo(value: FormDataEntryValue | null): Route {
  const target = typeof value === 'string' ? value : '/'
  const isInternal = target.startsWith('/') && !target.startsWith('//')
  return (isInternal ? target : '/') as Route
}

export async function signIn(_state: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    // Mensagem genérica de propósito: não revelar se o e-mail existe.
    return { error: 'E-mail ou senha incorretos.' }
  }

  revalidatePath('/', 'layout')
  redirect(safeRedirectTo(formData.get('redirectTo')))
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}
