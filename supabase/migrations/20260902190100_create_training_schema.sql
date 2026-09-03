-- Treino: catálogo de exercícios, bloco de 12 semanas e prescrição por dia.

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------
-- Compartilhado entre os usuários: um agachamento é o mesmo agachamento para
-- todo mundo. Só a prescrição é individual.
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  equipment text not null,
  primary_muscle text not null,
  -- Duas fotos do mesmo movimento (início e fim). Alternadas, mostram a
  -- execução sem depender de vídeo hospedado por terceiro.
  media_start_path text,
  media_end_path text,
  cue text
);

comment on table public.exercises is 'Catálogo de exercícios, comum a todos os usuários.';

alter table public.exercises enable row level security;

create policy "exercises_select_authenticated"
  on public.exercises for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Bloco de 12 semanas
-- ---------------------------------------------------------------------------
create table public.training_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  -- O protocolo inteiro é contado a partir daqui. Trocar esta data reinicia o bloco.
  started_on date not null,
  total_weeks smallint not null default 12 check (total_weeks between 1 and 52),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on column public.training_blocks.started_on is 'Início do protocolo: define a semana atual e quando ele vence.';

create index training_blocks_user_active_idx on public.training_blocks (user_id, is_active);

create table public.training_days (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.training_blocks (id) on delete cascade,
  -- ISO: 1 = segunda ... 7 = domingo.
  weekday smallint not null check (weekday between 1 and 7),
  title text not null,
  focus text,
  duration_minutes smallint,
  unique (block_id, weekday)
);

create index training_days_block_idx on public.training_days (block_id);

create table public.training_day_exercises (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.training_days (id) on delete cascade,
  position smallint not null,
  -- As duas colunas do plano. `solo` cai para `partnered` quando não há versão
  -- em máquina para o movimento.
  exercise_partnered_id uuid not null references public.exercises (id),
  exercise_solo_id uuid references public.exercises (id),
  sets smallint not null check (sets > 0),
  reps text not null,
  rest_seconds smallint,
  note text,
  -- Semanas 7–10 trocam volume e faixa de repetições nos compostos. Nulo
  -- significa "não muda de fase".
  strength_sets smallint check (strength_sets > 0),
  strength_reps text,
  -- Unilaterais saem do deload em vez de reduzir séries.
  skip_on_deload boolean not null default false,
  unique (day_id, position)
);

create index training_day_exercises_day_idx on public.training_day_exercises (day_id);

-- Blocos, dias e prescrições seguem o dono do bloco.
alter table public.training_blocks enable row level security;
alter table public.training_days enable row level security;
alter table public.training_day_exercises enable row level security;

create policy "training_blocks_select_own"
  on public.training_blocks for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "training_days_select_own"
  on public.training_days for select
  to authenticated
  using (
    exists (
      select 1 from public.training_blocks b
      where b.id = block_id and b.user_id = (select auth.uid())
    )
  );

create policy "training_day_exercises_select_own"
  on public.training_day_exercises for select
  to authenticated
  using (
    exists (
      select 1
      from public.training_days d
      join public.training_blocks b on b.id = d.block_id
      where d.id = day_id and b.user_id = (select auth.uid())
    )
  );
