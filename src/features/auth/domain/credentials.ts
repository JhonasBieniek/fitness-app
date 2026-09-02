import { z } from 'zod'

/**
 * O app tem um número fechado de contas, criadas manualmente no Supabase.
 * Não existe cadastro público, então o formulário só precisa validar formato.
 */
export const credentialsSchema = z.object({
  email: z.email({ message: 'Informe um e-mail válido.' }),
  password: z.string().min(8, { message: 'A senha precisa ter ao menos 8 caracteres.' }),
})

export type Credentials = z.infer<typeof credentialsSchema>
