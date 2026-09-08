-- A prescrição passa a valer por faixa de semanas.
--
-- O bloco troca exercício no meio do caminho: goblet squat até a semana 4 e
-- agachamento livre a partir da 5, pull-through nas quatro primeiras e RDL
-- depois. Até aqui isso morava na nota, e a tela mostrava sempre o mesmo nome.
-- Com a faixa na linha, a mesma posição pode ter duas linhas — uma por
-- período — e o app mostra só a que vale na semana atual.
--
-- `from_week` nasce em 1 e `to_week` nulo, então tudo que já existe continua
-- valendo o bloco inteiro. A unicidade por (dia, posição) precisa incluir a
-- semana inicial para caber a segunda linha.

alter table public.training_day_exercises
  add column from_week smallint not null default 1 check (from_week >= 1),
  add column to_week smallint check (to_week >= from_week);

comment on column public.training_day_exercises.from_week is 'Primeira semana do bloco em que esta linha vale.';
comment on column public.training_day_exercises.to_week is 'Última semana em que vale. Nula: até o fim do bloco.';

alter table public.training_day_exercises
  drop constraint training_day_exercises_day_id_position_key,
  add constraint training_day_exercises_day_id_position_from_week_key
    unique (day_id, position, from_week);
