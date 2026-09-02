/**
 * Base da "inteligência" do app: transformar um instante em um contexto de
 * dia e horário no fuso do usuário, e descobrir qual bloco (refeição, treino)
 * está ativo agora.
 *
 * Módulo puro de propósito: sem `Date.now()`, sem I/O e sem framework. Todo
 * consumidor injeta o instante, o que torna qualquer cenário testável.
 */

export const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

export type Weekday = (typeof WEEKDAYS)[number]

/** Minutos desde a meia-noite local, de 0 a 1439. */
export type MinutesOfDay = number

export type ZonedNow = {
  /** Data local no formato `YYYY-MM-DD`. Usada como chave dos registros diários. */
  localDate: string
  weekday: Weekday
  minutesOfDay: MinutesOfDay
  timeZone: string
}

/**
 * Converte um instante absoluto para o dia e a hora no fuso informado.
 *
 * Usa `Intl` porque o fuso do servidor (UTC na Vercel) nunca é o fuso do
 * usuário, e o horário de verão precisa vir da base de fusos, não de um offset fixo.
 */
export function zonedNow(instant: Date, timeZone: string): ZonedNow {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(instant)

  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  const weekday = lookup('weekday').toLowerCase() as Weekday

  if (!WEEKDAYS.includes(weekday)) {
    throw new Error(`Não foi possível resolver o dia da semana no fuso ${timeZone}.`)
  }

  return {
    localDate: `${lookup('year')}-${lookup('month')}-${lookup('day')}`,
    weekday,
    minutesOfDay: Number(lookup('hour')) * 60 + Number(lookup('minute')),
    timeZone,
  }
}

/** `'09:30'` → `570`. Rejeita horários fora de 00:00–23:59. */
export function parseTimeOfDay(value: string): MinutesOfDay {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value)

  if (!match) {
    throw new Error(`Horário inválido: "${value}". Use o formato HH:mm em 24 h.`)
  }

  return Number(match[1]) * 60 + Number(match[2])
}

/** `570` → `'09:30'`. */
export function formatTimeOfDay(minutes: MinutesOfDay): string {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 1439) {
    throw new Error(`Minuto do dia fora do intervalo 0–1439: ${minutes}.`)
  }

  const hours = Math.floor(minutes / 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

export type TimeSlot = {
  /** Início da janela, em minutos do dia. */
  startMinutes: MinutesOfDay
  /** Fim da janela, exclusivo. Quando ausente, vai até o início do próximo slot. */
  endMinutes?: MinutesOfDay
}

export type SlotResolution<T> = {
  /** Slot cuja janela contém o instante atual. */
  current: T | null
  /** Próximo slot do dia, ou `null` quando o dia acabou. */
  next: T | null
  /** Último slot já encerrado, ou `null` antes do primeiro do dia. */
  previous: T | null
}

/**
 * Descobre em qual bloco do dia o usuário está.
 *
 * Slots sem `endMinutes` se estendem até o início do slot seguinte, o que
 * evita "buracos" entre refeições em que nada seria exibido. O último slot
 * aberto vale até o fim do dia.
 */
export function resolveSlot<T extends TimeSlot>(
  slots: readonly T[],
  minutesOfDay: MinutesOfDay,
): SlotResolution<T> {
  const ordered = [...slots].sort((a, b) => a.startMinutes - b.startMinutes)

  let current: T | null = null
  let previous: T | null = null
  let next: T | null = null

  for (const [index, slot] of ordered.entries()) {
    const nextSlot = ordered[index + 1]
    const end = slot.endMinutes ?? nextSlot?.startMinutes ?? 1440

    if (minutesOfDay >= slot.startMinutes && minutesOfDay < end) {
      current = slot
      next = nextSlot ?? null
      break
    }

    if (minutesOfDay >= end) {
      previous = slot
      continue
    }

    next = slot
    break
  }

  return { current, next, previous }
}
