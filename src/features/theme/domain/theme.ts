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

/**
 * Cópia local da preferência. O cookie sozinho não basta: o Safari — no iPhone
 * e também no PWA instalado — corta a validade de cookie escrito por script
 * para 7 dias. Sem esta cópia o tema escuro voltaria sozinho para claro depois
 * de uma semana sem abrir o app.
 */
export const THEME_STORAGE_KEY = 'bloco-tema'

/** Cor da barra do sistema. Fora daqui ela destoa do fundo no app instalado. */
export const SYSTEM_BAR_COLOR: Record<Theme, string> = {
  claro: '#FAFAF8',
  escuro: '#131211',
}

export function isTheme(value: unknown): value is Theme {
  return THEMES.some((theme) => theme === value)
}
