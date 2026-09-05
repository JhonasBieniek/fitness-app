'use client'

import { motion } from 'motion/react'

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
 */
export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Como você vai treinar"
      className="border-line bg-surface-2 relative flex rounded-full border p-0.5"
    >
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
            className="relative flex-1 px-2.5 py-1"
          >
            {isActive ? (
              <motion.span
                layoutId="modo-ativo"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="bg-surface absolute inset-0 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              />
            ) : null}

            <span
              className={cn(
                'relative text-[12px] font-medium transition-colors',
                isActive ? 'text-ink' : 'text-ink-2',
              )}
            >
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
