'use client'

import { Plus } from '@phosphor-icons/react/dist/ssr'
import { useState } from 'react'

import { parseNoteBody } from '@/features/nutrition/domain/note-blocks'
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

            {isOpen ? <NoteBody body={note.body} /> : null}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * O corpo da nota: prosa onde é prosa, tabela onde há pares.
 *
 * Substituições e listas viravam um paredão de texto — para saber por quanto
 * trocar o arroz era preciso ler a frase inteira. Em duas colunas a resposta
 * está na linha, e a nota volta a servir para consulta rápida na cozinha.
 */
function NoteBody({ body }: { body: string }) {
  return (
    <div className="px-3.5 pb-3.5">
      {parseNoteBody(body).map((block, index) =>
        block.kind === 'tabela' ? (
          <table key={index} className="mt-2.5 w-full border-collapse text-left first:mt-0">
            <tbody className="divide-line divide-y">
              {block.rows.map((row) => (
                <tr key={row.label} className="align-baseline">
                  <th scope="row" className="w-[38%] py-2 pr-3 text-[13px] font-semibold">
                    {row.label}
                  </th>
                  <td className="text-ink-2 py-2 text-[13px] leading-snug">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p key={index} className="text-ink-2 mt-2 text-[13.5px] leading-relaxed first:mt-0">
            {block.text}
          </p>
        ),
      )}
    </div>
  )
}
