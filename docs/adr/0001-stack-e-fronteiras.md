# ADR 0001 — Stack e onde fica a API

- **Status:** aceita
- **Data:** 02/09/2026

## Contexto

App de treino e dieta para um grupo fechado de usuários, hospedado nos planos
gratuitos da Vercel e do Supabase. O app precisa de autenticação, dados por
usuário e uma camada que decida, a cada acesso, o que mostrar com base no dia
e no horário.

A dúvida central era onde colocar a lógica de servidor: em Supabase Edge
Functions ou dentro do próprio projeto Next.

## Decisão

Next.js 16 com App Router, hospedado na Vercel. **A lógica de servidor fica no
próprio projeto**, em Server Components, Server Actions e Route Handlers. O
Supabase é usado como Postgres gerenciado com autenticação e Row Level Security.

## Por quê

1. **Um deploy só.** Edge Functions têm ciclo de vida próprio: outro deploy,
   outro runtime (Deno), outro lugar para configurar segredo. Para um app deste
   tamanho, isso é custo sem retorno.
2. **Tipos de ponta a ponta.** Server Action e componente compartilham os
   mesmos tipos e o mesmo Zod. Entre Next e Edge Function, o contrato vira
   JSON e a garantia se perde no meio.
3. **Menos viagem de rede.** O Server Component consulta o Postgres direto. Com
   Edge Function haveria um salto extra a cada leitura, e o app é leitura-pesado.
4. **RLS resolve autorização.** Com a policy no banco, não é preciso uma camada
   de servidor extra só para impedir que um usuário leia os dados do outro.
5. **Fluid Compute cobre o caso.** O runtime Node da Vercel roda o que
   precisamos, sem as restrições do runtime edge.

## Consequências

- Todo acesso a dados passa por `features/*/server`, nunca direto de um componente.
- A chave `service_role` não entra no app: tudo roda com a sessão do usuário e RLS.
- Se um dia surgir necessidade de trabalho fora do ciclo de request — webhook de
  terceiro, job agendado — aí sim uma Edge Function ou um Cron da Vercel entra,
  como exceção justificada.
- Rotas que dependem da hora não podem ser estáticas. Isso é explícito no código.

## Alternativas consideradas

- **Supabase Edge Functions como API:** rejeitada pelos motivos acima. Continua
  disponível para casos fora do ciclo de request.
- **Backend separado (Nest, Fastify):** rejeitada. Adiciona um serviço, um
  deploy e um custo que o tamanho do problema não justifica.
- **Client-side puro com supabase-js:** rejeitada. Empurra regra de negócio para
  o browser e torna a lógica de horário dependente do relógio do dispositivo.
