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

  it('aponta a refeição mais próxima, e não a última que passou', () => {
    // 11:50: faltam 10 min para o almoço e o café foi há 3h20. A régua abre no
    // almoço. Era este o defeito: o café ficava em destaque até meio-dia em ponto.
    expect(statuses('11:50')).toEqual([
      ['cafe', 'passada'],
      ['almoco', 'agora'],
      ['lanche', 'proxima'],
      ['jantar', 'futura'],
      ['ceia', 'futura'],
    ])
  })

  it('na virada entre duas refeições, o destaque acompanha a mais perto', () => {
    // Ponto médio entre café (08:30) e almoço (12:00) é 10:15.
    expect(statuses('10:14')[0]).toEqual(['cafe', 'agora'])
    expect(statuses('10:16')[1]).toEqual(['almoco', 'agora'])
  })

  it('empate no meio do caminho fica com a que ainda vem', () => {
    expect(statuses('10:15')[1]).toEqual(['almoco', 'agora'])
  })

  it('mantém a última refeição em destaque até a virada do dia', () => {
    expect(statuses('23:50').at(-1)).toEqual(['ceia', 'agora'])
  })

  it('antes da primeira refeição do dia, o destaque é ela mesma', () => {
    expect(statuses('06:00')).toEqual([
      ['cafe', 'agora'],
      ['almoco', 'proxima'],
      ['lanche', 'futura'],
      ['jantar', 'futura'],
      ['ceia', 'futura'],
    ])
  })

  it('uma refeição só é sempre a mais próxima', () => {
    const uma = buildMealTimeline([{ id: 'cafe', time: '08:30' }], parseTimeOfDay('23:00'))
    expect(uma.map((entry) => entry.status)).toEqual(['agora'])
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
