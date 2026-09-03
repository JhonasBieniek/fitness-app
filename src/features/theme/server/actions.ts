'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { THEMES, THEME_COOKIE, type Theme } from '@/features/theme/server/theme'
import { createClient } from '@/lib/supabase/server'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

/**
 * Grava o tema no cookie, que é o que a renderização lê, e no perfil, que é o
 * que faz a escolha acompanhar a pessoa em outro aparelho. O cookie sozinho
 * bastaria para a tela; o perfil é o que sobrevive a trocar de celular.
 */
export async function setTheme(theme: Theme) {
  if (!THEMES.includes(theme)) return

  const store = await cookies()
  store.set(THEME_COOKIE, theme, {
    maxAge: ONE_YEAR_SECONDS,
    sameSite: 'lax',
    path: '/',
  })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.from('profiles').update({ theme }).eq('id', user.id)
  }

  revalidatePath('/', 'layout')
}
