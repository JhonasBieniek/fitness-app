'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { MEAL_SCHEDULES, type MealSchedule } from '@/features/nutrition/domain/timeline'
import { SCHEDULE_COOKIE } from '@/features/nutrition/server/cookies'
import { createClient } from '@/lib/supabase/server'

/**
 * Escolhe entre treinar de manhã em jejum ou à tarde. Muda só o horário do café,
 * mas é o que decide qual refeição o app destaca de manhã.
 *
 * Vai para o cookie, lido na renderização, e para o perfil, que é o que faz a
 * escolha acompanhar a pessoa em outro aparelho.
 */
export async function setMealSchedule(schedule: MealSchedule) {
  if (!MEAL_SCHEDULES.includes(schedule)) return

  const store = await cookies()
  store.set(SCHEDULE_COOKIE, schedule, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.from('profiles').update({ default_meal_schedule: schedule }).eq('id', user.id)
  }

  revalidatePath('/dieta')
}
