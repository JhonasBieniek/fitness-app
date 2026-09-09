import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { publicEnv } from '@/lib/env'

/** Rotas que podem ser acessadas sem sessão. */
const PUBLIC_ROUTES = ['/login', '/auth']

/**
 * Renova a sessão a cada request e barra acesso anônimo às rotas privadas.
 * Precisa devolver a mesma instância de response que recebeu os cookies.
 */
export async function updateSession(request: NextRequest) {
  const env = publicEnv()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }

          response = NextResponse.next({ request })

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }

          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value)
          }
        },
      },
    },
  )

  // Não colocar código entre createServerClient e getUser: qualquer await no
  // meio pode fazer a sessão ser descartada de forma difícil de depurar.
  //
  // Reabrir o app depois de um tempo em segundo plano costuma pegar a rede
  // ainda subindo: se o Supabase não responder a tempo, deixar a exceção
  // estourar derruba o proxy inteiro e a Vercel mostra a própria tela de erro
  // da infraestrutura, no lugar do app. Falhar aberto aqui só adia a checagem
  // por um request — quem realmente barra dado de outra pessoa é a RLS, no
  // Postgres, não este redirecionamento.
  let user = null
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch {
    return response
  }

  const { pathname } = request.nextUrl
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user && pathname === '/login') {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/'
    homeUrl.search = ''
    return NextResponse.redirect(homeUrl)
  }

  return response
}
