@AGENTS.md

# Treino & Dieta

App web de acompanhamento diário de treino e alimentação para um grupo fechado
de usuários. Cada pessoa tem o próprio plano; o app decide **o que mostrar agora**
a partir do dia da semana e da hora local, e registra o que foi feito: carga
levantada, refeição concluída e água ingerida.

Interface e conteúdo em **português do Brasil**. Mobile-first: o uso real é com o
celular na mão, dentro da academia ou na cozinha.

## Stack

| Camada       | Escolha                                                    |
| ------------ | ---------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, Server Components, Turbopack)      |
| Linguagem    | TypeScript `strict` + `noUncheckedIndexedAccess`           |
| UI           | Tailwind CSS v4 com tokens em CSS custom properties        |
| Backend      | Route Handlers e Server Actions **dentro do próprio Next** |
| Banco / Auth | Supabase (Postgres + Auth), acessado via `@supabase/ssr`   |
| Validação    | Zod, no limite entre entrada externa e domínio             |
| Testes       | Vitest sobre o domínio puro                                |
| Deploy       | Vercel (plano free)                                        |

**A API vive no monorepo, não em Edge Functions.** Um único deploy, um único
lugar para tipos e regras, e o Supabase entra apenas como banco autenticado.
Só considere uma Edge Function se algo precisar rodar fora do ciclo de request
do app (webhook de terceiro, job agendado pelo próprio Supabase).

## Comandos

```bash
npm run dev            # servidor de desenvolvimento
npm run verify         # typecheck + lint + testes — rode antes de abrir PR
npm run test:watch     # testes em watch
npm run format         # prettier
npm run db:migrate     # aplica as migrations no projeto linkado
npm run db:types       # regenera src/lib/supabase/database.types.ts
```

`npm run verify` é o mesmo conjunto que o CI executa, mais o build.

## Arquitetura

```
src/
  app/                    rotas. Camada fina: resolve params, chama o server layer, compõe UI
    (auth)/login          rota pública
    (app)/                tudo aqui exige sessão
  features/<feature>/
    domain/               TypeScript puro: regras, cálculos, tipos. Sem I/O
    server/               acesso a dados e Server Actions. `server-only`
    components/           UI da feature
  shared/
    lib/                  utilitários sem dependência de feature (tempo, cn)
    ui/                   primitivos visuais reaproveitados
  lib/
    env.ts                variáveis de ambiente validadas com Zod
    supabase/             clients (browser, server, proxy) e tipos do banco
  proxy.ts                renova a sessão e protege as rotas privadas
supabase/migrations/      schema versionado, uma migration por mudança
```

### A regra que sustenta o resto

**`domain/` não importa framework, banco nem I/O.** É onde mora a lógica que
decide o treino do dia, a refeição do horário e a próxima carga sugerida — e é
justamente essa lógica que precisa ser testável sem subir servidor nem banco.
O ESLint bloqueia esses imports; se a regra estiver atrapalhando, o desenho
está errado, não a regra.

Consequência prática: **nada de `new Date()` dentro do domínio.** O instante
sempre chega por parâmetro. Sem isso não dá para testar "o que aparece às
21h de uma quarta-feira" sem mexer no relógio da máquina.

### Fluxo de dados

Server Component chama `features/*/server` → repositório monta a query no
Supabase → o resultado vira tipo de domínio → o domínio calcula → a UI renderiza.
Mutações passam por Server Actions, que validam com Zod antes de tocar no banco.

Use Client Components apenas onde há interação real (formulário, contador de
água, registro de série). O padrão é Server Component.

## Banco de dados

- **Toda tabela tem RLS habilitada**, com policy comparando `auth.uid()` à
  coluna de dono. Sem exceção: a chave anônima chega ao browser, e RLS é a
  única coisa entre um usuário e os dados do outro.
- Envolva `auth.uid()` em `(select auth.uid())` nas policies: o Postgres
  materializa o valor uma vez em vez de reavaliar por linha.
- Schema muda **só por migration** em `supabase/migrations/`, nunca pelo painel.
  Depois de aplicar, rode `npm run db:types` e comite o arquivo gerado.
- Não existe cadastro público. Contas são criadas no painel do Supabase e o
  perfil é criado por trigger.
- Índice em toda coluna usada em filtro de policy ou em `where` recorrente.

## Convenções de código

- Componentes e tipos em `PascalCase`; funções e variáveis em `camelCase`;
  arquivos em `kebab-case`.
- Um componente por arquivo, com o nome do arquivo batendo com o do componente.
- `export function` nomeado. `export default` só onde o Next exige (páginas, layouts).
- Prefira `type` a `interface`, exceto quando precisar de merge de declaração.
- Sem `any`. Sem `as` para calar o compilador — se um cast for inevitável,
  ele vem com um comentário dizendo por quê.
- Datas trafegam como `Date` ou `YYYY-MM-DD`; horários do dia como minutos
  desde a meia-noite (`shared/lib/time.ts`), nunca como string solta.
- Comentário explica **por que**, não o que o código já diz. Código que precisa
  de comentário para ser entendido geralmente precisa ser reescrito.

### Textos

Toda string visível ao usuário é em português, com acentuação correta e sem
jargão técnico vazando para a interface. Mensagens de erro dizem o que fazer,
não o que falhou internamente.

## Testes

Vitest, com foco em `domain/` e `shared/lib/`. Cobrir:

- cálculo de dia/horário e resolução do bloco atual, incluindo virada de dia,
  fuso e horário de verão;
- progressão de carga e regras de fase do bloco de treino;
- qualquer conversão de unidade ou porção.

Não escreva teste para componente que só renderiza props. Teste comportamento,
não implementação.

## Fluxo de trabalho

1. Branch a partir de `main`, nomeada pelo escopo: `feat/`, `fix/`, `chore/`,
   `docs/`, `refactor/` (ex.: `feat/registro-de-carga`).
2. Commits no formato **Conventional Commits, com descrição em português**
   (`feat: registra carga por série`). Mensagem enxuta, no imperativo, sem
   rodapés ou trailers automáticos.
3. Um commit por unidade lógica de mudança. Nada de "wip" ou "ajustes".
4. `npm run verify` antes de abrir o PR.
5. PR com descrição do que muda e por quê. O CI precisa passar para o merge.
6. `main` sempre deployável.

## Limites do plano free

- **Supabase pausa o projeto após 7 dias sem requisição.** Se o app ficar fora
  do ar sem motivo aparente, esse é o primeiro lugar a olhar.
- Sem réplicas nem PITR: o schema versionado nas migrations é o backup real.
- Vercel: funções com limite de execução. Nada de trabalho pesado no request;
  o cálculo do dia é barato de propósito.

## O que não fazer

- Não colocar segredo em variável `NEXT_PUBLIC_*`.
- Não usar `supabase.auth.getSession()` para autorizar: ele só lê o cookie.
  Sempre `getUser()`, que valida o token no servidor.
- Não confiar no `user_id` vindo do cliente. Ele sai da sessão, no servidor.
- Não desabilitar RLS "só para testar".
- Não instalar biblioteca nova sem necessidade clara; peso de bundle importa
  em app que abre no 4G da academia.
- Não hardcodar o plano de treino ou a dieta no código: são dados, ficam no banco.
