import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sem conexão' }

/**
 * Servida pelo service worker quando uma navegação falha. É estática de
 * propósito: nada aqui depende de sessão ou de banco.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-2 px-8 text-center">
      <h1 className="text-[17px] font-semibold">Sem conexão</h1>
      <p className="text-ink-2 max-w-xs text-[14px] leading-snug">
        O treino volta a aparecer assim que o sinal voltar. As fotos dos exercícios que você já
        abriu continuam disponíveis.
      </p>
    </main>
  )
}
