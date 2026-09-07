'use client'

import { Moon, Sun } from '@phosphor-icons/react/dist/ssr'

import { aplicarTema, useTema } from '@/features/theme/components/theme-store'
import type { Theme } from '@/features/theme/domain/theme'
import { sincronizarTema } from '@/features/theme/server/actions'
import { cn } from '@/shared/lib/cn'

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'claro', label: 'Claro', Icon: Sun },
  { value: 'escuro', label: 'Escuro', Icon: Moon },
]

export function ThemeToggle({ theme }: { theme: Theme }) {
  const atual = useTema(theme)

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="border-line bg-surface-2 relative flex rounded-full border p-0.5"
    >
      {/* Duas opções de mesma largura: a pílula desliza sem precisar ser medida. */}
      <span
        aria-hidden
        className="bg-surface pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{
          transform: `translate3d(${
            Math.max(
              0,
              OPTIONS.findIndex((o) => o.value === atual),
            ) * 100
          }%, 0, 0)`,
        }}
      />

      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = atual === value

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => {
              if (isActive) return

              aplicarTema(value)

              // Guardar no perfil é o que faz a escolha acompanhar a pessoa em
              // outro aparelho. Não vale segurar a tela por isso: a cor já
              // mudou, e se a rede falhar o custo é só o outro aparelho abrir
              // no tema antigo.
              void sincronizarTema(value).catch(() => {})
            }}
            className={cn(
              'relative flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors',
              isActive ? 'text-ink' : 'text-ink-2',
            )}
          >
            <Icon size={14} weight="regular" aria-hidden />
            {label}
          </button>
        )
      })}
    </div>
  )
}
