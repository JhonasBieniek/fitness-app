-- Preferências que mudam o que o app mostra, não apenas como mostra.

-- `iniciante` é o que habilita o alternador Acompanhada/Sozinha: quem já tem
-- técnica não precisa da versão em máquina.
create type public.training_level as enum ('iniciante', 'intermediario', 'avancado');

-- Qual das duas distribuições de refeição a pessoa segue por padrão.
create type public.meal_schedule as enum ('manha_jejum', 'tarde_noite');

alter table public.profiles
  add column level public.training_level not null default 'iniciante',
  add column default_meal_schedule public.meal_schedule not null default 'manha_jejum',
  add column theme text not null default 'claro' check (theme in ('claro', 'escuro'));

comment on column public.profiles.level is 'Define se o alternador Acompanhada/Sozinha aparece.';
