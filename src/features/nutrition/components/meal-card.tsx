'use client'

import { CaretDown } from '@phosphor-icons/react/dist/ssr'
import { useId, useState } from 'react'

import type { MealStatus } from '@/features/nutrition/domain/timeline'
import type { Meal } from '@/features/nutrition/server/queries'
import { cn } from '@/shared/lib/cn'

type MealCardProps = {
  meal: Meal
  time: string
  status: MealStatus
  defaultOpen: boolean
}

const STATUS_LABEL: Record<MealStatus, string> = {
  passada: 'já passou',
  agora: 'agora',
  proxima: 'próxima',
  futura: 'mais tarde',
}

/**
 * Uma refeição da linha do tempo.
 *
 * Só a refeição do horário atual vem aberta. As outras ficam recolhidas em uma
 * linha: quem abre o app às 15h quer saber o que comer às 15h, e não ler o dia
 * inteiro para encontrar. Um toque abre qualquer uma.
 */
export function MealCard({ meal, time, status, defaultOpen }: MealCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [optionIndex, setOptionIndex] = useState(0)
  const panelId = useId()

  const option = meal.options[optionIndex] ?? meal.options[0]
  const isNow = status === 'agora'

  return (
    <li
      className={cn(
        'border-line bg-surface rounded-card overflow-hidden border',
        isNow && 'border-accent/45',
        status === 'passada' && !isOpen && 'border-line/60 bg-transparent',
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
      >
        <span
          className={cn(
            'tabular rounded-md px-1.5 py-1 font-mono text-[12.5px] leading-none font-medium',
            isNow ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-2',
          )}
        >
          {time}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-[15px] leading-tight font-semibold',
              status === 'passada' && !isOpen && 'text-ink-2',
            )}
          >
            {meal.name}
          </span>
          <span className="text-ink-3 tabular mt-0.5 block font-mono text-[11.5px] leading-none">
            {meal.kcal ? `${meal.kcal} kcal` : ''}
            {meal.kcal && meal.proteinG ? ' · ' : ''}
            {meal.proteinG ? `${meal.proteinG} g prot` : ''}
          </span>
        </span>

        {isNow ? (
          <span className="text-accent text-[11px] font-medium tracking-wide uppercase">
            {STATUS_LABEL.agora}
          </span>
        ) : null}

        <CaretDown
          size={15}
          weight="bold"
          aria-hidden
          className={cn('text-ink-3 shrink-0 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen ? (
        <div id={panelId} className="border-line border-t px-3.5 pt-3 pb-3.5">
          {meal.note ? (
            <p className="text-ink-2 mb-3 text-[13px] leading-snug">{meal.note}</p>
          ) : null}

          {meal.options.length > 1 ? (
            <div
              role="tablist"
              aria-label={`Opções de ${meal.name}`}
              className="mb-3 flex flex-wrap gap-1.5"
            >
              {meal.options.map((entry, index) => (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={index === optionIndex}
                  onClick={() => setOptionIndex(index)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[12.5px] font-medium transition active:scale-95',
                    index === optionIndex
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-line text-ink-2',
                  )}
                >
                  {entry.label ?? `Opção ${index + 1}`}
                </button>
              ))}
            </div>
          ) : null}

          {option?.note ? (
            <p className="text-ink-2 mb-2.5 text-[12.5px] leading-snug">{option.note}</p>
          ) : null}

          <ul className="divide-line divide-y">
            {(option?.items ?? []).map((item) => (
              <li key={item.id} className="flex items-baseline gap-3 py-2 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1 text-[14px] leading-snug">
                  {item.name}
                  {item.note ? (
                    <span className="text-ink-3 mt-0.5 block text-[12px] leading-snug">
                      {item.note}
                    </span>
                  ) : null}
                </span>

                <span className="tabular shrink-0 font-mono text-[13px] whitespace-nowrap">
                  {item.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  )
}
