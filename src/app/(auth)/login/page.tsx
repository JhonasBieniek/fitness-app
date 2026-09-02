import type { Metadata } from 'next'

import { LoginForm } from '@/features/auth/components/login-form'

export const metadata: Metadata = { title: 'Entrar' }

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const params = await searchParams
  const redirectTo = typeof params.redirectTo === 'string' ? params.redirectTo : '/'

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="border-border bg-card w-full max-w-sm rounded-2xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">Treino &amp; Dieta</h1>
        <p className="text-muted-foreground mt-1 mb-6 text-sm">
          Entre com a sua conta para ver o dia de hoje.
        </p>

        <LoginForm redirectTo={redirectTo} />
      </div>
    </main>
  )
}
