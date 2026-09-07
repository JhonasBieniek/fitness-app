'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import {
  isTheme,
  THEME_COOKIE,
  THEME_COOKIE_OPTIONS,
  type Theme,
} from '@/features/theme/domain/theme'
import { createClient } from '@/lib/supabase/server'

/**
 * Grava o tema no cookie, que é o que a renderização lê, e no perfil, que é o
 * que o login relê para recriar o cookie em outro aparelho. O cookie sozinho
 * bastaria para a tela deste celular; o perfil é o que sobrevive a trocar dele.
 */
export async function setTheme(theme: Theme) {
  if (!isTheme(theme)) return

  const store = await cookies()
  store.set(THEME_COOKIE, theme, THEME_COOKIE_OPTIONS)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.from('profiles').update({ theme }).eq('id', user.id)
  }

  revalidatePath('/', 'layout')
}
