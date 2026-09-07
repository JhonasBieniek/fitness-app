/**
 * Posiciona as refeições no dia e decide qual delas está em foco.
 *
 * É o que faz a rota de dieta abrir já no ponto certo. Módulo puro — o horário
 * chega por parâmetro.
 */

import { parseTimeOfDay, type MinutesOfDay } from '@/shared/lib/time'

export type MealStatus = 'passada' | 'agora' | 'proxima' | 'futura'

export type TimedMeal<T> = {
  meal: T
  time: string
  minutes: MinutesOfDay
  status: MealStatus
}

export type MealTimes = { time: string }

/**
 * Ordena as refeições por horário e marca o estado de cada uma.
 *
 * Em foco fica a refeição de horário mais perto de agora — não a última que
 * passou. Às 11:50 faltam dez minutos para o almoço e o café foi há mais de
 * três horas: quem abre o app nessa hora quer ver o almoço. A regra anterior
 * mantinha a refeição corrente até o horário da seguinte e deixava o café em
 * destaque até meio-dia em ponto.
 *
 * No empate exato entre duas, vale a que ainda vem: no meio do caminho, a
 * refeição útil é a que dá para preparar.
 */
export function buildMealTimeline<T extends MealTimes>(
  meals: readonly T[],
  minutesOfDay: MinutesOfDay,
): TimedMeal<T>[] {
  const ordenadas = meals
    .map((meal) => ({ meal, time: meal.time, minutes: parseTimeOfDay(meal.time) }))
    .sort((a, b) => a.minutes - b.minutes)

  let emFoco = 0
  let menorDistancia = Number.POSITIVE_INFINITY

  for (const [indice, slot] of ordenadas.entries()) {
    const distancia = Math.abs(slot.minutes - minutesOfDay)

    // `<=` e não `<`: como a lista está em ordem crescente, o empate acaba
    // ficando com a refeição mais tarde, que é a que ainda vem.
    if (distancia <= menorDistancia) {
      menorDistancia = distancia
      emFoco = indice
    }
  }

  return ordenadas.map((slot, indice) => {
    let status: MealStatus = 'futura'

    if (indice === emFoco) status = 'agora'
    else if (indice === emFoco + 1) status = 'proxima'
    else if (indice < emFoco) status = 'passada'

    return { meal: slot.meal, time: slot.time, minutes: slot.minutes, status }
  })
}
