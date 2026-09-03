import { describe, expect, it } from 'vitest'

import { elapsedSeconds, formatDuration, sessionProgress } from './session'

describe('elapsedSeconds', () => {
  it('mede a partir do início da sessão', () => {
    const started = new Date('2026-09-07T07:00:00Z')

    expect(elapsedSeconds(started, new Date('2026-09-07T07:42:07Z'))).toBe(2527)
  })

  it('sobrevive ao app ficar em segundo plano', () => {
    // O intervalo é o mesmo com o app aberto ou fechado: o valor vem do
    // relógio, não de um contador que precisa estar rodando.
    const started = new Date('2026-09-07T07:00:00Z')

    expect(elapsedSeconds(started, new Date('2026-09-07T08:30:00Z'))).toBe(5400)
  })

  it('não devolve tempo negativo se o relógio andar para trás', () => {
    const started = new Date('2026-09-07T07:00:00Z')

    expect(elapsedSeconds(started, new Date('2026-09-07T06:59:00Z'))).toBe(0)
  })
})

describe('formatDuration', () => {
  it.each([
    [0, '00:00'],
    [59, '00:59'],
    [2527, '42:07'],
    [3600, '1:00:00'],
    [5405, '1:30:05'],
  ])('%i segundos vira %s', (input, expected) => {
    expect(formatDuration(input)).toBe(expected)
  })
})

describe('sessionProgress', () => {
  it('calcula a proporção concluída', () => {
    expect(sessionProgress(3, 6)).toEqual({ done: 3, total: 6, ratio: 0.5, isComplete: false })
  })

  it('marca conclusão quando tudo foi feito', () => {
    expect(sessionProgress(5, 5).isComplete).toBe(true)
  })

  it('devolve zero em vez de NaN sem exercícios', () => {
    expect(sessionProgress(0, 0)).toEqual({ done: 0, total: 0, ratio: 0, isComplete: false })
  })

  it('limita o concluído ao total', () => {
    expect(sessionProgress(9, 4).done).toBe(4)
  })
})
