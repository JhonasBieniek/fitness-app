'use client'

import { useState } from 'react'

import type { ExercisePrescription } from '@/features/training/domain/block'
import { ExerciseRow } from '@/features/training/components/exercise-row'
import { ModeToggle } from '@/features/training/components/mode-toggle'
import { marcarExercicio, useMarcados } from '@/features/training/components/session-progress'
import {
  CancelWorkoutButton,
  StartWorkoutButton,
  WorkoutTimer,
} from '@/features/training/components/workout-controls'
import type { TrainingMode } from '@/features/training/server/actions'
import type { ExerciseVariant, LastLoad, OpenSession } from '@/features/training/server/queries'
import { ProtocolDial } from '@/shared/ui/protocol-dial'
import { TabRail } from '@/shared/ui/tab-rail'

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
  guidance: string | null
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

  // O que foi marcado nesta sessão. Fica fora da rota porque a rota desmonta ao
  // trocar de tela: sem isso, ir à dieta e voltar apagaria os riscos da tela.
  // É também este número que o cronômetro mostra — gravar um log não revalida
  // mais a rota, então sem um dono no cliente o contador ficaria parado.
  const doneHere = useMarcados(session?.id ?? null)

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

  // O id sai daqui em vez de sair de dentro do `map`: o retorno de chamada roda
  // depois da renderização, e ali o compilador já não sabe que há sessão.
  const sessionId = isSessionHere ? session.id : null

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
      ) : status.guidance ? (
        <p className="text-ink-2 mx-4 mb-3 text-[13px] leading-snug">{status.guidance}</p>
      ) : null}

      <TabRail
        label="Dias de treino"
        items={days.map((item) => ({
          id: String(item.weekday),
          eyebrow: WEEKDAY_SHORT[item.weekday] ?? '',
          title: item.title,
          isNow: item.weekday === todayWeekday,
          nowLabel: 'hoje',
        }))}
        selectedId={String(weekday)}
        onSelect={(id) => selectDay(Number(id))}
      />

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
              onDoneChange={(next) => {
                // Fora de uma sessão aberta a linha nem desenha a caixa.
                if (sessionId) marcarExercicio(sessionId, item.id, next)
              }}
            />
          )
        })}
      </ul>

      {isSessionHere ? (
        <div className="px-4 pt-3 pb-6">
          <CancelWorkoutButton sessionId={session.id} />
        </div>
      ) : (
        /*
          O botão fica colado acima do menu enquanto houver lista para rolar.
          `sticky`, e não `fixed`, porque o elemento continua ocupando lugar no
          fim da lista: ao chegar no fim da rolagem ele assenta ali e o último
          exercício aparece inteiro, sem precisar reservar altura no vazio.
          O deslocamento é a altura do menu, senão um cobriria o outro. E
          `mt-auto` para o dia curto, que cabe inteiro na tela: sem rolagem o
          `sticky` nunca entra em ação e o botão ficaria pendurado no meio.
        */
        <div
          className="bg-bg/90 sticky z-10 mt-auto px-4 pt-3 pb-3 backdrop-blur-md"
          style={{ bottom: 'var(--altura-do-menu)' }}
        >
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
