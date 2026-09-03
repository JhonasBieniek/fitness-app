-- Registro do que foi feito: sessão de treino e carga por exercício.

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day_id uuid not null references public.training_days (id) on delete cascade,
  mode text not null default 'acompanhada' check (mode in ('acompanhada', 'sozinha')),
  -- O cronômetro é derivado deste instante, nunca acumulado no cliente. É o que
  -- faz o tempo continuar correto com o app em segundo plano ou fechado.
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  -- Data local do usuário: agrupar por dia usando timestamptz jogaria o treino
  -- das 21h para o dia seguinte em UTC.
  local_date date not null,
  week_number smallint,
  constraint workout_sessions_ends_after_start check (ended_at is null or ended_at >= started_at)
);

comment on table public.workout_sessions is 'Uma sessão por treino iniciado.';

create index workout_sessions_user_date_idx on public.workout_sessions (user_id, local_date desc);

-- Só uma sessão aberta por vez: abrir a segunda perderia o cronômetro da primeira.
create unique index workout_sessions_one_open_per_user
  on public.workout_sessions (user_id)
  where ended_at is null;

create table public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  -- Desnormalizado para a policy filtrar sem join. É a coluna mais consultada da tabela.
  user_id uuid not null references auth.users (id) on delete cascade,
  day_exercise_id uuid not null references public.training_day_exercises (id) on delete cascade,
  -- Qual variante foi executada. Carga de barra e de máquina não se comparam.
  exercise_id uuid not null references public.exercises (id),
  done boolean not null default false,
  load_kg numeric(6, 2) check (load_kg >= 0),
  reps smallint check (reps > 0),
  note text,
  updated_at timestamptz not null default now(),
  unique (session_id, day_exercise_id)
);

create index exercise_logs_history_idx on public.exercise_logs (user_id, exercise_id, updated_at desc);

create trigger exercise_logs_set_updated_at
  before update on public.exercise_logs
  for each row
  execute function public.set_updated_at();

alter table public.workout_sessions enable row level security;
alter table public.exercise_logs enable row level security;

-- Estas duas tabelas são escritas pelo app, então precisam de insert e update.
create policy "workout_sessions_select_own"
  on public.workout_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "workout_sessions_insert_own"
  on public.workout_sessions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "workout_sessions_update_own"
  on public.workout_sessions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "exercise_logs_select_own"
  on public.exercise_logs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "exercise_logs_insert_own"
  on public.exercise_logs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "exercise_logs_update_own"
  on public.exercise_logs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
