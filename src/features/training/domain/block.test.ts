import { describe, expect, it } from 'vitest'

import { resolveBlockStatus, resolvePrescription, type PrescriptionInput } from './block'

const START = '2026-09-07' // uma segunda-feira

describe('resolveBlockStatus', () => {
  it('conta a primeira semana a partir do dia de início', () => {
    expect(resolveBlockStatus(START, START).week).toBe(1)
    expect(resolveBlockStatus(START, '2026-09-13').week).toBe(1)
  })

  it('vira a semana no sétimo dia', () => {
    expect(resolveBlockStatus(START, '2026-09-14').week).toBe(2)
  })

  it.each([
    ['2026-09-07', 1, 'adaptacao'],
    ['2026-09-14', 2, 'adaptacao'],
    ['2026-09-21', 3, 'hipertrofia'],
    ['2026-10-12', 6, 'hipertrofia'],
    ['2026-10-19', 7, 'forca'],
    ['2026-11-09', 10, 'forca'],
    ['2026-11-16', 11, 'deload'],
    ['2026-11-23', 12, 'reteste'],
  ])('em %s está na semana %i, fase %s', (today, week, phase) => {
    const status = resolveBlockStatus(START, today)

    expect(status.week).toBe(week)
    expect(status.phase.phase).toBe(phase)
    expect(status.isExpired).toBe(false)
  })

  it('marca o bloco como vencido sem parar de prescrever', () => {
    const status = resolveBlockStatus(START, '2026-11-30')

    expect(status.week).toBe(13)
    expect(status.isExpired).toBe(true)
    expect(status.weeksOverdue).toBe(1)
    // A prescrição congela na última semana em vez de sumir: bloco vencido
    // avisa, mas não impede de treinar.
    expect(status.phase.phase).toBe('reteste')
  })

  it('trata bloco com data futura como semana 1', () => {
    expect(resolveBlockStatus('2026-12-01', START).week).toBe(1)
  })

  it('rejeita data malformada', () => {
    expect(() => resolveBlockStatus('07/09/2026', START)).toThrow(/Data inválida/)
  })
})

describe('resolvePrescription', () => {
  const base: PrescriptionInput = {
    sets: 3,
    reps: '8–10',
    strengthSets: 4,
    strengthReps: '6–8',
    skipOnDeload: false,
  }

  it('usa a prescrição do banco na hipertrofia', () => {
    expect(resolvePrescription(base, 'hipertrofia')).toEqual({
      sets: 3,
      reps: '8–10',
      hint: null,
      dropped: false,
    })
  })

  it('corta para 2 séries na adaptação', () => {
    expect(resolvePrescription(base, 'adaptacao').sets).toBe(2)
  })

  it('aplica séries e faixa de força quando existem', () => {
    const result = resolvePrescription(base, 'forca')

    expect(result.sets).toBe(4)
    expect(result.reps).toBe('6–8')
  })

  it('mantém a base na força quando o exercício não muda de fase', () => {
    const isolator = { ...base, strengthSets: null, strengthReps: null }

    expect(resolvePrescription(isolator, 'forca')).toEqual({
      sets: 3,
      reps: '8–10',
      hint: null,
      dropped: false,
    })
  })

  it('reduz à metade no deload, arredondando para baixo', () => {
    expect(resolvePrescription(base, 'deload').sets).toBe(1)
    expect(resolvePrescription({ ...base, sets: 4 }, 'deload').sets).toBe(2)
  })

  it('nunca deixa o deload zerar as séries', () => {
    expect(resolvePrescription({ ...base, sets: 1 }, 'deload').sets).toBe(1)
  })

  it('tira os unilaterais do deload sem escondê-los', () => {
    const result = resolvePrescription({ ...base, skipOnDeload: true }, 'deload')

    expect(result.dropped).toBe(true)
    expect(result.hint).toBe('Fora do deload')
  })

  it('mantém unilaterais nas demais fases', () => {
    expect(resolvePrescription({ ...base, skipOnDeload: true }, 'forca').dropped).toBe(false)
  })
})
