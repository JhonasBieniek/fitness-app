import type { NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/proxy'

/**
 * Roda antes de qualquer render. Serve para dois propósitos: renovar o token do
 * Supabase (que expira em 1 h) e barrar acesso anônimo às rotas privadas.
 *
 * No Next 16 esta convenção se chama `proxy`; `middleware` está descontinuado.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Todas as rotas, exceto estáticos e imagens — sem isso o redirect de
     * autenticação bloquearia CSS, JS e ícones.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
