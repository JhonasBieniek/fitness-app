import { requireUser } from '@/features/auth/server/session'
import { publicEnv } from '@/lib/env'
import { formatTimeOfDay, zonedNow } from '@/shared/lib/time'

/** O "hoje" depende da hora do request, então a rota nunca é estática. */
export const dynamic = 'force-dynamic'

const WEEKDAY_LABEL: Record<string, string> = {
  sunday: 'domingo',
  monday: 'segunda-feira',
  tuesday: 'terça-feira',
  wednesday: 'quarta-feira',
  thursday: 'quinta-feira',
  friday: 'sexta-feira',
  saturday: 'sábado',
}

export default async function TodayPage() {
  const user = await requireUser()
  const now = zonedNow(new Date(), publicEnv().NEXT_PUBLIC_APP_TIMEZONE)

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Olá, {user.displayName}</h1>
      <p className="text-muted-foreground text-sm">
        Hoje é {WEEKDAY_LABEL[now.weekday]}, {formatTimeOfDay(now.minutesOfDay)}.
      </p>
    </section>
  )
}
