'use client'

import { setTrainingMode, type TrainingMode } from '@/features/training/server/actions'
import { cn } from '@/shared/lib/cn'

const OPTIONS: { value: TrainingMode; label: string }[] = [
  { value: 'acompanhada', label: 'Acompanhada' },
  { value: 'sozinha', label: 'Sozinha' },
]

type ModeToggleProps = {
  mode: TrainingMode
  onChange: (mode: TrainingMode) => void
}

/**
 * Troca a coluna do treino: peso livre quando há alguém corrigindo o movimento,
 * máquina ou polia quando não há.
 *
 * Quem manda na tela é o estado do `TrainingBoard`, que já tem as duas colunas
 * em mãos: a lista muda no mesmo quadro do toque. A gravação do cookie vai
 * solta, sem `await`, porque ela só serve para a próxima visita — travar a
 * troca esperando o servidor era o que fazia o controle parecer emperrado.
 *
 * São duas opções de mesma largura, então a pílula não precisa ser medida: ela
 * é um elemento só, deslocado por `transform` de zero ou cem por cento.
 */
export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Como você vai treinar"
      className="border-line bg-surface-2 relative flex rounded-full border p-0.5"
    >
      <span
        aria-hidden
        className="bg-surface pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{
          transform: `translate3d(${
            Math.max(
              0,
              OPTIONS.findIndex((o) => o.value === mode),
            ) * 100
          }%, 0, 0)`,
        }}
      />

      {OPTIONS.map((option) => {
        const isActive = mode === option.value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => {
              onChange(option.value)
              // Preferência é conveniência: se a gravação falhar, o treino
              // continua na coluna escolhida e nada precisa ser dito.
              void setTrainingMode(option.value).catch(() => {})
            }}
            className={cn(
              'relative flex-1 px-2.5 py-1 text-[12px] font-medium transition-colors',
              isActive ? 'text-ink' : 'text-ink-2',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
