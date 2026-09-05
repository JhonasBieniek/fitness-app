'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { z } from 'zod'

import { MODE_COOKIE } from '@/features/training/server/cookies'
import { createClient } from '@/lib/supabase/server'
import { publicEnv } from '@/lib/env'
import { zonedNow } from '@/shared/lib/time'

const modeSchema = z.enum(['acompanhada', 'sozinha'])

export type TrainingMode = z.infer<typeof modeSchema>

async function requireUserId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Sessão expirada. Entre de novo.')

  return { supabase, userId: user.id }
}

/**
 * Guarda a coluna escolhida (com acompanhante ou sozinha) em cookie.
 *
 * Fica no cookie e não no banco porque a escolha é lida na renderização de toda
 * visita ao treino: uma consulta a mais só para saber qual coluna mostrar
 * atrasaria a primeira tela sem necessidade.
 *
 * Não revalida a rota de propósito. A tela já trocou de coluna sozinha — as
 * duas vêm carregadas —, e mandar o servidor renderizar tudo de novo só para
 * chegar ao mesmo resultado era o que travava o alternador.
 */
export async function setTrainingMode(mode: TrainingMode) {
  const parsed = modeSchema.safeParse(mode)
  if (!parsed.success) return

  const store = await cookies()
  store.set(MODE_COOKIE, parsed.data, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  })
}

export type ActionResult = { error: string | null }

/** Abre a sessão. O cronômetro conta a partir do `started_at` gravado aqui. */
export async function startWorkout(
  dayId: string,
  mode: TrainingMode,
  week: number,
): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireUserId()
    const today = zonedNow(new Date(), publicEnv().NEXT_PUBLIC_APP_TIMEZONE)

    const { error } = await supabase.from('workout_sessions').insert({
      user_id: userId,
      day_id: dayId,
      mode,
      local_date: today.localDate,
      week_number: week,
    })

    if (error) {
      // O índice único de sessão aberta é o que impede dois cronômetros ao mesmo tempo.
      if (error.code === '23505') return { error: 'Já existe um treino em andamento.' }
      return { error: 'Não foi possível iniciar o treino. Tente de novo.' }
    }

    revalidatePath('/treino')
    return { error: null }
  } catch {
    return { error: 'Não foi possível iniciar o treino. Tente de novo.' }
  }
}

export async function finishWorkout(sessionId: string): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireUserId()

    const { error } = await supabase
      .from('workout_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('user_id', userId)

    if (error) return { error: 'Não foi possível encerrar o treino.' }

    revalidatePath('/treino')
    return { error: null }
  } catch {
    return { error: 'Não foi possível encerrar o treino.' }
  }
}

/** Descarta a sessão inteira. Usado quando o treino foi iniciado por engano. */
export async function cancelWorkout(sessionId: string): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireUserId()

    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId)
      .is('ended_at', null)

    if (error) return { error: 'Não foi possível cancelar o treino.' }

    revalidatePath('/treino')
    return { error: null }
  } catch {
    return { error: 'Não foi possível cancelar o treino.' }
  }
}

const logSchema = z.object({
  sessionId: z.uuid(),
  dayExerciseId: z.uuid(),
  exerciseId: z.uuid(),
  done: z.boolean(),
  // Vem de um campo de texto no celular: aceita vírgula e string vazia.
  loadKg: z.union([z.string(), z.number(), z.null()]).transform((value) => {
    if (value === null || value === '') return null
    const parsed = Number(String(value).replace(',', '.'))
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
  }),
})

export type LogInput = {
  sessionId: string
  dayExerciseId: string
  exerciseId: string
  done: boolean
  loadKg: string | number | null
}

/**
 * Grava o estado de um exercício na sessão. Marcar como feito e anotar a carga
 * são a mesma escrita: separá-las duplicaria idas ao servidor no meio do treino.
 *
 * Não revalida a rota. A linha e o contador do cronômetro já se atualizaram no
 * cliente, e mandar o servidor remontar a página a cada série marcada devolvia
 * exatamente a mesma tela — com uma pausa no meio do treino como brinde.
 */
export async function saveExerciseLog(input: LogInput): Promise<ActionResult> {
  const parsed = logSchema.safeParse(input)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  try {
    const { supabase, userId } = await requireUserId()

    const { error } = await supabase.from('exercise_logs').upsert(
      {
        session_id: parsed.data.sessionId,
        user_id: userId,
        day_exercise_id: parsed.data.dayExerciseId,
        exercise_id: parsed.data.exerciseId,
        done: parsed.data.done,
        load_kg: parsed.data.loadKg,
      },
      { onConflict: 'session_id,day_exercise_id' },
    )

    if (error) return { error: 'Não foi possível salvar. Tente de novo.' }

    return { error: null }
  } catch {
    return { error: 'Não foi possível salvar. Tente de novo.' }
  }
}
