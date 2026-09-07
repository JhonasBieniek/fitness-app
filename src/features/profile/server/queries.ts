import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { isTheme, type Theme } from '@/features/theme/domain/theme'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export type Profile = {
  id: string
  displayName: string
  /** `iniciante` é o que faz o alternador Acompanhada/Sozinha aparecer. */
  level: 'iniciante' | 'intermediario' | 'avancado'
  theme: Theme
  timeZone: string
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, level, theme, time_zone')
    .maybeSingle()

  if (error) throw new Error(`Não foi possível carregar o perfil: ${error.message}`)
  if (!data) return null

  return {
    id: data.id,
    displayName: data.display_name,
    level: data.level,
    theme: isTheme(data.theme) ? data.theme : 'claro',
    timeZone: data.time_zone,
  }
}

/**
 * Recebe o cliente porque quem chama é o login, logo depois de autenticar: usar
 * o mesmo cliente dispensa esperar a sessão nova voltar pelos cookies.
 *
 * Devolve `null` quando não há perfil ou o valor gravado não é um tema
 * conhecido — quem chama trata isso mantendo o tema padrão.
 */
export async function getProfileTheme(supabase: SupabaseClient<Database>): Promise<Theme | null> {
  const { data } = await supabase.from('profiles').select('theme').maybeSingle()

  return isTheme(data?.theme) ? data.theme : null
}
