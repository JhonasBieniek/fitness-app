# Treino & Dieta

App web para acompanhar treino e alimentação no dia a dia. Em vez de exigir que
o usuário procure a informação, o app usa o dia da semana e a hora local para
mostrar direto **o treino de hoje** e **a refeição deste horário** — e registra
o que foi feito: carga por série, refeição concluída e água ingerida.

## Status

Em construção. A fundação está pronta: autenticação, proteção de rotas,
schema inicial, testes e CI.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres +
Auth) · Vercel

A API roda dentro do próprio projeto Next, em Server Actions e Route Handlers.
O Supabase entra como banco autenticado com Row Level Security, não como backend.

## Rodando localmente

Requer Node 20.9+ e um projeto Supabase.

```bash
npm install
cp .env.example .env.local   # preencha com as chaves do seu projeto Supabase
npm run db:migrate           # aplica o schema
npm run dev
```

O app sobe em http://localhost:3000. Não há cadastro público: as contas são
criadas no painel do Supabase, em Authentication → Users.

## Scripts

| Comando              | O que faz                               |
| -------------------- | --------------------------------------- |
| `npm run dev`        | Servidor de desenvolvimento             |
| `npm run build`      | Build de produção                       |
| `npm run verify`     | Typecheck, lint e testes                |
| `npm run test:watch` | Testes em watch                         |
| `npm run db:migrate` | Aplica as migrations no projeto linkado |
| `npm run db:types`   | Regenera os tipos do banco              |

## Estrutura

```
src/app        rotas (App Router)
src/features   uma pasta por área do produto, com domain / server / components
src/shared     utilitários e primitivos de UI
src/lib        ambiente e clients do Supabase
supabase       schema versionado em migrations
docs/adr       decisões de arquitetura e o porquê de cada uma
```

A lógica que decide o que mostrar agora vive em `domain/`, em TypeScript puro,
sem acesso a banco ou framework — é o que permite testá-la em milissegundos.

## Documentação

- [Guia de desenvolvimento](CLAUDE.md)
- [Decisões de arquitetura](docs/adr/)
