-- Alimentação: metas do dia, refeições por horário e as regras do plano.

create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  kcal_target smallint not null,
  protein_g smallint not null,
  protein_min_g smallint,
  carb_g smallint not null,
  fat_g smallint not null,
  water_min_l numeric(3, 1) not null,
  water_max_l numeric(3, 1),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index meal_plans_user_active_idx on public.meal_plans (user_id, is_active);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.meal_plans (id) on delete cascade,
  position smallint not null,
  name text not null,
  -- Cada refeição tem um horário por distribuição: treinar de manhã em jejum
  -- só desloca o café, mas o app precisa saber os dois horários.
  time_fasted time not null,
  time_evening time not null,
  kcal smallint,
  protein_g smallint,
  note text,
  unique (plan_id, position)
);

create index meals_plan_idx on public.meals (plan_id);

-- Algumas refeições têm alternativas equivalentes (prato, lanche, vitamina).
-- Refeições sem escolha têm exatamente uma opção, o que mantém a leitura uniforme.
create table public.meal_options (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals (id) on delete cascade,
  position smallint not null,
  label text,
  note text,
  unique (meal_id, position)
);

create index meal_options_meal_idx on public.meal_options (meal_id);

create table public.meal_items (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.meal_options (id) on delete cascade,
  position smallint not null,
  name text not null,
  -- Texto porque a porção real é "160 g / 160 g / 200 g" conforme a proteína
  -- escolhida, e arredondar isso para um número perderia a informação.
  amount text not null,
  note text,
  unique (option_id, position)
);

create index meal_items_option_idx on public.meal_items (option_id);

-- Regras curtas (organização, água, sono, cafeína, refeição livre, creatina)
-- e os blocos longos que ficam recolhidos (ajuste de peso, substituições, listas).
create table public.plan_notes (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.meal_plans (id) on delete cascade,
  kind text not null check (kind in ('regra', 'detalhe')),
  position smallint not null,
  title text not null,
  body text not null
);

create index plan_notes_plan_idx on public.plan_notes (plan_id, kind, position);

alter table public.meal_plans enable row level security;
alter table public.meals enable row level security;
alter table public.meal_options enable row level security;
alter table public.meal_items enable row level security;
alter table public.plan_notes enable row level security;

create policy "meal_plans_select_own"
  on public.meal_plans for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "meals_select_own"
  on public.meals for select
  to authenticated
  using (
    exists (select 1 from public.meal_plans p where p.id = plan_id and p.user_id = (select auth.uid()))
  );

create policy "plan_notes_select_own"
  on public.plan_notes for select
  to authenticated
  using (
    exists (select 1 from public.meal_plans p where p.id = plan_id and p.user_id = (select auth.uid()))
  );

create policy "meal_options_select_own"
  on public.meal_options for select
  to authenticated
  using (
    exists (
      select 1 from public.meals m
      join public.meal_plans p on p.id = m.plan_id
      where m.id = meal_id and p.user_id = (select auth.uid())
    )
  );

create policy "meal_items_select_own"
  on public.meal_items for select
  to authenticated
  using (
    exists (
      select 1
      from public.meal_options o
      join public.meals m on m.id = o.meal_id
      join public.meal_plans p on p.id = m.plan_id
      where o.id = option_id and p.user_id = (select auth.uid())
    )
  );
