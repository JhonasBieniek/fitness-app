'use client'

import { Play } from '@phosphor-icons/react/dist/ssr'
import { useEffect, useState, useTransition } from 'react'

import { elapsedSeconds, formatDuration } from '@/features/training/domain/session'
import {
  cancelWorkout,
  finishWorkout,
  startWorkout,
  type TrainingMode,
} from '@/features/training/server/actions'

type StartButtonProps = {
  dayId: string
  mode: TrainingMode
  week: number
  disabled?: boolean
  disabledReason?: string
}

export function StartWorkoutButton({
  dayId,
  mode,
  week,
  disabled,
  disabledReason,
}: StartButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (disabled) {
    return (
      <p className="text-ink-2 border-line bg-surface-2 rounded-card border px-4 py-3 text-center text-[13px]">
        {disabledReason}
      </p>
    )
  }

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await startWorkout(dayId, mode, week)
            setError(result.error)
          })
        }
        className="bg-accent text-accent-ink rounded-card flex w-full items-center justify-center gap-2 py-3.5 text-[15px] font-semibold transition active:scale-[0.985] disabled:opacity-60"
      >
        <Play size={17} weight="fill" aria-hidden />
        {isPending ? 'Começando…' : 'Iniciar treino'}
      </button>

      {error ? (
        <p role="alert" className="text-warn mt-2 text-center text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type TimerProps = {
  sessionId: string
  startedAt: string
  done: number
  total: number
}

/**
 * Barra do treino em andamento.
 *
 * O tempo é recalculado a partir do instante de início a cada segundo, então
 * continua correto depois de o celular ficar bloqueado no bolso entre séries —
 * um contador que soma 1 a cada tique pararia junto com os timers do browser.
 */
export function WorkoutTimer({ sessionId, startedAt, done, total }: TimerProps) {
  const [seconds, setSeconds] = useState(() => elapsedSeconds(new Date(startedAt), new Date()))
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const started = new Date(startedAt)
    const tick = () => setSeconds(elapsedSeconds(started, new Date()))

    tick()
    const timer = window.setInterval(tick, 1000)
    // Voltar do segundo plano precisa corrigir o número na hora, sem esperar
    // o próximo segundo.
    document.addEventListener('visibilitychange', tick)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [startedAt])

  // Mantém a tela acesa durante o treino. Se o navegador não suportar, o treino
  // segue igual — por isso o erro é silencioso.
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null
    let released = false

    const request = async () => {
      try {
        if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return
        sentinel = await navigator.wakeLock.request('screen')
      } catch {
        sentinel = null
      }
    }

    void request()
    document.addEventListener('visibilitychange', request)

    return () => {
      released = true
      document.removeEventListener('visibilitychange', request)
      void sentinel?.release().catch(() => {})
      void released
    }
  }, [])

  return (
    <div className="border-line bg-surface sticky top-0 z-10 border-b">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="bg-accent size-2 shrink-0 rounded-full" aria-hidden />

        {/* O servidor renderiza o tempo de um instante ligeiramente anterior ao
            da hidratação; a diferença é esperada e se corrige no primeiro tique. */}
        <p
          suppressHydrationWarning
          className="tabular font-mono text-[19px] leading-none font-medium"
        >
          {formatDuration(seconds)}
          <span className="sr-only"> de treino</span>
        </p>

        <p className="text-ink-2 tabular ml-auto font-mono text-[13px]">
          {done}/{total}
        </p>

        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await finishWorkout(sessionId)
            })
          }
          className="border-line-strong rounded-full border px-3 py-1.5 text-[13px] font-medium transition active:scale-95 disabled:opacity-60"
        >
          Encerrar
        </button>
      </div>

      <div className="bg-surface-2 h-0.5 w-full">
        <div
          className="bg-accent h-full transition-[width] duration-300"
          style={{ width: `${total === 0 ? 0 : (done / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Descarta a sessão inteira.
 *
 * Fica no fim da lista, e não na barra do topo: é a saída para quem tocou em
 * "iniciar" por engano, e uma ação de desfazer não merece ocupar altura fixa na
 * tela durante o treino inteiro.
 */
export function CancelWorkoutButton({ sessionId }: { sessionId: string }) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="text-ink-3 w-full py-2 text-center text-[12.5px]"
      >
        Comecei sem querer
      </button>
    )
  }

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <span className="text-ink-2 text-[12.5px]">Descartar este treino?</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await cancelWorkout(sessionId)
          })
        }
        className="text-warn text-[12.5px] font-medium underline underline-offset-2 disabled:opacity-60"
      >
        Descartar
      </button>
      <button
        type="button"
        onClick={() => setIsConfirming(false)}
        className="text-ink-2 text-[12.5px]"
      >
        Manter
      </button>
    </div>
  )
}
