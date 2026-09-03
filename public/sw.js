/*
 * Service worker do Bloco.
 *
 * Guarda apenas o que é público e imutável: as fotos dos exercícios, os ícones
 * e os arquivos versionados do Next. HTML de página nunca é guardado — ele traz
 * dados de uma pessoa autenticada, e cache compartilhado com conteúdo de conta
 * é como um usuário acaba vendo os dados do outro.
 *
 * Sem rede, uma navegação cai na página offline, que é estática.
 */

const VERSION = 'bloco-v1'
const ASSETS = `${VERSION}-assets`
const SHELL = `${VERSION}-shell`

const OFFLINE_URL = '/offline'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll([OFFLINE_URL, '/icones/icone-192.png']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

/** Arquivos públicos e estáveis: vale servir do cache e atualizar por trás. */
function isCacheableAsset(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/exercicios/') ||
      url.pathname.startsWith('/icones/') ||
      url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/_next/image'))
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Só GET. Um POST guardado seria uma carga gravada duas vezes.
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(SHELL)
        return (await cache.match(OFFLINE_URL)) ?? Response.error()
      }),
    )
    return
  }

  if (!isCacheableAsset(url)) return

  event.respondWith(
    caches.open(ASSETS).then(async (cache) => {
      const cached = await cache.match(request)

      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone())
          return response
        })
        .catch(() => cached ?? Response.error())

      // Serve o que já está guardado e revalida em segundo plano: a foto do
      // exercício aparece na hora, mesmo com sinal ruim na academia.
      return cached ?? network
    }),
  )
})
