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
      className="bg-primary text-primary-foreground focus-visible:ring-ring h-11 rounded-xl text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
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
        <span className="text-muted-foreground text-sm font-medium">E-mail</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border-input bg-background focus-visible:ring-ring h-11 rounded-xl border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-sm font-medium">Senha</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border-input bg-background focus-visible:ring-ring h-11 rounded-xl border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </label>

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  )
}
