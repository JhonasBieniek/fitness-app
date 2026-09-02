import { describe, expect, it } from 'vitest'

import { formatTimeOfDay, parseTimeOfDay, resolveSlot, zonedNow } from './time'

const SP = 'America/Sao_Paulo'

describe('zonedNow', () => {
  it('converte um instante UTC para o dia e a hora locais', () => {
    // 02/09/2026 12:30 UTC = 09:30 em São Paulo (UTC-3).
    const result = zonedNow(new Date('2026-09-02T12:30:00Z'), SP)

    expect(result).toEqual({
      localDate: '2026-09-02',
      weekday: 'wednesday',
      minutesOfDay: 9 * 60 + 30,
      timeZone: SP,
    })
  })

  it('resolve o dia anterior quando o fuso local ainda não virou', () => {
    // 03/09/2026 01:00 UTC ainda é 02/09 às 22:00 em São Paulo.
    const result = zonedNow(new Date('2026-09-03T01:00:00Z'), SP)

    expect(result.localDate).toBe('2026-09-02')
    expect(result.weekday).toBe('wednesday')
    expect(result.minutesOfDay).toBe(22 * 60)
  })

  it('trata meia-noite como minuto 0, e não como 1440', () => {
    const result = zonedNow(new Date('2026-09-02T03:00:00Z'), SP)

    expect(result.minutesOfDay).toBe(0)
    expect(result.localDate).toBe('2026-09-02')
  })

  it('respeita o fuso informado', () => {
    const instant = new Date('2026-09-02T12:30:00Z')

    expect(zonedNow(instant, 'UTC').minutesOfDay).toBe(12 * 60 + 30)
    expect(zonedNow(instant, 'Europe/Lisbon').minutesOfDay).toBe(13 * 60 + 30)
  })
})

describe('parseTimeOfDay', () => {
  it.each([
    ['00:00', 0],
    ['09:30', 570],
    ['23:59', 1439],
  ])('converte %s em %i minutos', (input, expected) => {
    expect(parseTimeOfDay(input)).toBe(expected)
  })

  it.each(['24:00', '9:30', '09:60', '', 'almoço'])('rejeita %s', (input) => {
    expect(() => parseTimeOfDay(input)).toThrow(/Horário inválido/)
  })
})

describe('formatTimeOfDay', () => {
  it('formata com dois dígitos', () => {
    expect(formatTimeOfDay(570)).toBe('09:30')
    expect(formatTimeOfDay(0)).toBe('00:00')
    expect(formatTimeOfDay(1439)).toBe('23:59')
  })

  it('rejeita valores fora do dia', () => {
    expect(() => formatTimeOfDay(1440)).toThrow(/fora do intervalo/)
    expect(() => formatTimeOfDay(-1)).toThrow(/fora do intervalo/)
  })
})

describe('resolveSlot', () => {
  const meals = [
    { id: 'cafe', startMinutes: parseTimeOfDay('08:30') },
    { id: 'almoco', startMinutes: parseTimeOfDay('12:00') },
    { id: 'lanche', startMinutes: parseTimeOfDay('15:30') },
    { id: 'jantar', startMinutes: parseTimeOfDay('19:30') },
    { id: 'noite', startMinutes: parseTimeOfDay('21:00') },
  ]

  it('encontra o slot que contém o horário atual', () => {
    const result = resolveSlot(meals, parseTimeOfDay('13:00'))

    expect(result.current?.id).toBe('almoco')
    expect(result.next?.id).toBe('lanche')
    expect(result.previous?.id).toBe('cafe')
  })

  it('estende o slot aberto até o início do próximo', () => {
    // 11:59 ainda é café, porque nenhum slot declara fim explícito.
    expect(resolveSlot(meals, parseTimeOfDay('11:59')).current?.id).toBe('cafe')
  })

  it('mantém o último slot ativo até o fim do dia', () => {
    const result = resolveSlot(meals, parseTimeOfDay('23:59'))

    expect(result.current?.id).toBe('noite')
    expect(result.next).toBeNull()
  })

  it('antes do primeiro slot não há atual, só o próximo', () => {
    const result = resolveSlot(meals, parseTimeOfDay('06:00'))

    expect(result.current).toBeNull()
    expect(result.next?.id).toBe('cafe')
    expect(result.previous).toBeNull()
  })

  it('respeita o fim explícito e deixa o intervalo sem slot atual', () => {
    const withGap = [
      { id: 'treino', startMinutes: parseTimeOfDay('07:00'), endMinutes: parseTimeOfDay('08:00') },
      { id: 'cafe', startMinutes: parseTimeOfDay('08:30') },
    ]

    const result = resolveSlot(withGap, parseTimeOfDay('08:15'))

    expect(result.current).toBeNull()
    expect(result.previous?.id).toBe('treino')
    expect(result.next?.id).toBe('cafe')
  })

  it('ordena os slots recebidos fora de ordem', () => {
    const shuffled = [...meals].reverse()

    expect(resolveSlot(shuffled, parseTimeOfDay('16:00')).current?.id).toBe('lanche')
  })

  it('devolve tudo nulo quando não há slots', () => {
    expect(resolveSlot([], 600)).toEqual({ current: null, next: null, previous: null })
  })
})
