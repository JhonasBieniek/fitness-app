import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { buildMealTimeline, type MealSchedule } from '@/features/nutrition/domain/timeline'
import { FastingNote } from '@/features/nutrition/components/fasting-note'
import { MealCard } from '@/features/nutrition/components/meal-card'
import { PlanDetails } from '@/features/nutrition/components/plan-details'
import { ScheduleToggle } from '@/features/nutrition/components/schedule-toggle'
import { SCHEDULE_COOKIE } from '@/features/nutrition/server/cookies'
import { getActiveMealPlan } from '@/features/nutrition/server/queries'
import { getProfile } from '@/features/profile/server/queries'
import { publicEnv } from '@/lib/env'
import { formatTimeOfDay, zonedNow } from '@/shared/lib/time'

export const metadata: Metadata = { title: 'Dieta' }

// Qual refeição está em destaque depende da hora do acesso.
export const dynamic = 'force-dynamic'

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function formatLiters(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export default async function DietaPage() {
  const [profile, plan, cookieStore] = await Promise.all([
    getProfile(),
    getActiveMealPlan(),
    cookies(),
  ])

  if (!plan) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
        <h1 className="text-[17px] font-semibold">Nenhum plano ativo</h1>
        <p className="text-ink-2 text-[14px] leading-snug">
          Assim que um cardápio for cadastrado, as refeições do dia aparecem aqui.
        </p>
      </main>
    )
  }

  const saved = cookieStore.get(SCHEDULE_COOKIE)?.value
  const schedule: MealSchedule =
    saved === 'manha_jejum' || saved === 'tarde_noite'
      ? saved
      : (profile?.defaultMealSchedule ?? 'manha_jejum')

  const now = zonedNow(new Date(), profile?.timeZone ?? publicEnv().NEXT_PUBLIC_APP_TIMEZONE)
  const timeline = buildMealTimeline(plan.meals, schedule, now.minutesOfDay)

  // Abre a refeição do momento. Antes da primeira do dia, abre a que vem.
  const hasCurrent = timeline.some((entry) => entry.status === 'agora')
  const openStatus = hasCurrent ? 'agora' : 'proxima'

  const macros = [
    { value: formatNumber(plan.kcalTarget), unit: '', label: 'kcal por dia' },
    { value: formatNumber(plan.proteinG), unit: 'g', label: 'proteína' },
    { value: formatNumber(plan.carbG), unit: 'g', label: 'carboidrato' },
    { value: formatNumber(plan.fatG), unit: 'g', label: 'gordura' },
  ]

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pt-4 pb-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-[20px] leading-tight font-semibold tracking-tight">Alimentação</h1>
          <p className="text-ink-3 tabular font-mono text-[12px]">
            agora {formatTimeOfDay(now.minutesOfDay)}
          </p>
        </div>

        <ScheduleToggle schedule={schedule} />
      </header>

      {/*
        Metas do dia em um bloco só, separadas por fios. Quatro caixas soltas
        pesariam mais que os quatro números que elas carregam.
      */}
      <section aria-label="Metas do dia">
        <dl className="border-line bg-surface rounded-card grid grid-cols-2 overflow-hidden border">
          {macros.map((macro, index) => (
            <div
              key={macro.label}
              className={`border-line px-3.5 py-3 ${index % 2 === 0 ? 'border-r' : ''} ${index < 2 ? 'border-b' : ''}`}
            >
              <dd className="tabular font-mono text-[21px] leading-none font-medium">
                {macro.value}
                {macro.unit ? <span className="text-ink-2 text-[15px]"> {macro.unit}</span> : null}
              </dd>
              <dt className="text-ink-2 mt-1.5 text-[11.5px] leading-none tracking-wide uppercase">
                {macro.label}
              </dt>
            </div>
          ))}
        </dl>

        <p className="text-ink-3 mt-2 text-[12.5px] leading-snug">
          {plan.proteinMinG ? `Mínimo de ${plan.proteinMinG} g de proteína. ` : ''}
          Água: {formatLiters(plan.waterMinL)}
          {plan.waterMaxL ? ` a ${formatLiters(plan.waterMaxL)}` : ''} L por dia.
        </p>
      </section>

      {schedule === 'manha_jejum' && plan.fastingNote ? (
        <FastingNote title={plan.fastingNote.title} body={plan.fastingNote.body} />
      ) : null}

      <section aria-label="Refeições do dia">
        <ul className="flex flex-col gap-2">
          {timeline.map((entry) => (
            <MealCard
              key={entry.meal.id}
              meal={entry.meal}
              time={entry.time}
              status={entry.status}
              defaultOpen={entry.status === openStatus}
            />
          ))}
        </ul>
      </section>

      {plan.rules.length > 0 ? (
        <section aria-label="Regras do plano">
          <h2 className="text-ink-2 mb-2 text-[11.5px] font-medium tracking-wide uppercase">
            Regras
          </h2>

          <dl className="grid grid-cols-2 gap-2">
            {plan.rules.map((rule) => (
              <div key={rule.id} className="border-line bg-surface rounded-card border px-3 py-2.5">
                <dt className="text-[13px] font-semibold">{rule.title}</dt>
                <dd className="text-ink-2 mt-1 text-[12.5px] leading-snug">{rule.body}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <PlanDetails notes={plan.details} />
    </main>
  )
}
