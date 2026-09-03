import type { Metadata } from 'next'

import { buildMealTimeline } from '@/features/nutrition/domain/timeline'
import { MealTimeline } from '@/features/nutrition/components/meal-timeline'
import { PlanDetails } from '@/features/nutrition/components/plan-details'
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
  const [profile, plan] = await Promise.all([getProfile(), getActiveMealPlan()])

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

  const now = zonedNow(new Date(), profile?.timeZone ?? publicEnv().NEXT_PUBLIC_APP_TIMEZONE)
  const timeline = buildMealTimeline(plan.meals, now.minutesOfDay)

  // Abre na refeição do momento. Antes da primeira do dia, na que vem.
  const focusedIndex = Math.max(
    0,
    timeline.findIndex((entry) => entry.status === 'agora' || entry.status === 'proxima'),
  )
  const macros = [
    { value: formatNumber(plan.kcalTarget), unit: '', label: 'kcal' },
    { value: formatNumber(plan.proteinG), unit: 'g', label: 'proteína' },
    { value: formatNumber(plan.carbG), unit: 'g', label: 'carbo' },
    { value: formatNumber(plan.fatG), unit: 'g', label: 'gordura' },
  ]

  return (
    <main className="flex flex-1 flex-col gap-5 px-4 pt-4 pb-6">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-[20px] leading-tight font-semibold tracking-tight">Alimentação</h1>
        <p className="text-ink-3 tabular font-mono text-[12px]">
          agora {formatTimeOfDay(now.minutesOfDay)}
        </p>
      </header>

      <MealTimeline entries={timeline} initialIndex={focusedIndex} />

      {/*
        Metas do dia em uma faixa de quatro números. Elas são referência do
        plano, não a pergunta que a tela responde, então não abrem a rota.
      */}
      <section aria-label="Metas do dia">
        <h2 className="text-ink-2 mb-1.5 text-[11.5px] font-medium tracking-wide uppercase">
          Metas do dia
        </h2>

        <dl className="divide-line border-line flex divide-x border-y py-2.5">
          {macros.map((macro) => (
            <div key={macro.label} className="flex-1 px-2 text-center first:pl-0 last:pr-0">
              <dd className="tabular font-mono text-[17px] leading-none font-medium">
                {macro.value}
                {macro.unit ? <span className="text-ink-3 text-[11px]"> {macro.unit}</span> : null}
              </dd>
              <dt className="text-ink-3 mt-1.5 text-[11px] leading-none">{macro.label}</dt>
            </div>
          ))}
        </dl>

        <p className="text-ink-3 mt-2 text-[12.5px] leading-snug">
          {plan.proteinMinG ? `Mínimo de ${plan.proteinMinG} g de proteína. ` : ''}
          Água: {formatLiters(plan.waterMinL)}
          {plan.waterMaxL ? ` a ${formatLiters(plan.waterMaxL)}` : ''} L por dia.
        </p>
      </section>

      {plan.rules.length > 0 ? (
        <section aria-label="Regras do plano">
          <h2 className="text-ink-2 mb-1 text-[11.5px] font-medium tracking-wide uppercase">
            Regras
          </h2>

          {/*
            Fios em vez de cartões: são seis frases curtas, e seis caixas
            desenhariam uma grade de alturas desiguais para não dizer mais nada.
          */}
          <dl className="divide-line divide-y">
            {plan.rules.map((rule) => (
              <div key={rule.id} className="flex items-baseline gap-3 py-2.5">
                <dt className="w-24 shrink-0 text-[13px] font-semibold">{rule.title}</dt>
                <dd className="text-ink-2 flex-1 text-[13px] leading-snug">{rule.body}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <PlanDetails notes={plan.details} />
    </main>
  )
}
