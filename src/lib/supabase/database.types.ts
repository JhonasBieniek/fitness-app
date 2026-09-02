/**
 * Tipos gerados a partir do schema do Supabase.
 *
 * Regenerar com `npm run db:types` sempre que uma migration alterar o schema.
 * O arquivo é versionado de propósito: o CI faz typecheck sem acesso ao banco.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
