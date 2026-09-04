import { z } from 'zod'

/**
 * O app tem um número fechado de contas, criadas manualmente no Supabase.
 * Não existe cadastro público, então o formulário só precisa validar formato.
 *
 * A senha só é checada por estar preenchida. Regra de tamanho quem define é o
 * Supabase, onde as contas nascem; repeti-la aqui só criaria um jeito de o
 * login recusar uma senha que o servidor aceita.
 */
export const credentialsSchema = z.object({
  email: z.email({ message: 'Informe um e-mail válido.' }),
  password: z.string().min(1, { message: 'Informe a senha.' }),
})

export type Credentials = z.infer<typeof credentialsSchema>
