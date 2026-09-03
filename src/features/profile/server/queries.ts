import 'server-only'

import { createClient } from '@/lib/supabase/server'

export type Profile = {
  id: string
  displayName: string
  /** `iniciante` é o que faz o alternador Acompanhada/Sozinha aparecer. */
  level: 'iniciante' | 'intermediario' | 'avancado'
  defaultMealSchedule: 'manha_jejum' | 'tarde_noite'
  theme: 'claro' | 'escuro'
  timeZone: string
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, level, default_meal_schedule, theme, time_zone')
    .maybeSingle()

  if (error) throw new Error(`Não foi possível carregar o perfil: ${error.message}`)
  if (!data) return null

  return {
    id: data.id,
    displayName: data.display_name,
    level: data.level,
    defaultMealSchedule: data.default_meal_schedule,
    theme: data.theme === 'escuro' ? 'escuro' : 'claro',
    timeZone: data.time_zone,
  }
}
