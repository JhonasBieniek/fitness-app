import { cn } from '@/shared/lib/cn'

type ProtocolDialProps = {
  /** Semana atual, de 1 em diante. Omitir desenha a marca neutra do app. */
  week?: number
  totalWeeks?: number
  className?: string
}

/**
 * Marca do app e, ao mesmo tempo, o indicador do protocolo.
 *
 * Doze marcas em círculo, uma por semana do bloco. As vencidas ficam cheias, a
 * atual vira um ponteiro apontando para o centro, as futuras ficam apagadas.
 * É o mesmo desenho do ícone do PWA: o que aparece no cabeçalho é o que a
 * pessoa toca na tela inicial do celular.
 *
 * As semanas são pontos, e não traços, por um motivo só: doze traços radiais em
 * volta de um vazio leem como indicador de carregamento. Pontos com um ponteiro
 * no meio leem como mostrador.
 */
export function ProtocolDial({ week, totalWeeks = 12, className }: ProtocolDialProps) {
  const ticks = Array.from({ length: totalWeeks }, (_, index) => index + 1)
  const current = week ?? 1

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn('shrink-0', className)}>
      {ticks.map((tick) => {
        const angle = ((tick - 1) / totalWeeks) * 2 * Math.PI - Math.PI / 2
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        if (current === tick) {
          return (
            <line
              key={tick}
              x1={12 + cos * 2.4}
              y1={12 + sin * 2.4}
              x2={12 + cos * 10.8}
              y2={12 + sin * 10.8}
              stroke="currentColor"
              strokeWidth={2.3}
              strokeLinecap="round"
            />
          )
        }

        return (
          <circle
            key={tick}
            cx={12 + cos * 9.9}
            cy={12 + sin * 9.9}
            r={0.95}
            fill="currentColor"
            opacity={tick > current ? 0.22 : 1}
          />
        )
      })}
    </svg>
  )
}
