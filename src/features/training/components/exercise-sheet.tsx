'use client'

import { ArrowSquareOut, ListNumbers, X } from '@phosphor-icons/react/dist/ssr'
import Image from 'next/image'
import { useRef, useState, useTransition } from 'react'

import { loadExerciseHistory } from '@/features/training/server/actions'
import type { LoadHistoryEntry } from '@/features/training/server/queries'
import { cn } from '@/shared/lib/cn'

type ExerciseSheetProps = {
  exerciseId: string
  name: string
  equipment: string
  primaryMuscle: string
  cue: string | null
  steps: string[]
  start: string | null
  end: string | null
  loop: string | null
}

/** Busca a demonstração em vídeo fora do app, que é onde ela existe de graça. */
function demonstrationUrl(name: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`como fazer ${name} execução`)}`
}

function formatLoad(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',')
}

/** `2026-09-02` vira `02/09`. O ano não cabe nem faz falta numa lista de semanas. */
function formatDay(value: string) {
  const [, month, day] = value.split('-')
  return `${day}/${month}`
}

/**
 * Miniatura do exercício, que abre a folha de execução.
 *
 * A miniatura mostra a posição final, e não a inicial: é ela que identifica o
 * movimento de relance. Quem não tem foto mostra que tem passos escritos.
 *
 * A folha é um `<dialog>` nativo, como as regras da dieta: `showModal()` prende
 * o foco, fecha no Esc e deixa a lista de trás inerte — no iOS, o único jeito
 * confiável de a lista não rolar por baixo do dedo. A entrada e a saída são
 * transições de CSS sobre `[open]`, então não há estado de montagem nem
 * temporizador de segurança para uma folha presa no DOM.
 */
export function ExerciseSheet({
  exerciseId,
  name,
  equipment,
  primaryMuscle,
  cue,
  steps,
  start,
  end,
  loop,
}: ExerciseSheetProps) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const thumb = end ?? start

  // O histórico é pedido na primeira abertura e fica: quem abre a ficha de
  // novo no mesmo treino não precisa esperar de novo pela mesma lista.
  const [history, setHistory] = useState<LoadHistoryEntry[] | null>(null)
  const [isLoadingHistory, startLoadingHistory] = useTransition()

  function abrir() {
    dialogo.current?.showModal()

    if (history === null && !isLoadingHistory) {
      startLoadingHistory(async () => {
        setHistory(await loadExerciseHistory(exerciseId))
      })
    }
  }

  // As duas fotos aparecem lado a lado, e não alternadas: quem compara início e
  // fim de uma vez entende o movimento, e o acervo tem pares em que as duas
  // posições são quase iguais — alternar essas duas não mostra execução nenhuma.
  const frames = [
    { src: start, label: 'início' },
    { src: end, label: 'fim' },
  ].filter((frame): frame is { src: string; label: string } => Boolean(frame.src))

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        aria-label={`Ver execução de ${name}`}
        className="border-line bg-surface-2 relative size-14 shrink-0 overflow-hidden rounded-xl border transition active:scale-95"
      >
        {thumb ? (
          <Image
            src={thumb}
            alt=""
            width={112}
            height={112}
            // As fotos do acervo vêm de estúdios diferentes, com paredes
            // vermelhas, azuis e cinzas. Em cor, a lista vira uma colcha de
            // retalhos; em preto e branco ela lê como uma coisa só.
            className="size-full object-cover contrast-[1.08] grayscale"
            sizes="56px"
          />
        ) : (
          <span className="text-ink-3 flex size-full items-center justify-center">
            <ListNumbers size={20} aria-hidden />
          </span>
        )}
      </button>

      <dialog
        ref={dialogo}
        aria-label={`Execução de ${name}`}
        // Toque no fundo fecha. O alvo só é o próprio <dialog> quando o toque
        // cai fora da caixa: o conteúdo é um filho e para nele.
        onClick={(event) => {
          if (event.target === dialogo.current) dialogo.current?.close()
        }}
        className="folha bg-bg text-ink mx-auto mt-auto mb-0 flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-3xl p-0"
      >
        <div className="flex items-start gap-3 px-5 pt-4 pb-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] leading-tight font-semibold tracking-tight">{name}</h2>
            <p className="text-ink-3 mt-1 font-mono text-[11.5px] tracking-wide uppercase">
              {primaryMuscle} · {equipment}
            </p>
          </div>

          <button
            type="button"
            onClick={() => dialogo.current?.close()}
            aria-label="Fechar"
            className="bg-surface-2 text-ink-2 shrink-0 rounded-full p-2 transition active:scale-95"
          >
            <X size={16} weight="bold" aria-hidden />
          </button>
        </div>

        <div
          className="overflow-y-auto overscroll-contain px-5 pb-5"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          {loop ? (
            <Image
              src={loop}
              alt={`Execução de ${name}`}
              width={720}
              height={480}
              unoptimized
              className="rounded-card aspect-[3/2] w-full object-cover"
            />
          ) : frames.length > 0 ? (
            <ul className={cn('grid gap-2', frames.length > 1 && 'grid-cols-2')}>
              {frames.map((frame) => (
                <li key={frame.label} className="relative">
                  <Image
                    src={frame.src}
                    alt={`${name}: posição de ${frame.label}`}
                    width={420}
                    height={280}
                    sizes="(max-width: 420px) 45vw, 190px"
                    className="rounded-card aspect-[3/2] w-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[10.5px] tracking-wide text-white uppercase">
                    {frame.label}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-line text-ink-3 rounded-card border border-dashed px-3.5 py-3 text-[12.5px] leading-snug">
              Não temos foto fiel deste exercício. Os passos abaixo valem mais que uma foto de outro
              movimento.
            </p>
          )}

          {cue ? (
            <p className="bg-accent-soft text-accent rounded-card mt-3 px-3.5 py-2.5 text-[13.5px] leading-snug font-medium">
              {cue}
            </p>
          ) : null}

          {steps.length > 0 ? (
            <ol className="divide-line mt-3 divide-y">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3 py-2.5 first:pt-0">
                  <span className="text-ink-3 tabular mt-px shrink-0 font-mono text-[12px]">
                    {index + 1}
                  </span>
                  <span className="text-[14px] leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          ) : null}

          <section aria-label="Cargas anteriores" className="mt-4">
            <h3 className="text-ink-3 font-mono text-[11px] tracking-wider uppercase">Cargas</h3>

            {history === null ? (
              <ul aria-hidden className="mt-2 flex flex-col gap-2">
                {[0, 1, 2].map((item) => (
                  <li key={item} className="bg-surface-2 h-3.5 animate-pulse rounded" />
                ))}
              </ul>
            ) : history.length === 0 ? (
              <p className="text-ink-3 mt-1.5 text-[12.5px] leading-snug">
                Nenhuma carga anotada ainda. A primeira aparece aqui depois do treino.
              </p>
            ) : (
              <ol className="divide-line mt-1 divide-y">
                {history.map((entry, index) => (
                  <li
                    key={`${entry.onDate}-${index}`}
                    className="flex items-baseline justify-between py-2 text-[13px]"
                  >
                    <span className="text-ink-2 tabular font-mono text-[12px]">
                      {formatDay(entry.onDate)}
                    </span>
                    <span className="tabular font-mono font-medium">
                      {formatLoad(entry.loadKg)} <span className="text-ink-3 font-normal">kg</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <a
            href={demonstrationUrl(name)}
            target="_blank"
            rel="noopener noreferrer"
            className="border-line-strong rounded-card mt-4 flex items-center justify-center gap-2 border py-3 text-[14px] font-medium transition active:scale-[0.985]"
          >
            Ver demonstração em vídeo
            <ArrowSquareOut size={15} aria-hidden className="text-ink-3" />
          </a>
          <p className="text-ink-3 mt-1.5 text-center text-[11.5px]">Abre fora do app.</p>
        </div>
      </dialog>
    </>
  )
}
