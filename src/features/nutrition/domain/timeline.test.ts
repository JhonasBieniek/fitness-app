import { describe, expect, it } from 'vitest'

import { parseTimeOfDay } from '@/shared/lib/time'

import { buildMealTimeline } from './timeline'

const MEALS = [
  { id: 'cafe', time: '08:30' },
  { id: 'almoco', time: '12:00' },
  { id: 'lanche', time: '15:30' },
  { id: 'jantar', time: '19:30' },
  { id: 'ceia', time: '21:00' },
]

function statuses(time: string) {
  return buildMealTimeline(MEALS, parseTimeOfDay(time)).map(
    (entry) => [entry.meal.id, entry.status] as const,
  )
}

describe('buildMealTimeline', () => {
  it('destaca a refeição do horário atual', () => {
    expect(statuses('16:10')).toEqual([
      ['cafe', 'passada'],
      ['almoco', 'passada'],
      ['lanche', 'agora'],
      ['jantar', 'proxima'],
      ['ceia', 'futura'],
    ])
  })

  it('a refeição corrente começa no seu horário', () => {
    expect(statuses('08:29')[0]).toEqual(['cafe', 'proxima'])
    expect(statuses('08:30')[0]).toEqual(['cafe', 'agora'])
  })

  it('mantém a última refeição em destaque até a virada do dia', () => {
    expect(statuses('23:50').at(-1)).toEqual(['ceia', 'agora'])
  })

  it('antes da primeira refeição nada está acontecendo, mas a próxima é conhecida', () => {
    expect(statuses('06:00')).toEqual([
      ['cafe', 'proxima'],
      ['almoco', 'futura'],
      ['lanche', 'futura'],
      ['jantar', 'futura'],
      ['ceia', 'futura'],
    ])
  })

  it('devolve as refeições em ordem de horário, não de cadastro', () => {
    const timeline = buildMealTimeline([...MEALS].reverse(), parseTimeOfDay('12:30'))

    expect(timeline.map((entry) => entry.meal.id)).toEqual([
      'cafe',
      'almoco',
      'lanche',
      'jantar',
      'ceia',
    ])
  })

  it('lida com um plano sem refeições', () => {
    expect(buildMealTimeline([], 600)).toEqual([])
  })
})
