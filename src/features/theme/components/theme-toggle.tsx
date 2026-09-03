'use client'

import { Moon, Sun } from '@phosphor-icons/react/dist/ssr'
import { motion } from 'motion/react'
import { useOptimistic, useTransition } from 'react'

import { setTheme } from '@/features/theme/server/actions'
import type { Theme } from '@/features/theme/server/theme'
import { cn } from '@/shared/lib/cn'

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'claro', label: 'Claro', Icon: Sun },
  { value: 'escuro', label: 'Escuro', Icon: Moon },
]

export function ThemeToggle({ theme }: { theme: Theme }) {
  const [, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useOptimistic(theme)

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="border-line bg-surface-2 flex rounded-full border p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = optimistic === value

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() =>
              startTransition(async () => {
                setOptimistic(value)
                await setTheme(value)
              })
            }
            className="relative flex-1 px-3 py-1.5"
          >
            {isActive ? (
              <motion.span
                layoutId="tema-ativo"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="bg-surface absolute inset-0 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              />
            ) : null}

            <span
              className={cn(
                'relative flex items-center justify-center gap-1.5 text-[13px] font-medium transition-colors',
                isActive ? 'text-ink' : 'text-ink-2',
              )}
            >
              <Icon size={14} weight="regular" aria-hidden />
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
