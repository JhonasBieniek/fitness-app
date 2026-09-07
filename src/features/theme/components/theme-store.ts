'use client'

import { useSyncExternalStore } from 'react'

import {
  isTheme,
  SYSTEM_BAR_COLOR,
  THEME_COOKIE,
  THEME_COOKIE_OPTIONS,
  THEME_STORAGE_KEY,
  type Theme,
} from '@/features/theme/domain/theme'

/**
 * Quem manda no tema depois do primeiro clique é este módulo, não o servidor.
 *
 * Antes a troca era uma Server Action com `revalidatePath`: a cor só mudava
 * depois de duas idas ao Supabase e de o servidor devolver a árvore inteira.
 * Trocar de tema é uma preferência de exibição — não precisa de rede para
 * valer. O servidor continua sendo consultado no carregamento, pelo cookie,
 * e a gravação no perfil virou sincronização de fundo.
 *
 * `null` significa "ninguém mexeu nesta sessão". Depois de um clique, o valor
 * daqui passa a ganhar — inclusive de um payload de rota reaproveitado do cache
 * do router, que traria o tema antigo de volta.
 */
let tema: Theme | null = null
const inscritos = new Set<() => void>()

function inscrever(notificar: () => void) {
  inscritos.add(notificar)
  return () => {
    inscritos.delete(notificar)
  }
}

export function aplicarTema(novo: Theme) {
  tema = novo

  document.documentElement.dataset.theme = novo
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', SYSTEM_BAR_COLOR[novo])

  const seguro = location.protocol === 'https:' ? '; secure' : ''
  document.cookie = `${THEME_COOKIE}=${novo}; path=/; max-age=${THEME_COOKIE_OPTIONS.maxAge}; samesite=lax${seguro}`

  try {
    localStorage.setItem(THEME_STORAGE_KEY, novo)
  } catch {
    // Aba anônima ou armazenamento bloqueado. O cookie já cobre a sessão.
  }

  for (const notificar of inscritos) notificar()
}

/**
 * A verdade no cliente é o `<html>`, não a prop.
 *
 * O script de restauração pode ter corrigido o tema depois de o servidor já ter
 * renderizado — é o caso do cookie expirado — e aí a prop chega errada. Quem
 * lesse só a prop mostraria "Claro" selecionado numa tela escura.
 *
 * A prop ainda serve para a hidratação: é o valor que o HTML do servidor tem, e
 * usá-lo aqui evita divergência. Logo depois o React relê o `<html>` e corrige.
 */
function lerDoDocumento(): Theme {
  const valor = document.documentElement.dataset.theme
  return isTheme(valor) ? valor : 'claro'
}

export function useTema(doServidor: Theme): Theme {
  return useSyncExternalStore(
    inscrever,
    () => tema ?? lerDoDocumento(),
    () => doServidor,
  )
}
