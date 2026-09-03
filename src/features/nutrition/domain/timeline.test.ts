import { describe, expect, it } from 'vitest'

import { parseTimeOfDay } from '@/shared/lib/time'

import { buildMealTimeline } from './timeline'

const MEALS = [
  { id: 'cafe', timeFasted: '08:30', timeEvening: '09:00' },
  { id: 'almoco', timeFasted: '12:00', timeEvening: '12:00' },
  { id: 'lanche', timeFasted: '15:30', timeEvening: '15:30' },
  { id: 'jantar', timeFasted: '19:30', timeEvening: '19:30' },
  { id: 'ceia', timeFasted: '21:00', timeEvening: '21:00' },
]

function statuses(schedule: 'manha_jejum' | 'tarde_noite', time: string) {
  return buildMealTimeline(MEALS, schedule, parseTimeOfDay(time)).map(
    (entry) => [entry.meal.id, entry.status] as const,
  )
}

describe('buildMealTimeline', () => {
  it('destaca a refeição do horário atual', () => {
    expect(statuses('manha_jejum', '16:10')).toEqual([
      ['cafe', 'passada'],
      ['almoco', 'passada'],
      ['lanche', 'agora'],
      ['jantar', 'proxima'],
      ['ceia', 'futura'],
    ])
  })

  it('usa o horário da distribuição escolhida', () => {
    // Às 08:45 o café já começou na versão de jejum, mas ainda não na outra.
    expect(statuses('manha_jejum', '08:45')[0]).toEqual(['cafe', 'agora'])
    expect(statuses('tarde_noite', '08:45')[0]).toEqual(['cafe', 'proxima'])
  })

  it('mantém a última refeição em destaque até a virada do dia', () => {
    const timeline = statuses('manha_jejum', '23:50')

    expect(timeline.at(-1)).toEqual(['ceia', 'agora'])
  })

  it('antes da primeira refeição nada está acontecendo, mas a próxima é conhecida', () => {
    expect(statuses('manha_jejum', '06:00')).toEqual([
      ['cafe', 'proxima'],
      ['almoco', 'futura'],
      ['lanche', 'futura'],
      ['jantar', 'futura'],
      ['ceia', 'futura'],
    ])
  })

  it('devolve as refeições em ordem de horário, não de cadastro', () => {
    const shuffled = [...MEALS].reverse()
    const timeline = buildMealTimeline(shuffled, 'manha_jejum', parseTimeOfDay('12:30'))

    expect(timeline.map((entry) => entry.meal.id)).toEqual([
      'cafe',
      'almoco',
      'lanche',
      'jantar',
      'ceia',
    ])
  })

  it('lida com um plano sem refeições', () => {
    expect(buildMealTimeline([], 'manha_jejum', 600)).toEqual([])
  })
})
