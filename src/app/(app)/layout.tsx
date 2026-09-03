import { requireUser } from '@/features/auth/server/session'
import { BottomNav } from '@/shared/ui/bottom-nav'

/**
 * Casca da área autenticada. Largura travada em `max-w-md` porque o app é feito
 * para o celular: esticar as listas em um monitor largo não melhora nada e só
 * afasta o conteúdo do canto onde a pessoa está olhando.
 */
export default async function AppLayout({ children }: LayoutProps<'/'>) {
  await requireUser()

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">{children}</div>
      <BottomNav />
    </div>
  )
}
