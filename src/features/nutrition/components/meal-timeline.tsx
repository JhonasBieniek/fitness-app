'use client'

import { useState } from 'react'

import type { MealStatus } from '@/features/nutrition/domain/timeline'
import type { Meal } from '@/features/nutrition/server/queries'
import { cn } from '@/shared/lib/cn'
import { TabRail } from '@/shared/ui/tab-rail'

export type TimelineEntry = { meal: Meal; time: string; minutes: number; status: MealStatus }

type MealTimelineProps = {
  entries: TimelineEntry[]
  /** Índice que abre na primeira renderização: a refeição mais próxima de agora. */
  initialIndex: number
  /** Minutos desde a meia-noite, para separar "agora" de "em breve". */
  nowMinutes: number
}

/**
 * O dia como uma régua de horários, com uma refeição em foco.
 *
 * A rota não abre com a tabela de metas: metas são referência, e o app existe
 * para responder o que comer agora. A régua é a mesma ideia das abas de dia do
 * treino — uma faixa de tempo e uma coisa em foco — para as duas rotas do app
 * se navegarem do mesmo jeito.
 */
export function MealTimeline({ entries, initialIndex, nowMinutes }: MealTimelineProps) {
  const [index, setIndex] = useState(initialIndex)

  const entry = entries[index] ?? entries[0]
  if (!entry) return null

  return (
    <section aria-label="Refeições do dia">
      {/* A faixa vai até a borda da tela, como no treino; o resto da rota não. */}
      <div className="-mx-4">
        <TabRail
          label="Horários do dia"
          items={entries.map((item) => ({
            id: item.meal.id,
            eyebrow: item.time,
            title: item.meal.name,
            isNow: item.status === 'agora',
            // A refeição em foco é a mais perto, e a mais perto pode ainda não
            // ter chegado: às 11:50 o almoço está em foco, mas dizer "agora"
            // ali seria mentira.
            nowLabel: item.minutes <= nowMinutes ? 'agora' : 'em breve',
          }))}
          selectedId={entry.meal.id}
          onSelect={(id) => setIndex(entries.findIndex((item) => item.meal.id === id))}
        />
      </div>

      <MealPanel key={entry.meal.id} entry={entry} />
    </section>
  )
}

function MealPanel({ entry }: { entry: TimelineEntry }) {
  const [optionIndex, setOptionIndex] = useState(0)
  const { meal } = entry

  const option = meal.options[optionIndex] ?? meal.options[0]

  return (
    <div className="pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[20px] leading-tight font-semibold tracking-tight">{meal.name}</h2>
        <p className="text-ink-3 tabular shrink-0 font-mono text-[12px]">
          {meal.kcal ? `${meal.kcal} kcal` : ''}
          {meal.kcal && meal.proteinG ? ' · ' : ''}
          {meal.proteinG ? `${meal.proteinG} g prot` : ''}
        </p>
      </div>

      {meal.note ? (
        <p className="text-ink-2 mt-1.5 text-[13.5px] leading-snug">{meal.note}</p>
      ) : null}

      {meal.options.length > 1 ? (
        <div
          role="tablist"
          aria-label={`Opções de ${meal.name}`}
          className="mt-3 flex flex-wrap gap-1.5"
        >
          {meal.options.map((item, position) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={position === optionIndex}
              onClick={() => setOptionIndex(position)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition active:scale-95',
                position === optionIndex
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-line text-ink-2',
              )}
            >
              {item.label ?? `Opção ${position + 1}`}
            </button>
          ))}
        </div>
      ) : null}

      {option?.note ? (
        <p className="text-ink-2 mt-2.5 text-[12.5px] leading-snug">{option.note}</p>
      ) : null}

      {/*
        Os itens ficam em fios, e não em cartão: é uma lista de o quê e quanto,
        lida de relance na cozinha, e uma caixa em volta não acrescenta nada.
      */}
      <ul className="divide-line mt-3 divide-y">
        {(option?.items ?? []).map((item) => (
          <li key={item.id} className="flex items-baseline gap-3 py-2.5 first:pt-0">
            <span className="min-w-0 flex-1 text-[15px] leading-snug">
              {item.name}
              {item.note ? (
                <span className="text-ink-3 mt-0.5 block text-[12.5px] leading-snug">
                  {item.note}
                </span>
              ) : null}
            </span>

            <span className="tabular shrink-0 font-mono text-[14px] whitespace-nowrap">
              {item.amount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
