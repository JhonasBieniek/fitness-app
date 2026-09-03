import type { Metadata } from 'next'

import { signOut } from '@/features/auth/server/actions'
import { requireUser } from '@/features/auth/server/session'
import { getProfile } from '@/features/profile/server/queries'
import { ThemeToggle } from '@/features/theme/components/theme-toggle'
import { getTheme } from '@/features/theme/server/theme'
import { resolveBlockStatus } from '@/features/training/domain/block'
import { getActiveBlock } from '@/features/training/server/queries'
import { publicEnv } from '@/lib/env'
import { ProtocolDial } from '@/shared/ui/protocol-dial'
import { zonedNow } from '@/shared/lib/time'

export const metadata: Metadata = { title: 'Perfil' }

export const dynamic = 'force-dynamic'

const LEVEL_LABEL = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
} as const

function formatDate(value: string) {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

export default async function PerfilPage() {
  const [user, profile, theme, block] = await Promise.all([
    requireUser(),
    getProfile(),
    getTheme(),
    getActiveBlock(),
  ])

  const timeZone = profile?.timeZone ?? publicEnv().NEXT_PUBLIC_APP_TIMEZONE
  const now = zonedNow(new Date(), timeZone)
  const status = block ? resolveBlockStatus(block.startedOn, now.localDate, block.totalWeeks) : null

  return (
    <main className="flex flex-1 flex-col gap-5 px-4 pt-4 pb-6">
      <header>
        <h1 className="text-[20px] leading-tight font-semibold tracking-tight">
          {profile?.displayName ?? user.displayName}
        </h1>
        <p className="text-ink-2 mt-1 text-[13px]">{user.email}</p>
      </header>

      {status && block ? (
        <section
          aria-label="Protocolo atual"
          className="border-line bg-surface rounded-card border p-4"
        >
          <div className="flex items-center gap-3">
            <ProtocolDial
              week={status.week}
              totalWeeks={status.totalWeeks}
              className="text-accent size-10"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] leading-tight font-semibold">{block.name}</p>
              <p className="text-ink-2 tabular mt-1 font-mono text-[12.5px] leading-none">
                semana {Math.min(status.week, status.totalWeeks)} de {status.totalWeeks} ·{' '}
                {status.phase.label.toLowerCase()}
              </p>
            </div>
          </div>

          <p className="text-ink-2 mt-3 text-[13px] leading-snug">{status.phase.guidance}</p>

          <dl className="border-line mt-3 grid grid-cols-2 gap-y-2 border-t pt-3 text-[12.5px]">
            <dt className="text-ink-3">Começou em</dt>
            <dd className="tabular text-right font-mono">{formatDate(block.startedOn)}</dd>

            <dt className="text-ink-3">Nível</dt>
            <dd className="text-right">{LEVEL_LABEL[profile?.level ?? 'iniciante']}</dd>
          </dl>

          {status.isExpired ? (
            <p className="bg-warn-soft text-warn rounded-card mt-3 px-3 py-2.5 text-[12.5px] leading-snug">
              As {status.totalWeeks} semanas terminaram. Vale medir quadril e coxa, tirar fotos e
              montar o próximo bloco com as cargas novas.
            </p>
          ) : null}
        </section>
      ) : null}

      <section aria-label="Aparência" className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold">Tema</h2>
          <p className="text-ink-2 text-[12.5px]">Vale para todos os seus aparelhos.</p>
        </div>

        <ThemeToggle theme={theme} />
      </section>

      <form action={signOut} className="border-line mt-auto border-t pt-4">
        <button
          type="submit"
          className="border-line text-ink-2 rounded-card w-full border py-3 text-[14px] font-medium transition active:scale-[0.985]"
        >
          Sair da conta
        </button>
      </form>
    </main>
  )
}
