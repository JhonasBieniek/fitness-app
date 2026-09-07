import type { Metadata, Viewport } from 'next'
import { Familjen_Grotesk, Geist_Mono } from 'next/font/google'

import {
  SYSTEM_BAR_COLOR,
  THEME_COOKIE,
  THEME_COOKIE_OPTIONS,
  THEME_STORAGE_KEY,
} from '@/features/theme/domain/theme'
import { getTheme } from '@/features/theme/server/theme'
import { ServiceWorker } from '@/shared/ui/service-worker'

import './globals.css'

// Grotesca com desenho próprio para tudo que é texto, e uma monoespaçada para
// tudo que é número: carga, horário, semana, cronômetro. A monoespaçada é a
// escolha tipográfica que dá caráter ao app, não um detalhe de dados.
const sans = Familjen_Grotesk({
  variable: '--font-familjen',
  subsets: ['latin'],
  display: 'swap',
})

const mono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Bloco', template: '%s · Bloco' },
  description: 'Treino e alimentação do dia, em um protocolo de 12 semanas.',
  applicationName: 'Bloco',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Bloco',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icones/marca.svg', type: 'image/svg+xml' },
      { url: '/icones/icone-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icones/apple-touch-icon.png',
  },
  formatDetection: { telephone: false },
}

export async function generateViewport(): Promise<Viewport> {
  // A barra do sistema segue a escolha da pessoa, não a do aparelho. Quem
  // escolhe escuro num celular configurado em claro via uma faixa clara no topo
  // do app instalado.
  return {
    themeColor: SYSTEM_BAR_COLOR[await getTheme()],
    width: 'device-width',
    initialScale: 1,
    // O conteúdo vai até a borda; as áreas seguras são tratadas no layout.
    viewportFit: 'cover',
    // Bloquear zoom prejudica quem precisa aumentar o texto.
    maximumScale: 5,
  }
}

const RESTAURAR_TEMA = `
try {
  var chave = ${JSON.stringify(THEME_STORAGE_KEY)}
  var noCookie = document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/)
  // O cookie manda quando existe: é ele que o servidor acabou de renderizar, e
  // é ele que o login regrava a partir do perfil ao entrar em outro aparelho.
  // A cópia local só resgata quando o cookie sumiu.
  var tema = noCookie ? decodeURIComponent(noCookie[1]) : localStorage.getItem(chave)

  if (tema === 'claro' || tema === 'escuro') {
    document.documentElement.dataset.theme = tema
    localStorage.setItem(chave, tema)
    document.cookie = ${JSON.stringify(THEME_COOKIE)} + '=' + tema + ';path=/;max-age=${THEME_COOKIE_OPTIONS.maxAge};samesite=lax' +
      (location.protocol === 'https:' ? ';secure' : '')
    var barra = document.querySelector('meta[name="theme-color"]')
    if (barra) barra.content = ${JSON.stringify(SYSTEM_BAR_COLOR)}[tema]
  }
} catch (e) {}
`

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const theme = await getTheme()

  return (
    <html
      lang="pt-BR"
      data-theme={theme}
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Roda antes da primeira pintura e resgata o tema quando o cookie some
          mas a cópia local sobrevive — o caso do Safari, que expira em 7 dias
          o cookie escrito por script. Sem isto o app instalado voltaria
          sozinho para o tema claro depois de uma semana parado. Fazer o mesmo
          em um efeito do React chegaria tarde: a tela clara já teria piscado.
        */}
        <script dangerouslySetInnerHTML={{ __html: RESTAURAR_TEMA }} />
      </head>
      <body className="bg-bg text-ink flex min-h-full flex-col font-sans">
        {children}
        <ServiceWorker />
      </body>
    </html>
  )
}
