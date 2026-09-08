import type { MetadataRoute } from 'next'

import { SYSTEM_BAR_COLOR } from '@/features/theme/domain/theme'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bloco — treino e dieta',
    short_name: 'Bloco',
    description: 'O treino do dia e a refeição do horário, dentro de um protocolo de 12 semanas.',
    start_url: '/treino',
    // Abre sem barra de navegador: instalado, precisa parecer um app.
    display: 'standalone',
    orientation: 'portrait',
    // A cor do tema claro, que é o padrão do app: o instalador só lê o
    // manifesto uma vez, antes de saber a preferência de quem instala.
    background_color: SYSTEM_BAR_COLOR.claro,
    theme_color: SYSTEM_BAR_COLOR.claro,
    lang: 'pt-BR',
    dir: 'ltr',
    categories: ['health', 'fitness', 'lifestyle'],
    icons: [
      { src: '/icones/icone-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icones/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // A versão mascarável tem margem de sobra para o launcher recortar como quiser.
      {
        src: '/icones/icone-mascarado-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icones/icone-mascarado-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      { name: 'Treino de hoje', url: '/treino' },
      { name: 'Alimentação', url: '/dieta' },
    ],
  }
}
