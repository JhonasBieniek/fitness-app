import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { getProfile } from '@/features/profile/server/queries'
import { resolveBlockStatus, resolvePrescription } from '@/features/training/domain/block'
import { TrainingBoard, type BoardDay } from '@/features/training/components/training-board'
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
  // Tudo em paralelo: são quatro idas ao banco, e encadeá-las somaria as
  // latências na primeira tela, que é a que a pessoa espera olhando.
  const [params, profile, block, openSession, lastLoads, cookieStore] = await Promise.all([
    searchParams,
    getProfile(),
    getActiveBlock(),
    getOpenSession(),
    getLastLoads(),
    cookies(),
  ])

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

  // A prescrição de todos os dias sai aqui, de uma vez: é cálculo puro sobre
  // dados que já estão em mãos, e resolver os cinco permite ao cliente trocar
  // de aba sem voltar ao servidor.
  const days: BoardDay[] = block.days.map((day) => ({
    id: day.id,
    weekday: day.weekday,
    title: day.title,
    focus: day.focus,
    durationMinutes: day.durationMinutes,
    exercises: day.exercises.map((exercise) => ({
      id: exercise.id,
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
      restSeconds: exercise.restSeconds,
      note: exercise.note,
      partnered: exercise.partnered,
      solo: exercise.solo,
    })),
  }))

  return (
    <main className="flex flex-1 flex-col pb-6">
      <TrainingBoard
        days={days}
        initialWeekday={selectedDay.weekday}
        todayWeekday={todayWeekday}
        status={{
          week: status.week,
          totalWeeks: status.totalWeeks,
          phaseLabel: status.phase.label,
          guidance: status.phase.guidance,
          isExpired: status.isExpired,
          weeksOverdue: status.weeksOverdue,
        }}
        session={openSession}
        lastLoads={lastLoads}
        initialMode={mode}
        canChooseMode={profile?.level === 'iniciante'}
      />
    </main>
  )
}
