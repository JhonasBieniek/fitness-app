'use client'

import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import type { ExercisePrescription } from '@/features/training/domain/block'
import { ExerciseRow } from '@/features/training/components/exercise-row'
import { ModeToggle } from '@/features/training/components/mode-toggle'
import {
  CancelWorkoutButton,
  StartWorkoutButton,
  WorkoutTimer,
} from '@/features/training/components/workout-controls'
import type { TrainingMode } from '@/features/training/server/actions'
import type { ExerciseVariant, LastLoad, OpenSession } from '@/features/training/server/queries'
import { cn } from '@/shared/lib/cn'
import { ProtocolDial } from '@/shared/ui/protocol-dial'

const WEEKDAY_SHORT = ['', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'] as const

export type BoardExercise = {
  id: string
  prescription: ExercisePrescription
  restSeconds: number | null
  note: string | null
  partnered: ExerciseVariant
  solo: ExerciseVariant | null
}

export type BoardDay = {
  id: string
  weekday: number
  title: string
  focus: string | null
  durationMinutes: number | null
  exercises: BoardExercise[]
}

export type BoardStatus = {
  week: number
  totalWeeks: number
  phaseLabel: string
  guidance: string
  isExpired: boolean
  weeksOverdue: number
}

type TrainingBoardProps = {
  days: BoardDay[]
  initialWeekday: number
  todayWeekday: number
  status: BoardStatus
  session: OpenSession | null
  lastLoads: Record<string, LastLoad>
  initialMode: TrainingMode
  canChooseMode: boolean
}

/**
 * Abas dos dias e a lista do dia em foco.
 *
 * Os cinco dias chegam prontos do servidor, então trocar de aba é trocar o que
 * está na tela — sem ida ao banco e sem espera. Antes cada aba era um link para
 * a mesma rota com outro parâmetro: a consulta que já trazia a semana inteira
 * era refeita a cada toque, e o toque travava.
 *
 * O mesmo vale para Acompanhada/Sozinha: as duas colunas vêm juntas, e alternar
 * troca o nome do exercício na hora. O cookie é gravado em segundo plano, só
 * para a próxima visita abrir do jeito certo.
 */
export function TrainingBoard({
  days,
  initialWeekday,
  todayWeekday,
  status,
  session,
  lastLoads,
  initialMode,
  canChooseMode,
}: TrainingBoardProps) {
  const [weekday, setWeekday] = useState(initialWeekday)
  const [mode, setMode] = useState(initialMode)

  // O que foi marcado nesta sessão, aqui e não em cada linha: é este número que
  // o cronômetro mostra. Como gravar um log não revalida mais a rota, sem isto
  // o contador ficaria parado enquanto a pessoa treina.
  const [doneHere, setDoneHere] = useState<Record<string, boolean>>({})
  const [trackedSession, setTrackedSession] = useState(session?.id ?? null)

  // Sessão nova começa com tudo desmarcado.
  if (trackedSession !== (session?.id ?? null)) {
    setTrackedSession(session?.id ?? null)
    setDoneHere({})
  }

  const railRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Centraliza a aba aberta só na montagem: na sexta a aba certa nasce fora da
  // tela. Recentralizar a cada toque faria a faixa fugir do dedo.
  useEffect(() => {
    const rail = railRef.current
    const active = activeRef.current
    if (!rail || !active) return

    rail.scrollTo({
      left: active.offsetLeft - rail.clientWidth / 2 + active.clientWidth / 2,
      behavior: 'instant',
    })
  }, [])

  function selectDay(next: number) {
    setWeekday(next)

    // Mantém o dia na URL sem navegar: recarregar ou compartilhar continua
    // abrindo no mesmo dia, e nada disso custa uma requisição.
    const url = new URL(window.location.href)
    url.searchParams.set('dia', String(next))
    window.history.replaceState(null, '', url)
  }

  const day = days.find((item) => item.weekday === weekday) ?? days[0]
  if (!day) return null

  const isSessionHere = session !== null && session.dayId === day.id
  const sessionMode = isSessionHere ? session.mode : mode

  function isDone(exerciseId: string) {
    if (!isSessionHere) return false
    return doneHere[exerciseId] ?? session.logs[exerciseId]?.done ?? false
  }

  const activeCount = day.exercises.filter((item) => !item.prescription.dropped).length
  const doneCount = day.exercises.filter(
    (item) => !item.prescription.dropped && isDone(item.id),
  ).length

  return (
    <>
      <header className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <ProtocolDial
          week={status.week}
          totalWeeks={status.totalWeeks}
          className="text-accent size-7"
        />

        <div className="min-w-0 flex-1">
          <p className="tabular font-mono text-[12px] leading-none tracking-wide uppercase">
            Semana {Math.min(status.week, status.totalWeeks)} de {status.totalWeeks}
          </p>
          <p className="text-ink-2 mt-1 truncate text-[13px] leading-none">{status.phaseLabel}</p>
        </div>

        {canChooseMode ? <ModeToggle mode={mode} onChange={setMode} /> : null}
      </header>

      {status.isExpired ? (
        <p className="bg-warn-soft text-warn rounded-card mx-4 mb-3 px-3.5 py-2.5 text-[13px] leading-snug">
          O bloco de {status.totalWeeks} semanas terminou há{' '}
          {status.weeksOverdue === 1 ? 'uma semana' : `${status.weeksOverdue} semanas`}. Dá para
          continuar treinando com ele, mas o próximo bloco rende mais.
        </p>
      ) : (
        <p className="text-ink-2 mx-4 mb-3 text-[13px] leading-snug">{status.guidance}</p>
      )}

      <div
        ref={railRef}
        role="tablist"
        aria-label="Dias de treino"
        className="no-scrollbar border-line flex gap-1 overflow-x-auto border-b [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] px-3"
      >
        {days.map((item) => {
          const isSelected = item.weekday === weekday

          return (
            <button
              key={item.id}
              ref={isSelected ? activeRef : undefined}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => selectDay(item.weekday)}
              className={cn(
                'relative shrink-0 px-3 pt-2.5 pb-3 text-left transition-colors',
                isSelected ? 'text-ink' : 'text-ink-3',
              )}
            >
              <span className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] tracking-wider uppercase">
                  {WEEKDAY_SHORT[item.weekday]}
                </span>
                {item.weekday === todayWeekday ? (
                  <span className="bg-accent size-1.5 rounded-full" aria-label="hoje" />
                ) : null}
              </span>

              <span className="mt-0.5 block text-[14px] leading-tight font-semibold whitespace-nowrap">
                {item.title}
              </span>

              {isSelected ? (
                <motion.span
                  layoutId="aba-ativa"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="bg-accent absolute inset-x-3 -bottom-px h-0.5 rounded-full"
                />
              ) : null}
            </button>
          )
        })}
      </div>

      {isSessionHere ? (
        <WorkoutTimer
          sessionId={session.id}
          startedAt={session.startedAt}
          done={doneCount}
          total={activeCount}
        />
      ) : null}

      <div className="flex items-baseline justify-between px-4 pt-4 pb-1">
        <h1 className="text-[20px] leading-tight font-semibold tracking-tight">{day.title}</h1>
        <p className="text-ink-3 tabular font-mono text-[12px]">
          {day.focus ? `${day.focus} · ` : ''}
          {day.durationMinutes ? `${day.durationMinutes} min` : ''}
        </p>
      </div>

      <ul className="mt-1">
        {day.exercises.map((item) => {
          const variant = sessionMode === 'sozinha' && item.solo ? item.solo : item.partnered
          const log = isSessionHere ? session.logs[item.id] : undefined

          return (
            <ExerciseRow
              key={`${item.id}-${variant.id}`}
              dayExerciseId={item.id}
              variant={variant}
              prescription={item.prescription}
              restSeconds={item.restSeconds}
              note={item.note}
              lastLoad={lastLoads[variant.id]}
              session={
                isSessionHere
                  ? { id: session.id, done: isDone(item.id), loadKg: log?.loadKg ?? null }
                  : null
              }
              onDoneChange={(next) => setDoneHere((current) => ({ ...current, [item.id]: next }))}
            />
          )
        })}
      </ul>

      {isSessionHere ? (
        <div className="px-4 pt-3">
          <CancelWorkoutButton sessionId={session.id} />
        </div>
      ) : (
        <div className="px-4 pt-5">
          <StartWorkoutButton
            dayId={day.id}
            mode={sessionMode}
            week={status.week}
            disabled={session !== null}
            disabledReason={
              session !== null
                ? 'Há um treino em andamento em outro dia. Encerre antes de começar este.'
                : undefined
            }
          />
        </div>
      )}
    </>
  )
}
