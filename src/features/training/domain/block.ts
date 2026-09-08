/**
 * O protocolo de 12 semanas é a espinha do treino: ele define quantas séries a
 * pessoa faz hoje, em que faixa de repetições, e quando o bloco vence.
 *
 * Módulo puro. A data de hoje entra por parâmetro para que cada semana do bloco
 * possa ser testada sem mexer no relógio.
 */

export const PHASES = ['aprendizado', 'volume', 'forca', 'reteste'] as const

export type Phase = (typeof PHASES)[number]

export type PhaseInfo = {
  phase: Phase
  label: string
  /** O que muda nesta fase: quanto sobra no fim da série e quando a carga sobe. */
  guidance: string
}

const PHASE_INFO: Record<Phase, PhaseInfo> = {
  aprendizado: {
    phase: 'aprendizado',
    label: 'Aprendizado',
    guidance:
      'Ficha completa, carga leve. Semana 1 termina cada série com 3 repetições de sobra; semana 2, com 2. Não sobe carga: o objetivo é anotar a regulagem e aprender o padrão.',
  },
  volume: {
    phase: 'volume',
    label: 'Volume',
    guidance:
      'Compostos com 2 repetições de sobra; a última série dos isoladores com 1. Fechou o topo da faixa em todas as séries? Sobe a menor carga no próximo treino. Travou 2 vezes: mantém e busca reps; na 3ª, tira 5%.',
  },
  forca: {
    phase: 'forca',
    label: 'Força',
    guidance:
      'Hip thrust de segunda em 4×6–8; agachamento e RDL em 3×6–8, com a carga que fecha 8 com 2 de sobra. O resto segue igual, com a mesma regra de progressão.',
  },
  reteste: {
    phase: 'reteste',
    label: 'Re-teste',
    guidance:
      'Nos principais, uma série até 1 repetição de sobra com a carga da semana 11, nunca até a falha. 12 ou mais: sobe 10%. De 9 a 11: sobe 5%. Até 8: mantém. Medir peso, quadril e coxa.',
  },
}

export type BlockStatus = {
  /** Semana atual, começando em 1. Continua contando depois do fim do bloco. */
  week: number
  totalWeeks: number
  phase: PhaseInfo
  /** Verdadeiro quando o bloco passou da última semana. Nunca bloqueia o uso. */
  isExpired: boolean
  /** Semanas passadas do prazo. Zero enquanto o bloco está em dia. */
  weeksOverdue: number
  /**
   * Semana usada para escolher a prescrição. Igual a `week` dentro do bloco e
   * congelada na última quando ele venceu: o treino continua existindo.
   */
  prescriptionWeek: number
}

const MS_PER_DAY = 86_400_000

/** Diferença em dias entre duas datas `YYYY-MM-DD`, sem envolver fuso. */
function daysBetween(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`)
  const end = Date.parse(`${to}T00:00:00Z`)

  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new Error(`Data inválida ao calcular a semana do bloco: "${from}" → "${to}".`)
  }

  return Math.floor((end - start) / MS_PER_DAY)
}

/**
 * Sem semana de deload de propósito: uma semana parada no meio do bloco não
 * melhora hipertrofia e piora força (Coleman e Schoenfeld, 2024). Quem segura a
 * fadiga é a regra de carga — travou duas vezes, mantém; na terceira, −5%.
 */
function phaseForWeek(week: number): Phase {
  if (week <= 2) return 'aprendizado'
  if (week <= 6) return 'volume'
  if (week <= 11) return 'forca'
  return 'reteste'
}

/**
 * Em que ponto do protocolo a pessoa está hoje.
 *
 * @param startedOn data de início do bloco, `YYYY-MM-DD`
 * @param today data local de hoje, `YYYY-MM-DD`
 */
export function resolveBlockStatus(startedOn: string, today: string, totalWeeks = 12): BlockStatus {
  const elapsedDays = daysBetween(startedOn, today)
  // Um bloco que ainda não começou é tratado como semana 1: melhor mostrar o
  // treino do que uma tela vazia porque a data foi cadastrada para a frente.
  const week = elapsedDays < 0 ? 1 : Math.floor(elapsedDays / 7) + 1
  // Depois do fim do bloco a prescrição congela na última semana, para o
  // treino continuar existindo enquanto o novo bloco não é montado.
  const prescriptionWeek = Math.min(week, totalWeeks)

  return {
    week,
    totalWeeks,
    phase: PHASE_INFO[phaseForWeek(prescriptionWeek)],
    isExpired: week > totalWeeks,
    weeksOverdue: Math.max(0, week - totalWeeks),
    prescriptionWeek,
  }
}

export type ExercisePrescription = {
  sets: number
  reps: string
}

export type PrescriptionInput = {
  sets: number
  reps: string
  strengthSets: number | null
  strengthReps: string | null
}

/**
 * Quantas séries e em que faixa, para a fase de hoje.
 *
 * A prescrição base do banco vale do aprendizado ao volume. As semanas de força
 * e o re-teste usam a faixa de força onde ela existe — e é por isso que mudar
 * de fase não exige reescrever o plano.
 */
export function resolvePrescription(input: PrescriptionInput, phase: Phase): ExercisePrescription {
  if (phase === 'forca' || phase === 'reteste') {
    return {
      sets: input.strengthSets ?? input.sets,
      reps: input.strengthReps ?? input.reps,
    }
  }

  return { sets: input.sets, reps: input.reps }
}

export type WeekRanged = {
  /** Primeira semana em que a linha vale. */
  fromWeek: number
  /** Última semana em que vale; nula até o fim do bloco. */
  toWeek: number | null
}

/**
 * As linhas que valem em uma semana.
 *
 * É o que troca goblet squat por agachamento livre na semana 5 sem ninguém
 * mexer no plano: as duas linhas existem, cada uma com a sua faixa, e a tela
 * mostra a que vale hoje.
 */
export function exercisesForWeek<T extends WeekRanged>(items: readonly T[], week: number): T[] {
  return items.filter(
    (item) => item.fromWeek <= week && (item.toWeek === null || week <= item.toWeek),
  )
}
