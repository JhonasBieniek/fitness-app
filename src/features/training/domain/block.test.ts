import { describe, expect, it } from 'vitest'

import {
  exercisesForWeek,
  resolveBlockStatus,
  resolvePrescription,
  type PrescriptionInput,
} from './block'

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
    ['2026-09-07', 1, 'aprendizado'],
    ['2026-09-14', 2, 'aprendizado'],
    ['2026-09-21', 3, 'volume'],
    ['2026-10-12', 6, 'volume'],
    ['2026-10-19', 7, 'forca'],
    ['2026-11-16', 11, 'forca'],
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
    expect(status.prescriptionWeek).toBe(12)
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
  }

  it.each(['aprendizado', 'volume'] as const)('usa a prescrição do banco em %s', (phase) => {
    expect(resolvePrescription(base, phase)).toEqual({ sets: 3, reps: '8–10' })
  })

  it.each(['forca', 'reteste'] as const)('aplica séries e faixa de força em %s', (phase) => {
    expect(resolvePrescription(base, phase)).toEqual({ sets: 4, reps: '6–8' })
  })

  it('mantém a base na força quando o exercício não muda de fase', () => {
    const isolator = { ...base, strengthSets: null, strengthReps: null }

    expect(resolvePrescription(isolator, 'forca')).toEqual({ sets: 3, reps: '8–10' })
  })

  it('aceita faixa de força sem série de força', () => {
    expect(resolvePrescription({ ...base, strengthSets: null }, 'forca')).toEqual({
      sets: 3,
      reps: '6–8',
    })
  })
})

describe('exercisesForWeek', () => {
  const goblet = { id: 'goblet', fromWeek: 1, toWeek: 4 }
  const livre = { id: 'livre', fromWeek: 5, toWeek: null }
  const sempre = { id: 'leg-press', fromWeek: 1, toWeek: null }
  const items = [goblet, livre, sempre]

  it('mostra a linha da faixa da semana', () => {
    expect(exercisesForWeek(items, 1)).toEqual([goblet, sempre])
    expect(exercisesForWeek(items, 4)).toEqual([goblet, sempre])
    expect(exercisesForWeek(items, 5)).toEqual([livre, sempre])
    expect(exercisesForWeek(items, 12)).toEqual([livre, sempre])
  })

  it('inclui as duas pontas da faixa', () => {
    expect(exercisesForWeek([{ fromWeek: 3, toWeek: 3 }], 3)).toHaveLength(1)
    expect(exercisesForWeek([{ fromWeek: 3, toWeek: 3 }], 2)).toHaveLength(0)
    expect(exercisesForWeek([{ fromWeek: 3, toWeek: 3 }], 4)).toHaveLength(0)
  })
})
