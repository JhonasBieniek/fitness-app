'use client'

import { Barbell, ForkKnife, UserCircle } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/shared/lib/cn'

const ITEMS = [
  { href: '/treino', label: 'Treino', Icon: Barbell },
  { href: '/dieta', label: 'Dieta', Icon: ForkKnife },
  { href: '/perfil', label: 'Perfil', Icon: UserCircle },
] as const

/**
 * Navegação principal. Três destinos, fixos no rodapé, dentro do alcance do
 * polegar — é onde a mão já está quando o celular é segurado com uma mão só.
 *
 * O item ativo muda de cor em vez de mudar de peso: um ícone preenchido pesa
 * demais numa barra que fica visível o tempo todo.
 */
export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="border-line bg-surface/85 sticky bottom-0 z-20 border-t backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 transition-colors active:scale-[0.97]',
                  isActive ? 'text-accent' : 'text-ink-2',
                )}
              >
                <Icon size={23} weight="regular" aria-hidden />
                <span className="text-[11px] leading-none font-medium tracking-wide">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
