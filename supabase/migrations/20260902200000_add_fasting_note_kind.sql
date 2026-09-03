-- O aviso sobre treinar em jejum só vale para quem treina de manhã, então não
-- é nem uma regra geral do plano nem um detalhe recolhido: é um terceiro tipo,
-- exibido apenas na distribuição de jejum.
alter table public.plan_notes drop constraint plan_notes_kind_check;

alter table public.plan_notes
  add constraint plan_notes_kind_check check (kind in ('regra', 'detalhe', 'jejum'));
