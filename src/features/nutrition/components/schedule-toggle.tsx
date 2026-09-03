'use client'

import { motion } from 'motion/react'
import { useOptimistic, useTransition } from 'react'

import type { MealSchedule } from '@/features/nutrition/domain/timeline'
import { setMealSchedule } from '@/features/nutrition/server/actions'
import { cn } from '@/shared/lib/cn'

const OPTIONS: { value: MealSchedule; label: string }[] = [
  { value: 'manha_jejum', label: 'Manhã (jejum)' },
  { value: 'tarde_noite', label: 'Tarde / noite' },
]

/** Escolhe a distribuição dos horários conforme a hora do treino. */
export function ScheduleToggle({ schedule }: { schedule: MealSchedule }) {
  const [, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useOptimistic(schedule)

  return (
    <div
      role="radiogroup"
      aria-label="Horário do treino"
      className="border-line bg-surface-2 flex rounded-full border p-0.5"
    >
      {OPTIONS.map((option) => {
        const isActive = optimistic === option.value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() =>
              startTransition(async () => {
                setOptimistic(option.value)
                await setMealSchedule(option.value)
              })
            }
            className="relative flex-1 px-3 py-1.5"
          >
            {isActive ? (
              <motion.span
                layoutId="horario-ativo"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="bg-surface absolute inset-0 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              />
            ) : null}

            <span
              className={cn(
                'relative text-[13px] font-medium whitespace-nowrap transition-colors',
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
