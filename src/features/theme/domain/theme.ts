export const THEMES = ['claro', 'escuro'] as const

export type Theme = (typeof THEMES)[number]

export const THEME_COOKIE = 'bloco-tema'

/**
 * A escolha de tema não expira junto com a sessão: quem entrou uma vez no
 * escuro continua no escuro depois do próximo login.
 */
export const THEME_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  path: '/',
} as const

export function isTheme(value: unknown): value is Theme {
  return THEMES.some((theme) => theme === value)
}
