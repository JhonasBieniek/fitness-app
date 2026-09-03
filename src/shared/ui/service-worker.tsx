'use client'

import { useEffect } from 'react'

/**
 * Registra o service worker depois que a página carrega.
 *
 * Só em produção: em desenvolvimento o cache atrapalharia mais do que ajuda,
 * servindo arquivo velho a cada recarga.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return

    const register = () => {
      void navigator.serviceWorker.register('/sw.js').catch(() => {
        // Sem service worker o app continua funcionando, só perde o modo offline.
      })
    }

    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register)

    return () => window.removeEventListener('load', register)
  }, [])

  return null
}
