'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { cn } from '@/shared/lib/cn'

const WEEKDAY_SHORT = ['', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'] as const

export type DayTab = {
  id: string
  weekday: number
  title: string
  focus: string | null
}

type DayTabsProps = {
  days: DayTab[]
  selectedWeekday: number
  todayWeekday: number
}

/**
 * Abas dos dias de treino, roláveis na horizontal.
 *
 * O dia selecionado é levado à vista ao abrir, porque na sexta-feira a aba
 * certa está fora da tela e a pessoa não deveria precisar procurar.
 */
export function DayTabs({ days, selectedWeekday, todayWeekday }: DayTabsProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const container = listRef.current
    const active = activeRef.current
    if (!container || !active) return

    // `scrollIntoView` mexeria na rolagem vertical da página junto; aqui só o
    // eixo horizontal da faixa deve se mover.
    container.scrollTo({
      left: active.offsetLeft - container.clientWidth / 2 + active.clientWidth / 2,
      behavior: 'instant',
    })
  }, [selectedWeekday])

  return (
    /*
      As bordas desbotam para dizer que a faixa continua fora da tela. Sem isso
      a aba cortada na lateral parece defeito de alinhamento, e não convite a
      arrastar.
    */
    <div
      ref={listRef}
      role="tablist"
      aria-label="Dias de treino"
      className="no-scrollbar border-line flex gap-1 overflow-x-auto border-b [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] px-3"
    >
      {days.map((day) => {
        const isSelected = day.weekday === selectedWeekday
        const isToday = day.weekday === todayWeekday

        return (
          <Link
            key={day.id}
            ref={isSelected ? activeRef : undefined}
            href={`/treino?dia=${day.weekday}`}
            scroll={false}
            role="tab"
            aria-selected={isSelected}
            className={cn(
              'relative shrink-0 px-3 pt-2.5 pb-3 transition-colors',
              isSelected ? 'text-ink' : 'text-ink-3',
            )}
          >
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] tracking-wider uppercase">
                {WEEKDAY_SHORT[day.weekday]}
              </span>
              {isToday ? (
                <span className="bg-accent size-1.5 rounded-full" aria-label="hoje" />
              ) : null}
            </span>

            <span className="mt-0.5 block text-[14px] leading-tight font-semibold whitespace-nowrap">
              {day.title}
            </span>

            {isSelected ? (
              <motion.span
                layoutId="aba-ativa"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="bg-accent absolute inset-x-3 -bottom-px h-0.5 rounded-full"
              />
            ) : null}
          </Link>
        )
      })}
    </div>
  )
}
