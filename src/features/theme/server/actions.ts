'use server'

import { cookies } from 'next/headers'

import {
  isTheme,
  THEME_COOKIE,
  THEME_COOKIE_OPTIONS,
  type Theme,
} from '@/features/theme/domain/theme'
import { createClient } from '@/lib/supabase/server'

/**
 * Roda depois de a tela já ter trocado de tema, sem ninguém esperando.
 *
 * Faz duas coisas que o cliente não consegue: reemite o cookie pelo cabeçalho
 * da resposta — cookie vindo do servidor não sofre o corte de 7 dias que o
 * Safari aplica a cookie escrito por script — e grava a escolha no perfil, que
 * é o que o login relê para recriar o cookie em outro aparelho.
 *
 * Sem `revalidatePath` de propósito: nada na tela depende do servidor para
 * mudar de cor, e invalidar o layout inteiro jogaria fora o cache de rotas que
 * mantém a navegação instantânea.
 */
export async function sincronizarTema(theme: Theme) {
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
}
