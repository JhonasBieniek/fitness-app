'use client'

import { Plus } from '@phosphor-icons/react/dist/ssr'
import { useState } from 'react'

import type { PlanNote } from '@/features/nutrition/server/queries'
import { cn } from '@/shared/lib/cn'

/**
 * Os blocos longos do plano — ajuste de peso, substituições, listas de compras.
 *
 * Ficam recolhidos porque são consultados de vez em quando, não todo dia, e
 * abertos empurrariam as refeições para fora da tela.
 */
export function PlanDetails({ notes }: { notes: PlanNote[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (notes.length === 0) return null

  return (
    <ul className="border-line divide-line bg-surface rounded-card divide-y overflow-hidden border">
      {notes.map((note) => {
        const isOpen = openId === note.id

        return (
          <li key={note.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : note.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
            >
              <span className="flex-1 text-[14px] font-medium">{note.title}</span>
              <Plus
                size={14}
                weight="bold"
                aria-hidden
                className={cn('text-ink-3 shrink-0 transition-transform', isOpen && 'rotate-45')}
              />
            </button>

            {isOpen ? (
              <div className="px-3.5 pb-3.5">
                {note.body.split('\n\n').map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-ink-2 mt-2 text-[13.5px] leading-relaxed first:mt-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
