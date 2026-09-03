import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { getProfile } from '@/features/profile/server/queries'
import { resolveBlockStatus, resolvePrescription } from '@/features/training/domain/block'
import { sessionProgress } from '@/features/training/domain/session'
import { DayTabs } from '@/features/training/components/day-tabs'
import { ExerciseRow } from '@/features/training/components/exercise-row'
import { ModeToggle } from '@/features/training/components/mode-toggle'
import {
  CancelWorkoutButton,
  StartWorkoutButton,
  WorkoutTimer,
} from '@/features/training/components/workout-controls'
import { type TrainingMode } from '@/features/training/server/actions'
import { MODE_COOKIE } from '@/features/training/server/cookies'
import { getActiveBlock, getLastLoads, getOpenSession } from '@/features/training/server/queries'
import { publicEnv } from '@/lib/env'
import { ProtocolDial } from '@/shared/ui/protocol-dial'
import { zonedNow, WEEKDAYS } from '@/shared/lib/time'

export const metadata: Metadata = { title: 'Treino' }

// O treino do dia depende da hora do acesso, então a rota nunca é estática.
export const dynamic = 'force-dynamic'

/** `zonedNow` devolve o dia por nome; o banco guarda o padrão ISO 1–7. */
function isoWeekday(weekday: (typeof WEEKDAYS)[number]): number {
  const index = WEEKDAYS.indexOf(weekday)
  return index === 0 ? 7 : index
}

export default async function TreinoPage({ searchParams }: PageProps<'/treino'>) {
  const [params, profile, block, openSession, cookieStore] = await Promise.all([
    searchParams,
    getProfile(),
    getActiveBlock(),
    getOpenSession(),
    cookies(),
  ])

  const lastLoads = await getLastLoads(openSession?.id)

  const now = zonedNow(new Date(), profile?.timeZone ?? publicEnv().NEXT_PUBLIC_APP_TIMEZONE)
  const todayWeekday = isoWeekday(now.weekday)

  if (!block || block.days.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
        <ProtocolDial className="text-ink-3 size-8" />
        <h1 className="mt-2 text-[17px] font-semibold">Nenhum bloco ativo</h1>
        <p className="text-ink-2 text-[14px] leading-snug">
          Assim que um protocolo for cadastrado, o treino de cada dia aparece aqui.
        </p>
      </main>
    )
  }

  const status = resolveBlockStatus(block.startedOn, now.localDate, block.totalWeeks)

  // Se hoje não é dia de treino, abre no próximo dia com treino em vez de uma
  // tela vazia — quem abre no domingo quer ver o que vem na segunda.
  const requested = Number(typeof params.dia === 'string' ? params.dia : NaN)
  const fallbackDay =
    block.days.find((day) => day.weekday === todayWeekday) ??
    block.days.find((day) => day.weekday > todayWeekday) ??
    block.days[0]!

  const selectedDay = block.days.find((day) => day.weekday === requested) ?? fallbackDay

  const savedMode = cookieStore.get(MODE_COOKIE)?.value
  const mode: TrainingMode = savedMode === 'sozinha' ? 'sozinha' : 'acompanhada'
  const canChooseMode = profile?.level === 'iniciante'

  const isSessionOnThisDay = openSession?.dayId === selectedDay.id
  const sessionMode = isSessionOnThisDay ? openSession.mode : mode

  const prescriptions = selectedDay.exercises.map((exercise) => ({
    exercise,
    prescription: resolvePrescription(
      {
        sets: exercise.sets,
        reps: exercise.reps,
        strengthSets: exercise.strengthSets,
        strengthReps: exercise.strengthReps,
        skipOnDeload: exercise.skipOnDeload,
      },
      status.phase.phase,
    ),
  }))

  const activeCount = prescriptions.filter(({ prescription }) => !prescription.dropped).length
  const doneCount = isSessionOnThisDay
    ? prescriptions.filter(
        ({ exercise, prescription }) =>
          !prescription.dropped && openSession.logs[exercise.id]?.done,
      ).length
    : 0

  const progress = sessionProgress(doneCount, activeCount)

  return (
    <main className="flex flex-1 flex-col pb-6">
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
          <p className="text-ink-2 mt-1 truncate text-[13px] leading-none">{status.phase.label}</p>
        </div>

        {canChooseMode ? <ModeToggle mode={mode} /> : null}
      </header>

      {status.isExpired ? (
        <p className="bg-warn-soft text-warn rounded-card mx-4 mb-3 px-3.5 py-2.5 text-[13px] leading-snug">
          O bloco de {status.totalWeeks} semanas terminou há{' '}
          {status.weeksOverdue === 1 ? 'uma semana' : `${status.weeksOverdue} semanas`}. Dá para
          continuar treinando com ele, mas o próximo bloco rende mais.
        </p>
      ) : (
        <p className="text-ink-2 mx-4 mb-3 text-[13px] leading-snug">{status.phase.guidance}</p>
      )}

      <DayTabs
        days={block.days}
        selectedWeekday={selectedDay.weekday}
        todayWeekday={todayWeekday}
      />

      {isSessionOnThisDay ? (
        <WorkoutTimer
          sessionId={openSession.id}
          startedAt={openSession.startedAt}
          done={progress.done}
          total={progress.total}
        />
      ) : null}

      <div className="flex items-baseline justify-between px-4 pt-4 pb-1">
        <h1 className="text-[20px] leading-tight font-semibold tracking-tight">
          {selectedDay.title}
        </h1>
        <p className="text-ink-3 tabular font-mono text-[12px]">
          {selectedDay.focus ? `${selectedDay.focus} · ` : ''}
          {selectedDay.durationMinutes ? `${selectedDay.durationMinutes} min` : ''}
        </p>
      </div>

      <ul className="mt-1">
        {prescriptions.map(({ exercise, prescription }) => {
          const variant =
            sessionMode === 'sozinha' && exercise.solo ? exercise.solo : exercise.partnered
          const log = isSessionOnThisDay ? openSession.logs[exercise.id] : undefined

          return (
            <ExerciseRow
              key={exercise.id}
              dayExerciseId={exercise.id}
              variant={variant}
              prescription={prescription}
              restSeconds={exercise.restSeconds}
              note={exercise.note}
              lastLoad={lastLoads[variant.id]}
              session={
                isSessionOnThisDay
                  ? {
                      id: openSession.id,
                      done: log?.done ?? false,
                      loadKg: log?.loadKg ?? null,
                    }
                  : null
              }
            />
          )
        })}
      </ul>

      {isSessionOnThisDay ? (
        <div className="px-4 pt-3">
          <CancelWorkoutButton sessionId={openSession.id} />
        </div>
      ) : (
        <div className="px-4 pt-5">
          <StartWorkoutButton
            dayId={selectedDay.id}
            mode={sessionMode}
            week={status.week}
            disabled={Boolean(openSession)}
            disabledReason={
              openSession
                ? 'Há um treino em andamento em outro dia. Encerre antes de começar este.'
                : undefined
            }
          />
        </div>
      )}
    </main>
  )
}
