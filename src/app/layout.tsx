import type { Metadata, Viewport } from 'next'
import { Familjen_Grotesk, Geist_Mono } from 'next/font/google'

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

export const viewport: Viewport = {
  // A barra do navegador precisa acompanhar o tema, senão o app instalado fica
  // com uma faixa clara no topo em modo escuro.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF8' },
    { media: '(prefers-color-scheme: dark)', color: '#131211' },
  ],
  width: 'device-width',
  initialScale: 1,
  // O conteúdo vai até a borda; as áreas seguras são tratadas no layout.
  viewportFit: 'cover',
  // Bloquear zoom prejudica quem precisa aumentar o texto.
  maximumScale: 5,
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const theme = await getTheme()

  return (
    <html
      lang="pt-BR"
      data-theme={theme}
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-bg text-ink flex min-h-full flex-col font-sans">
        {children}
        <ServiceWorker />
      </body>
    </html>
  )
}
