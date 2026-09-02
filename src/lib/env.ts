import { z } from 'zod'

/**
 * Validação das variáveis de ambiente. Falhar aqui, com o nome da variável que
 * faltou, é melhor do que descobrir um `undefined` dentro de uma query.
 *
 * A leitura é preguiçosa e memoizada de propósito: se o parse rodasse no topo
 * do módulo, um `next build` sem `.env` quebraria — e o build não precisa das
 * credenciais, só o runtime precisa.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_TIMEZONE: z.string().min(1).default('America/Sao_Paulo'),
})

const serverSchema = publicSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
})

type PublicEnv = z.infer<typeof publicSchema>
type ServerEnv = z.infer<typeof serverSchema>

function parse<T extends z.ZodType>(schema: T, source: unknown): z.infer<T> {
  const result = schema.safeParse(source)

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')

    throw new Error(`Variáveis de ambiente inválidas — ${details}`)
  }

  return result.data
}

let cachedPublicEnv: PublicEnv | undefined
let cachedServerEnv: ServerEnv | undefined

/**
 * Seguro no browser: só lê chaves `NEXT_PUBLIC_*`, que o Next inlina no bundle.
 * As referências precisam ser estáticas (`process.env.NOME`) para a substituição acontecer.
 */
export function publicEnv(): PublicEnv {
  cachedPublicEnv ??= parse(publicSchema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_TIMEZONE: process.env.NEXT_PUBLIC_APP_TIMEZONE,
  })

  return cachedPublicEnv
}

/** Só pode ser chamada de código que roda no servidor. */
export function serverEnv(): ServerEnv {
  cachedServerEnv ??= parse(serverSchema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_TIMEZONE: process.env.NEXT_PUBLIC_APP_TIMEZONE,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  })

  return cachedServerEnv
}
