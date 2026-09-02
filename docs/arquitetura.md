# Arquitetura

## Camadas

```
Rota (app/)
  └─ chama → Server layer (features/*/server)
                └─ consulta → Supabase (RLS por usuário)
                └─ entrega → Domínio (features/*/domain)
                                └─ devolve → dados prontos para a UI
```

Cada camada só conhece a de baixo. O domínio não conhece nenhuma.

| Camada                  | Pode importar         | Não pode importar          |
| ----------------------- | --------------------- | -------------------------- |
| `app/`                  | tudo                  | —                          |
| `features/*/components` | domínio, shared       | acesso a banco direto      |
| `features/*/server`     | domínio, lib/supabase | componentes                |
| `features/*/domain`     | domínio, shared/lib   | Next, React, Supabase, I/O |

A última linha é garantida por regra de ESLint, não por disciplina.

## Por que o domínio é puro

A parte mais característica do app é decidir o que mostrar agora. Essa decisão
depende de dia da semana, horário local, fase do bloco de treino e histórico do
usuário — muita combinação para verificar clicando na tela.

Com o domínio puro e o instante recebido por parâmetro, cada cenário vira um
teste de milissegundos: "quarta-feira, 21h05, semana 8 do bloco". Sem isso,
verificar a virada de dia ou o horário de verão exigiria mexer no relógio da máquina.

## Tempo

`src/shared/lib/time.ts` concentra tudo que envolve data e hora:

- `zonedNow(instant, timeZone)` converte um instante absoluto no dia e no
  minuto locais. O servidor da Vercel roda em UTC; o usuário, não.
- `resolveSlot(slots, minutesOfDay)` responde qual bloco do dia está ativo,
  qual vem a seguir e qual acabou de passar. Serve tanto para refeição quanto
  para janela de treino.
- Horários trafegam como minutos desde a meia-noite. `'09:30'` e `'9:30'`
  comparam mal; `570` não.

Fuso e horário de verão vêm da base de fusos via `Intl`, nunca de offset fixo.

## Autenticação

1. `src/proxy.ts` roda antes de cada render, renova o token do Supabase e
   redireciona quem não tem sessão para `/login`.
2. Páginas privadas chamam `requireUser()`, que valida o token no servidor do
   Supabase com `getUser()` — `getSession()` só lê o cookie e não serve para autorizar.
3. RLS no Postgres é a última linha: mesmo com um token válido, o usuário só
   alcança as próprias linhas.

Três camadas de propósito. A do proxy é conveniência de navegação; a do banco
é a que de fato protege.

## Dados

O plano de treino e a dieta são **dados**, não código. Estão no banco, por
usuário, e podem mudar sem deploy. O código conhece a forma (refeição tem
horário-alvo e opções; exercício tem séries, faixa de repetições e variantes),
não o conteúdo.
