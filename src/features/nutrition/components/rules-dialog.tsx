'use client'

import { Question, X } from '@phosphor-icons/react/dist/ssr'
import { useRef } from 'react'

import type { PlanNote } from '@/features/nutrition/server/queries'

/**
 * As regras do plano, atrás de um toque no topo da rota.
 *
 * São seis frases que não mudam nunca e que a pessoa lê uma vez. Ocupando uma
 * seção fixa no fim da tela, custavam altura todo dia para responder uma
 * pergunta que quase nunca é feita.
 *
 * `<dialog>` nativo com `showModal()`: o fundo fica inerte por conta do
 * navegador — nada atrás recebe toque —, o foco fica preso dentro e Esc fecha.
 * Uma biblioteca de modal faria o mesmo com mais quilobytes.
 */
export function RulesDialog({ rules }: { rules: PlanNote[] }) {
  const dialogo = useRef<HTMLDialogElement>(null)

  if (rules.length === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        className="text-ink-2 -mr-1 flex shrink-0 items-center gap-1 rounded-full px-1 py-0.5 text-[13px] font-medium transition active:scale-95"
      >
        Regras
        <Question size={15} weight="regular" aria-hidden />
        <span className="sr-only">— abrir as regras do plano</span>
      </button>

      <dialog
        ref={dialogo}
        aria-labelledby="titulo-das-regras"
        // Clique no fundo fecha. O alvo só é o próprio <dialog> quando o toque
        // cai fora da caixa: o conteúdo é um filho e para nele.
        onClick={(event) => {
          if (event.target === dialogo.current) dialogo.current?.close()
        }}
        className="bg-surface text-ink rounded-card m-auto w-[calc(100vw-2rem)] max-w-md p-0 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.28)]"
      >
        <div className="flex max-h-[80dvh] flex-col">
          <header className="border-line flex items-center justify-between gap-3 border-b px-4 py-3">
            <h2 id="titulo-das-regras" className="text-[16px] font-semibold tracking-tight">
              Regras do plano
            </h2>

            <button
              type="button"
              onClick={() => dialogo.current?.close()}
              aria-label="Fechar"
              className="text-ink-2 -mr-1.5 rounded-full p-1.5 transition active:scale-90"
            >
              <X size={17} weight="bold" aria-hidden />
            </button>
          </header>

          <dl className="divide-line divide-y overflow-y-auto overscroll-contain px-4">
            {rules.map((rule) => (
              <div key={rule.id} className="py-3">
                <dt className="text-[13.5px] font-semibold">{rule.title}</dt>
                <dd className="text-ink-2 mt-0.5 text-[13.5px] leading-snug">{rule.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </dialog>
    </>
  )
}
