import 'server-only'

import { cookies } from 'next/headers'

import { isTheme, THEME_COOKIE, type Theme } from '@/features/theme/domain/theme'

/**
 * O tema é lido de um cookie no servidor e aplicado no `<html>` já no HTML
 * inicial. Ler do `localStorage` no cliente causaria um piscar de tela clara
 * antes do tema escuro entrar, que é exatamente o defeito que se nota à noite.
 *
 * O padrão é claro por decisão de produto, não por preferência do sistema.
 */
export async function getTheme(): Promise<Theme> {
  const store = await cookies()

  const value = store.get(THEME_COOKIE)?.value

  return isTheme(value) ? value : 'claro'
}
