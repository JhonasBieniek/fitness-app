-- Como executar o exercício vira dado, e a mídia deixa de ser uma animação.
--
-- O acervo de fotos tem dois quadros por movimento, mas em boa parte deles os
-- dois quadros são praticamente iguais: alternar não mostra execução nenhuma.
-- Quem ensina o movimento passa a ser o texto, que é conteúdo nosso e está
-- correto; a foto vira uma referência estática do aparelho e da posição.

alter table public.exercises
  -- Passos curtos, na ordem da execução. Vazio quando ainda não foi escrito.
  add column steps text[] not null default '{}',
  -- Reservado para uma animação licenciada. Quando existir, ela substitui as
  -- fotos na tela de execução sem que nada mais mude.
  add column media_loop_path text;

comment on column public.exercises.steps is 'Passos da execução, em português, na ordem.';
comment on column public.exercises.media_loop_path is 'Animação licenciada, quando houver. Tem precedência sobre as fotos.';

-- A foto só ajuda quando é do exercício certo. Onde o acervo não tem o
-- movimento, as colunas ficam nulas de propósito: uma foto errada ensina
-- errado, e a tela de execução já sabe se virar sem imagem.
comment on column public.exercises.media_start_path is 'Foto de referência. Nula quando o acervo não tem o movimento.';
