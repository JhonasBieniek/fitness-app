-- As duas distribuições de horário diferiam em uma refeição e trinta minutos:
-- café às 08:30 ou às 09:00, o resto do dia idêntico. O alternador, a coluna
-- extra, o enum e o aviso de jejum existiam só para essa diferença. Fica um
-- horário por refeição, que é como as refeições realmente acontecem.

alter table public.meals rename column time_fasted to time;
alter table public.meals drop column time_evening;

delete from public.plan_notes where kind = 'jejum';

alter table public.plan_notes drop constraint plan_notes_kind_check;

alter table public.plan_notes
  add constraint plan_notes_kind_check check (kind in ('regra', 'detalhe'));

alter table public.profiles drop column default_meal_schedule;

drop type public.meal_schedule;
