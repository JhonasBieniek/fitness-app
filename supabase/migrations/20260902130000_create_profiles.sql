-- Perfis: uma linha por usuário do Auth.
--
-- O app tem um conjunto fechado de contas, criadas manualmente no painel do
-- Supabase. Esta tabela guarda o que o Auth não guarda: nome de exibição, fuso
-- e as medidas que alimentam o cálculo das metas.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 60),
  time_zone text not null default 'America/Sao_Paulo',
  birth_date date,
  height_cm numeric(5, 1) check (height_cm > 0 and height_cm < 260),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Dados de perfil de cada usuário do app.';

-- Mantém updated_at coerente sem depender do cliente.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Cria o perfil automaticamente quando uma conta é criada no painel.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- RLS: cada usuário enxerga e edita apenas o próprio perfil.
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Sem policy de insert nem de delete de propósito: contas são criadas e
-- removidas no painel do Supabase, e o perfil acompanha via trigger e cascade.
