import 'server-only'

import { cookies } from 'next/headers'

export const THEMES = ['claro', 'escuro'] as const

export type Theme = (typeof THEMES)[number]

export const THEME_COOKIE = 'bloco-tema'

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

  return THEMES.includes(value as Theme) ? (value as Theme) : 'claro'
}
