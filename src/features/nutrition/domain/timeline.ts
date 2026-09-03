/**
 * Posiciona as refeições no dia e decide qual delas é "agora".
 *
 * É o que faz a rota de dieta abrir já no ponto certo: às 15h40 o destaque está
 * no lanche, não no café da manhã. Módulo puro — o horário chega por parâmetro.
 */

import { parseTimeOfDay, resolveSlot, type MinutesOfDay } from '@/shared/lib/time'

export const MEAL_SCHEDULES = ['manha_jejum', 'tarde_noite'] as const

export type MealSchedule = (typeof MEAL_SCHEDULES)[number]

export type MealStatus = 'passada' | 'agora' | 'proxima' | 'futura'

export type TimedMeal<T> = {
  meal: T
  /** Horário desta refeição na distribuição escolhida. */
  time: string
  minutes: MinutesOfDay
  status: MealStatus
}

export type MealTimes = { timeFasted: string; timeEvening: string }

/**
 * Ordena as refeições pelo horário da distribuição escolhida e marca o estado
 * de cada uma.
 *
 * A refeição corrente vale até o horário da seguinte, e não por uma janela
 * fixa: entre uma e outra alguma refeição precisa estar em destaque, senão a
 * tela fica sem foco justamente no meio da tarde.
 */
export function buildMealTimeline<T extends MealTimes>(
  meals: readonly T[],
  schedule: MealSchedule,
  minutesOfDay: MinutesOfDay,
): TimedMeal<T>[] {
  const slots = meals.map((meal) => {
    const time = schedule === 'manha_jejum' ? meal.timeFasted : meal.timeEvening

    return { meal, time, startMinutes: parseTimeOfDay(time) }
  })

  const { current, next } = resolveSlot(slots, minutesOfDay)

  return slots
    .slice()
    .sort((a, b) => a.startMinutes - b.startMinutes)
    .map((slot) => {
      let status: MealStatus = 'futura'

      if (current && slot.meal === current.meal) status = 'agora'
      else if (next && slot.meal === next.meal) status = 'proxima'
      else if (slot.startMinutes < minutesOfDay) status = 'passada'

      return { meal: slot.meal, time: slot.time, minutes: slot.startMinutes, status }
    })
}
