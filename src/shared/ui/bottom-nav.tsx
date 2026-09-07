'use client'

import { Barbell, ForkKnife, UserCircle } from '@phosphor-icons/react/dist/ssr'
import Link, { useLinkStatus } from 'next/link'
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
 *
 * Os três buscam a rota inteira antes do toque. São três destinos fixos, sempre
 * na tela, com uma resposta de poucos quilobytes cada: dá para ter todas em mãos
 * e trocar de tela sem ida ao servidor. `prefetch` também é o que faz o Next
 * guardar a resposta por cinco minutos em vez de descartá-la na hora.
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
        {ITEMS.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              prefetch
              aria-current={
                pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined
              }
              className="block"
            >
              <NavItem
                label={label}
                Icon={Icon}
                isActive={pathname === href || pathname.startsWith(`${href}/`)}
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

type NavItemProps = {
  label: string
  Icon: typeof Barbell
  isActive: boolean
}

/**
 * `useLinkStatus` só funciona dentro do `<Link>`, por isso o item é um
 * componente à parte.
 *
 * O destaque acompanha o toque, não a navegação: `usePathname` só muda quando a
 * rota entra, e esperar por ele faz o dedo bater em um botão que não reage. O
 * traço de carregamento nasce transparente e leva 200 ms para aparecer — numa
 * troca instantânea, que é o caso normal agora, ninguém chega a vê-lo.
 */
function NavItem({ label, Icon, isActive }: NavItemProps) {
  const { pending } = useLinkStatus()

  return (
    <span
      className={cn(
        'relative flex flex-col items-center gap-1 py-2.5 transition-colors duration-150',
        isActive || pending ? 'text-accent' : 'text-ink-2',
      )}
    >
      <Icon size={23} weight="regular" aria-hidden />
      <span className="text-[11px] leading-none font-medium tracking-wide">{label}</span>

      {pending ? (
        <span
          aria-hidden
          className="bg-accent absolute inset-x-6 top-0 h-0.5 origin-left [animation:bloco-carregando_1.2s_ease-out_200ms_infinite] rounded-full opacity-0 motion-reduce:hidden"
        />
      ) : null}
    </span>
  )
}
