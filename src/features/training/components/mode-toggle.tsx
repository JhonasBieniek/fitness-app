'use client'

import { motion } from 'motion/react'
import { useOptimistic, useTransition } from 'react'

import { setTrainingMode, type TrainingMode } from '@/features/training/server/actions'
import { cn } from '@/shared/lib/cn'

const OPTIONS: { value: TrainingMode; label: string }[] = [
  { value: 'acompanhada', label: 'Acompanhada' },
  { value: 'sozinha', label: 'Sozinha' },
]

/**
 * Troca a coluna do treino: peso livre quando há alguém corrigindo o movimento,
 * máquina ou polia quando não há.
 *
 * A troca aparece antes de a gravação terminar. Esperar o servidor para ver o
 * nome do exercício mudar faria o controle parecer travado.
 */
export function ModeToggle({ mode }: { mode: TrainingMode }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticMode, setOptimisticMode] = useOptimistic(mode)

  return (
    <div
      role="radiogroup"
      aria-label="Como você vai treinar"
      className={cn(
        'border-line bg-surface-2 relative flex rounded-full border p-0.5',
        isPending && 'opacity-90',
      )}
    >
      {OPTIONS.map((option) => {
        const isActive = optimisticMode === option.value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() =>
              startTransition(async () => {
                setOptimisticMode(option.value)
                await setTrainingMode(option.value)
              })
            }
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
