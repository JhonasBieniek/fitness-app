'use client'

import { Play } from '@phosphor-icons/react/dist/ssr'
import { useEffect, useState, useTransition } from 'react'

import { elapsedSeconds, formatDuration, sessionProgress } from '@/features/training/domain/session'
import {
  cancelWorkout,
  finishWorkout,
  startWorkout,
  type TrainingMode,
} from '@/features/training/server/actions'
import { cn } from '@/shared/lib/cn'

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
  const progress = sessionProgress(done, total)
  // Encerrar com exercício faltando pede um segundo toque. O botão fica ao lado
  // do contador durante o treino inteiro, e um esbarrão não pode fechar a
  // sessão: ela não reabre. Com tudo feito, um toque basta.
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    if (!isConfirming) return

    const timer = window.setTimeout(() => setIsConfirming(false), 4000)
    return () => window.clearTimeout(timer)
  }, [isConfirming])

  function finish() {
    startTransition(async () => {
      await finishWorkout(sessionId)
    })
  }

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
    let unmounted = false

    const request = async () => {
      try {
        if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return
        const lock = await navigator.wakeLock.request('screen')
        // O pedido pode voltar depois de o treino ter sido encerrado: soltar
        // aqui, senão a tela ficaria acesa sem cronômetro nenhum na tela.
        if (unmounted) void lock.release().catch(() => {})
        else sentinel = lock
      } catch {
        sentinel = null
      }
    }

    void request()
    document.addEventListener('visibilitychange', request)

    return () => {
      unmounted = true
      document.removeEventListener('visibilitychange', request)
      void sentinel?.release().catch(() => {})
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
          {progress.done}/{progress.total}
        </p>

        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (progress.isComplete || isConfirming) finish()
            else setIsConfirming(true)
          }}
          className={cn(
            'rounded-full border px-3 py-1.5 text-[13px] font-medium transition active:scale-95 disabled:opacity-60',
            isConfirming ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong',
          )}
        >
          {isConfirming ? 'Confirmar' : 'Encerrar'}
        </button>
      </div>

      <div className="bg-surface-2 h-0.5 w-full">
        <div
          className="bg-accent h-full transition-[width] duration-300"
          style={{ width: `${progress.ratio * 100}%` }}
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
