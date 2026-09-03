import 'server-only'

import { createClient } from '@/lib/supabase/server'

export type MealItem = {
  id: string
  name: string
  amount: string
  note: string | null
}

export type MealOption = {
  id: string
  label: string | null
  note: string | null
  items: MealItem[]
}

export type Meal = {
  id: string
  position: number
  name: string
  /** Horário na versão de treino em jejum. */
  timeFasted: string
  /** Horário na versão de treino à tarde ou à noite. */
  timeEvening: string
  kcal: number | null
  proteinG: number | null
  note: string | null
  options: MealOption[]
}

export type PlanNote = {
  id: string
  kind: 'regra' | 'detalhe' | 'jejum'
  title: string
  body: string
}

export type MealPlan = {
  id: string
  name: string
  kcalTarget: number
  proteinG: number
  proteinMinG: number | null
  carbG: number
  fatG: number
  waterMinL: number
  waterMaxL: number | null
  meals: Meal[]
  rules: PlanNote[]
  details: PlanNote[]
  /** Só aparece na distribuição de treino em jejum. */
  fastingNote: PlanNote | null
}

/** `'08:30:00'` do Postgres vira `'08:30'`. */
function trimTime(value: string): string {
  return value.slice(0, 5)
}

export async function getActiveMealPlan(): Promise<MealPlan | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('meal_plans')
    .select(
      `id, name, kcal_target, protein_g, protein_min_g, carb_g, fat_g, water_min_l, water_max_l,
       meals (
         id, position, name, time_fasted, time_evening, kcal, protein_g, note,
         meal_options ( id, position, label, note, meal_items ( id, position, name, amount, note ) )
       ),
       plan_notes ( id, kind, position, title, body )`,
    )
    .eq('is_active', true)
    .order('position', { referencedTable: 'meals' })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Não foi possível carregar a dieta: ${error.message}`)
  if (!data) return null

  const notes = (data.plan_notes ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((note) => ({
      id: note.id,
      kind: note.kind as PlanNote['kind'],
      title: note.title,
      body: note.body,
    }))

  return {
    id: data.id,
    name: data.name,
    kcalTarget: data.kcal_target,
    proteinG: data.protein_g,
    proteinMinG: data.protein_min_g,
    carbG: data.carb_g,
    fatG: data.fat_g,
    waterMinL: Number(data.water_min_l),
    waterMaxL: data.water_max_l === null ? null : Number(data.water_max_l),
    meals: (data.meals ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((meal) => ({
        id: meal.id,
        position: meal.position,
        name: meal.name,
        timeFasted: trimTime(meal.time_fasted),
        timeEvening: trimTime(meal.time_evening),
        kcal: meal.kcal,
        proteinG: meal.protein_g,
        note: meal.note,
        options: (meal.meal_options ?? [])
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((option) => ({
            id: option.id,
            label: option.label,
            note: option.note,
            items: (option.meal_items ?? [])
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((item) => ({
                id: item.id,
                name: item.name,
                amount: item.amount,
                note: item.note,
              })),
          })),
      })),
    rules: notes.filter((note) => note.kind === 'regra'),
    details: notes.filter((note) => note.kind === 'detalhe'),
    fastingNote: notes.find((note) => note.kind === 'jejum') ?? null,
  }
}
