'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { signIn, type SignInState } from '@/features/auth/server/actions'

const initialState: SignInState = { error: null }

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-accent text-accent-ink rounded-card mt-2 h-12 text-[15px] font-semibold transition active:scale-[0.985] disabled:opacity-60"
    >
      {pending ? 'Entrando…' : 'Entrar'}
    </button>
  )
}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useActionState(signIn, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <label className="flex flex-col gap-1.5">
        <span className="text-ink-2 text-[13px] font-medium">E-mail</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          // O teclado do celular não deve corrigir nem capitalizar um e-mail.
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="border-line bg-surface focus:border-accent rounded-card h-12 border px-3.5 text-[15px] outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-ink-2 text-[13px] font-medium">Senha</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border-line bg-surface focus:border-accent rounded-card h-12 border px-3.5 text-[15px] outline-none"
        />
      </label>

      {state.error ? (
        <p role="alert" className="text-warn text-[13px]">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-ink-3 mt-1 text-center text-[12.5px] leading-snug">
        A sessão fica salva neste aparelho. Você só entra de novo se sair da conta.
      </p>
    </form>
  )
}
