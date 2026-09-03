import 'server-only'

import { createClient } from '@/lib/supabase/server'

export type ExerciseVariant = {
  id: string
  slug: string
  name: string
  equipment: string
  primaryMuscle: string
  mediaStart: string | null
  mediaEnd: string | null
  /** Animação licenciada, quando houver. Tem precedência sobre as fotos. */
  mediaLoop: string | null
  cue: string | null
  steps: string[]
}

export type TrainingExercise = {
  id: string
  position: number
  sets: number
  reps: string
  restSeconds: number | null
  note: string | null
  strengthSets: number | null
  strengthReps: string | null
  skipOnDeload: boolean
  partnered: ExerciseVariant
  /** Ausente quando o movimento é o mesmo nas duas colunas. */
  solo: ExerciseVariant | null
}

export type TrainingDay = {
  id: string
  weekday: number
  title: string
  focus: string | null
  durationMinutes: number | null
  exercises: TrainingExercise[]
}

export type TrainingBlock = {
  id: string
  name: string
  startedOn: string
  totalWeeks: number
  days: TrainingDay[]
}

export type OpenSession = {
  id: string
  dayId: string
  mode: 'acompanhada' | 'sozinha'
  startedAt: string
  logs: Record<string, { done: boolean; loadKg: number | null; reps: number | null }>
}

type ExerciseRow = {
  id: string
  slug: string
  name: string
  equipment: string
  primary_muscle: string
  media_start_path: string | null
  media_end_path: string | null
  media_loop_path: string | null
  cue: string | null
  steps: string[] | null
}

function toVariant(row: ExerciseRow | null): ExerciseVariant | null {
  if (!row) return null

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    equipment: row.equipment,
    primaryMuscle: row.primary_muscle,
    mediaStart: row.media_start_path,
    mediaEnd: row.media_end_path,
    mediaLoop: row.media_loop_path,
    cue: row.cue,
    steps: row.steps ?? [],
  }
}

const EXERCISE_FIELDS =
  'id, slug, name, equipment, primary_muscle, media_start_path, media_end_path, media_loop_path, cue, steps'

/**
 * Bloco ativo com todos os dias e a prescrição de cada exercício.
 *
 * Vem em uma consulta só: são cinco dias e trinta linhas, e o app precisa dos
 * cinco para montar as abas de qualquer forma. Buscar dia a dia custaria uma
 * ida ao banco a cada toque na aba.
 */
export async function getActiveBlock(): Promise<TrainingBlock | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('training_blocks')
    .select(
      `id, name, started_on, total_weeks,
       training_days (
         id, weekday, title, focus, duration_minutes,
         training_day_exercises (
           id, position, sets, reps, rest_seconds, note, strength_sets, strength_reps, skip_on_deload,
           partnered:exercises!training_day_exercises_exercise_partnered_id_fkey (${EXERCISE_FIELDS}),
           solo:exercises!training_day_exercises_exercise_solo_id_fkey (${EXERCISE_FIELDS})
         )
       )`,
    )
    .eq('is_active', true)
    .order('weekday', { referencedTable: 'training_days' })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Não foi possível carregar o treino: ${error.message}`)
  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    startedOn: data.started_on,
    totalWeeks: data.total_weeks,
    days: (data.training_days ?? []).map((day) => ({
      id: day.id,
      weekday: day.weekday,
      title: day.title,
      focus: day.focus,
      durationMinutes: day.duration_minutes,
      exercises: (day.training_day_exercises ?? [])
        .map((item) => {
          const partnered = toVariant(item.partnered as ExerciseRow | null)
          if (!partnered) return null

          const solo = toVariant(item.solo as ExerciseRow | null)

          return {
            id: item.id,
            position: item.position,
            sets: item.sets,
            reps: item.reps,
            restSeconds: item.rest_seconds,
            note: item.note,
            strengthSets: item.strength_sets,
            strengthReps: item.strength_reps,
            skipOnDeload: item.skip_on_deload,
            partnered,
            // Quando as duas colunas apontam para o mesmo exercício, não há
            // alternativa de verdade: o alternador não deve sugerir que há.
            solo: solo && solo.id !== partnered.id ? solo : null,
          } satisfies TrainingExercise
        })
        .filter((exercise): exercise is TrainingExercise => exercise !== null)
        .sort((a, b) => a.position - b.position),
    })),
  }
}

/** A sessão aberta, se houver. O banco garante no máximo uma por usuário. */
export async function getOpenSession(): Promise<OpenSession | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, day_id, mode, started_at, exercise_logs (day_exercise_id, done, load_kg, reps)')
    .is('ended_at', null)
    .maybeSingle()

  if (error) throw new Error(`Não foi possível carregar a sessão: ${error.message}`)
  if (!data) return null

  const logs: OpenSession['logs'] = {}
  for (const log of data.exercise_logs ?? []) {
    logs[log.day_exercise_id] = { done: log.done, loadKg: log.load_kg, reps: log.reps }
  }

  return {
    id: data.id,
    dayId: data.day_id,
    mode: data.mode === 'sozinha' ? 'sozinha' : 'acompanhada',
    startedAt: data.started_at,
    logs,
  }
}

export type LastLoad = { loadKg: number; onDate: string }

/**
 * Última carga registrada em cada exercício, para aparecer ao lado do campo.
 *
 * Sem essa referência a pessoa precisa lembrar de quanto levantou na semana
 * passada, que é justamente o que o registro existe para evitar.
 *
 * A sessão em andamento fica de fora: "última" tem que ser a do treino
 * anterior, senão o campo repete o número que a pessoa acabou de digitar.
 */
export async function getLastLoads(exceptSessionId?: string): Promise<Record<string, LastLoad>> {
  const supabase = await createClient()

  let query = supabase
    .from('exercise_logs')
    .select('exercise_id, load_kg, updated_at')
    .not('load_kg', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(400)

  if (exceptSessionId) query = query.neq('session_id', exceptSessionId)

  const { data, error } = await query

  if (error) throw new Error(`Não foi possível carregar o histórico: ${error.message}`)

  const result: Record<string, LastLoad> = {}

  for (const row of data ?? []) {
    // A consulta já vem da mais recente para a mais antiga, então a primeira
    // ocorrência de cada exercício é a que interessa.
    if (row.load_kg === null || result[row.exercise_id]) continue

    result[row.exercise_id] = {
      loadKg: Number(row.load_kg),
      onDate: row.updated_at.slice(0, 10),
    }
  }

  return result
}

export type LoadHistoryEntry = { loadKg: number | null; reps: number | null; onDate: string }

/** Histórico de um exercício, do mais recente para o mais antigo. */
export async function getExerciseHistory(exerciseId: string): Promise<LoadHistoryEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('exercise_logs')
    .select('load_kg, reps, updated_at, workout_sessions (local_date)')
    .eq('exercise_id', exerciseId)
    .eq('done', true)
    .order('updated_at', { ascending: false })
    .limit(20)

  if (error) throw new Error(`Não foi possível carregar o histórico: ${error.message}`)

  return (data ?? []).map((row) => ({
    loadKg: row.load_kg === null ? null : Number(row.load_kg),
    reps: row.reps,
    onDate: row.workout_sessions?.local_date ?? row.updated_at.slice(0, 10),
  }))
}
