/**
 * O protocolo de 12 semanas é a espinha do treino: ele define quantas séries a
 * pessoa faz hoje, em que faixa de repetições, e quando o bloco vence.
 *
 * Módulo puro. A data de hoje entra por parâmetro para que cada semana do bloco
 * possa ser testada sem mexer no relógio.
 */

export const PHASES = ['adaptacao', 'hipertrofia', 'forca', 'deload', 'reteste'] as const

export type Phase = (typeof PHASES)[number]

export type PhaseInfo = {
  phase: Phase
  label: string
  /** Uma frase sobre o que muda nesta fase. Aparece no topo do treino. */
  guidance: string
}

const PHASE_INFO: Record<Phase, PhaseInfo> = {
  adaptacao: {
    phase: 'adaptacao',
    label: 'Adaptação',
    guidance:
      'Duas séries em tudo, terminando com 3 a 4 repetições de sobra. O objetivo é o padrão do movimento, não a carga.',
  },
  hipertrofia: {
    phase: 'hipertrofia',
    label: 'Hipertrofia',
    guidance:
      'Compostos com 2 a 3 repetições de sobra. Fechou o topo da faixa em todas as séries? Sobe a carga no próximo treino.',
  },
  forca: {
    phase: 'forca',
    label: 'Força',
    guidance: 'Compostos em 6 a 8 repetições com carga maior. Isoladores ganham uma série.',
  },
  deload: {
    phase: 'deload',
    label: 'Deload',
    guidance:
      'Metade das séries, mesma carga, 4 repetições de sobra. Sem unilaterais. A semana serve para recuperar.',
  },
  reteste: {
    phase: 'reteste',
    label: 'Re-teste',
    guidance:
      'Nos principais, uma série até 1 repetição de sobra com a carga da semana 10. Nunca até a falha técnica.',
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

function phaseForWeek(week: number, totalWeeks: number): Phase {
  // Depois do fim do bloco a prescrição congela na última semana útil, para o
  // treino continuar existindo enquanto o novo bloco não é montado.
  const effective = Math.min(week, totalWeeks)

  if (effective <= 2) return 'adaptacao'
  if (effective <= 6) return 'hipertrofia'
  if (effective <= totalWeeks - 2) return 'forca'
  if (effective === totalWeeks - 1) return 'deload'
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

  return {
    week,
    totalWeeks,
    phase: PHASE_INFO[phaseForWeek(week, totalWeeks)],
    isExpired: week > totalWeeks,
    weeksOverdue: Math.max(0, week - totalWeeks),
  }
}

export type ExercisePrescription = {
  sets: number
  reps: string
  /** Ajuste da fase, quando existe. Some nas semanas em que nada muda. */
  hint: string | null
  /** Fora do treino nesta semana, mas continua visível e marcável. */
  dropped: boolean
}

export type PrescriptionInput = {
  sets: number
  reps: string
  strengthSets: number | null
  strengthReps: string | null
  skipOnDeload: boolean
}

/**
 * Quantas séries e em que faixa, para a fase de hoje.
 *
 * A prescrição base do banco vale para hipertrofia. As outras fases derivam
 * dela, e é por isso que mudar de fase não exige reescrever o plano.
 */
export function resolvePrescription(input: PrescriptionInput, phase: Phase): ExercisePrescription {
  switch (phase) {
    case 'adaptacao':
      return {
        sets: 2,
        reps: input.reps,
        hint: 'Adaptação: 2 séries, longe da falha',
        dropped: false,
      }

    case 'forca':
      return {
        sets: input.strengthSets ?? input.sets,
        reps: input.strengthReps ?? input.reps,
        hint: input.strengthSets || input.strengthReps ? 'Fase de força' : null,
        dropped: false,
      }

    case 'deload':
      return {
        sets: Math.max(1, Math.floor(input.sets / 2)),
        reps: input.reps,
        hint: input.skipOnDeload ? 'Fora do deload' : 'Deload: mesma carga, 4 reps de sobra',
        dropped: input.skipOnDeload,
      }

    case 'reteste':
      return {
        sets: input.strengthSets ?? input.sets,
        reps: input.strengthReps ?? input.reps,
        hint: 'Re-teste: última série até 1 rep de sobra',
        dropped: false,
      }

    case 'hipertrofia':
      return { sets: input.sets, reps: input.reps, hint: null, dropped: false }
  }
}
