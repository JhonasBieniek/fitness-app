/**
 * Cronômetro do treino.
 *
 * O tempo é sempre derivado do instante em que a sessão começou, nunca
 * acumulado a cada tique. É o que faz o cronômetro continuar certo depois de o
 * app passar meia hora em segundo plano, com a tela apagada ou até fechado —
 * um contador incremental pararia junto com os timers do browser.
 */

export function elapsedSeconds(startedAt: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000))
}

/** `3725` vira `1:02:05`; abaixo de uma hora, `42:07`. */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

export type SessionProgress = {
  done: number
  total: number
  /** De 0 a 1. Vale 0 quando não há exercícios, em vez de `NaN`. */
  ratio: number
  isComplete: boolean
}

export function sessionProgress(done: number, total: number): SessionProgress {
  const safeTotal = Math.max(0, total)
  const safeDone = Math.min(Math.max(0, done), safeTotal)

  return {
    done: safeDone,
    total: safeTotal,
    ratio: safeTotal === 0 ? 0 : safeDone / safeTotal,
    isComplete: safeTotal > 0 && safeDone === safeTotal,
  }
}
