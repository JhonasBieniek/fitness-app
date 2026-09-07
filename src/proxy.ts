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
     * Todas as rotas, exceto o que é público por natureza.
     *
     * O manifesto e o service worker precisam estar aqui: o navegador os busca
     * sem cookie de sessão, então o guarda os devolvia como um redirect para
     * `/login` e o PWA ficava sem nome, sem ícone e sem tela de instalação.
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw\.js|offline|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
