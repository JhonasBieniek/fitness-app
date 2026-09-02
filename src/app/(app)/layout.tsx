import { requireUser } from '@/features/auth/server/session'
import { signOut } from '@/features/auth/server/actions'

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const user = await requireUser()

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-border flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-semibold tracking-tight">Treino &amp; Dieta</span>

        <form action={signOut} className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm">{user.displayName}</span>
          <button
            type="submit"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
          >
            Sair
          </button>
        </form>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
