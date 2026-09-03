'use client'

import { Check } from '@phosphor-icons/react/dist/ssr'
import { useState, useTransition } from 'react'

import type { ExercisePrescription } from '@/features/training/domain/block'
import { saveExerciseLog } from '@/features/training/server/actions'
import type { ExerciseVariant, LastLoad } from '@/features/training/server/queries'
import { cn } from '@/shared/lib/cn'

import { ExerciseMedia } from './exercise-media'

type ExerciseRowProps = {
  dayExerciseId: string
  variant: ExerciseVariant
  prescription: ExercisePrescription
  restSeconds: number | null
  note: string | null
  lastLoad: LastLoad | undefined
  session: { id: string; done: boolean; loadKg: number | null } | null
}

function formatLoad(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',')
}

/**
 * Uma linha da lista de exercícios.
 *
 * Fora da sessão mostra só a prescrição: é o que a pessoa lê para saber o que
 * vem. Durante a sessão ganha a marcação de feito e o campo de carga, que só
 * fazem sentido com o treino rodando.
 */
export function ExerciseRow({
  dayExerciseId,
  variant,
  prescription,
  restSeconds,
  note,
  lastLoad,
  session,
}: ExerciseRowProps) {
  const [done, setDone] = useState(session?.done ?? false)
  const [load, setLoad] = useState(
    session?.loadKg === null || session?.loadKg === undefined ? '' : formatLoad(session.loadKg),
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function persist(next: { done: boolean; loadKg: string }) {
    if (!session) return

    startTransition(async () => {
      const result = await saveExerciseLog({
        sessionId: session.id,
        dayExerciseId,
        exerciseId: variant.id,
        done: next.done,
        loadKg: next.loadKg === '' ? null : next.loadKg,
      })

      setError(result.error)
    })
  }

  function toggleDone() {
    // O estado muda na hora e a gravação vai atrás: entre uma série e outra,
    // esperar a rede para ver o risco aparecer seria irritante.
    const next = !done
    setDone(next)
    persist({ done: next, loadKg: load })
  }

  const isDropped = prescription.dropped

  return (
    <li
      className={cn(
        'border-line flex gap-3 border-b px-4 py-3.5 last:border-b-0',
        isDropped && 'opacity-55',
      )}
    >
      <ExerciseMedia
        name={variant.name}
        cue={variant.cue}
        start={variant.mediaStart}
        end={variant.mediaEnd}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                'text-[15px] leading-tight font-semibold',
                done && 'text-ink-2 line-through decoration-1',
              )}
            >
              {variant.name}
            </h3>

            <p className="text-ink-2 tabular mt-1 font-mono text-[12.5px] leading-none">
              {isDropped ? (
                'fora desta semana'
              ) : (
                <>
                  {prescription.sets} × {prescription.reps}
                  {restSeconds ? <span className="text-ink-3"> · {restSeconds}s</span> : null}
                </>
              )}
            </p>
          </div>

          {session && !isDropped ? (
            <button
              type="button"
              onClick={toggleDone}
              aria-pressed={done}
              aria-label={done ? `Desmarcar ${variant.name}` : `Marcar ${variant.name} como feito`}
              className={cn(
                'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border transition active:scale-90',
                done ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong text-ink-3',
                isPending && 'opacity-60',
              )}
            >
              <Check size={16} weight="bold" aria-hidden />
            </button>
          ) : null}
        </div>

        {note ? <p className="text-ink-2 mt-1.5 text-[12.5px] leading-snug">{note}</p> : null}

        {session && !isDropped ? (
          <div className="mt-2.5 flex items-center gap-2">
            <label className="flex items-center gap-1.5">
              <span className="sr-only">Carga usada em {variant.name}</span>
              <input
                type="text"
                inputMode="decimal"
                value={load}
                placeholder="—"
                onChange={(event) => setLoad(event.target.value)}
                onBlur={() => persist({ done, loadKg: load })}
                className="border-line bg-surface-2 tabular focus:border-accent w-16 rounded-lg border px-2 py-1 text-center font-mono text-[13px] outline-none"
              />
              <span className="text-ink-2 font-mono text-[12px]">kg</span>
            </label>

            {lastLoad ? (
              <span className="text-ink-3 tabular font-mono text-[12px]">
                última {formatLoad(lastLoad.loadKg)} kg
              </span>
            ) : (
              <span className="text-ink-3 text-[12px]">primeira vez</span>
            )}
          </div>
        ) : lastLoad ? (
          <p className="text-ink-3 tabular mt-1.5 font-mono text-[12px]">
            última carga {formatLoad(lastLoad.loadKg)} kg
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="text-warn mt-1.5 text-[12.5px]">
            {error}
          </p>
        ) : null}
      </div>
    </li>
  )
}
