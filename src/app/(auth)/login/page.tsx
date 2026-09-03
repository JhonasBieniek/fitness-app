import type { Metadata } from 'next'

import { LoginForm } from '@/features/auth/components/login-form'
import { ProtocolDial } from '@/shared/ui/protocol-dial'

export const metadata: Metadata = { title: 'Entrar' }

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const params = await searchParams
  const redirectTo = typeof params.redirectTo === 'string' ? params.redirectTo : '/treino'

  return (
    <main className="flex min-h-[100dvh] flex-1 flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <ProtocolDial className="text-accent size-9" />

        <h1 className="mt-5 text-[26px] leading-none font-semibold tracking-tight">Bloco</h1>
        <p className="text-ink-2 mt-2 mb-8 text-[14px] leading-snug">
          O treino de hoje e a refeição deste horário, dentro do seu protocolo de 12 semanas.
        </p>

        <LoginForm redirectTo={redirectTo} />
      </div>
    </main>
  )
}
