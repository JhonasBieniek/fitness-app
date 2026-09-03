'use client'

import { CaretDown } from '@phosphor-icons/react/dist/ssr'
import { useId, useState } from 'react'

import { cn } from '@/shared/lib/cn'

type FastingNoteProps = { title: string; body: string }

/**
 * Aviso do treino em jejum, recolhido.
 *
 * O texto é longo e se lê uma vez; aberto, ele empurra as refeições — que são
 * o conteúdo da tela — para fora da primeira dobra. Recolhido, continua visível
 * como sinal de que o horário em jejum está ativo, e abre com um toque.
 */
export function FastingNote({ title, body }: FastingNoteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()

  return (
    <section className="bg-warn-soft rounded-card overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="text-warn flex w-full items-center gap-2 px-3.5 py-2.5 text-left"
      >
        <span className="flex-1 text-[13px] font-semibold">{title}</span>
        <CaretDown
          size={14}
          weight="bold"
          aria-hidden
          className={cn('shrink-0 opacity-70 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen ? (
        <div id={panelId} className="px-3.5 pb-3">
          {body.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-warn mt-1.5 text-[13px] leading-snug opacity-90">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  )
}
