'use client'

/**
 * Rede de segurança para qualquer tela que quebrar ao renderizar — a causa mais
 * comum é reabrir o app com a conexão ainda subindo, no meio de uma consulta ao
 * Supabase. Sem este arquivo, o Next não tinha limite nenhum: o erro chegava
 * cru até a Vercel, que mostra a própria tela genérica no lugar do app.
 */
export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 px-8 text-center">
      <h1 className="text-[17px] font-semibold">Não foi desta vez</h1>
      <p className="text-ink-2 max-w-xs text-[14px] leading-snug">
        Algo falhou ao carregar esta tela, provavelmente a conexão. Tenta de novo.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-accent text-accent-ink mt-1 rounded-full px-5 py-2.5 text-[14px] font-medium transition active:scale-95"
      >
        Tentar de novo
      </button>
    </main>
  )
}
