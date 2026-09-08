'use client'

import { useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'

export type TabRailItem = {
  id: string
  /** Linha de cima, curta: o dia da semana ou o horário. */
  eyebrow: string
  /** Linha de baixo: o grupo muscular ou o nome da refeição. */
  title: string
  /** Marca o item que corresponde a agora — hoje, ou a refeição do horário. */
  isNow?: boolean
  nowLabel?: string
}

type TabRailProps = {
  label: string
  items: TabRailItem[]
  selectedId: string
  onSelect: (id: string) => void
}

/**
 * Faixa de abas rolável com um traço que desliza até a aba aberta.
 *
 * As duas rotas do app se navegam assim — uma régua de tempo com uma coisa em
 * foco —, então a faixa é uma só e mora aqui.
 *
 * O traço é um elemento único movido por `transform`, e não um por aba trocando
 * de lugar. Assim a animação roda no compositor, sem passar pela thread
 * principal, e o app deixa de carregar uma biblioteca de animação inteira para
 * mover um retângulo de dois pixels de altura.
 */
export function TabRail({ label, items, selectedId, onSelect }: TabRailProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const [traco, setTraco] = useState<{ left: number; width: number } | null>(null)

  // Mede depois do layout e antes da pintura: medir num efeito comum deixaria o
  // traço aparecer uma vez na posição errada.
  useLayoutEffect(() => {
    const active = activeRef.current
    if (!active) return

    const medida = { left: active.offsetLeft, width: active.offsetWidth }

    // Só troca o estado quando a medida mudou: o pai re-renderiza a faixa a
    // cada série marcada, e cada uma custaria uma segunda pintura à toa.
    setTraco((atual) =>
      atual && atual.left === medida.left && atual.width === medida.width ? atual : medida,
    )
  }, [selectedId, items])

  // Centraliza a aba aberta só na montagem: na sexta, ou às 21h, a aba certa
  // nasce fora da tela. Recentralizar a cada toque faria a faixa fugir do dedo.
  useLayoutEffect(() => {
    const rail = railRef.current
    const active = activeRef.current
    if (!rail || !active) return

    rail.scrollTo({
      left: active.offsetLeft - rail.clientWidth / 2 + active.clientWidth / 2,
      behavior: 'instant',
    })
  }, [])

  return (
    <div
      ref={railRef}
      role="tablist"
      aria-label={label}
      className="no-scrollbar border-line relative flex gap-1 overflow-x-auto border-b [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] px-3"
    >
      {items.map((item) => {
        const isSelected = item.id === selectedId

        return (
          <button
            key={item.id}
            ref={isSelected ? activeRef : undefined}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(item.id)}
            className={cn(
              'shrink-0 px-3 pt-2.5 pb-3 text-left transition-colors duration-150',
              isSelected ? 'text-ink' : 'text-ink-3',
            )}
          >
            <span className="flex items-center gap-1.5">
              <span className="tabular font-mono text-[11px] tracking-wider uppercase">
                {item.eyebrow}
              </span>
              {item.isNow ? (
                <span className="bg-accent size-1.5 rounded-full" aria-label={item.nowLabel} />
              ) : null}
            </span>

            <span className="mt-0.5 block text-[14px] leading-tight font-semibold whitespace-nowrap">
              {item.title}
            </span>
          </button>
        )
      })}

      {traco ? (
        <span
          aria-hidden
          className="bg-accent pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full transition-[transform,width] duration-[260ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{
            width: `${traco.width - 24}px`,
            transform: `translate3d(${traco.left + 12}px, 0, 0)`,
          }}
        />
      ) : null}
    </div>
  )
}
