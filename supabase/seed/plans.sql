-- Gerado por scripts/build-plan-seed.mjs. Não edite à mão.
-- Vincula o plano pelo e-mail, então funciona no banco local e na nuvem.

-- ===== ela (ela@bloco.local) =====
do $$
declare
  v_user uuid;
  v_block uuid;
  v_day uuid;
  v_plan uuid;
  v_meal uuid;
  v_option uuid;
begin
  select id into v_user from auth.users where email = 'ela@bloco.local';
  if v_user is null then
    raise notice 'Usuário % não existe, plano ignorado.', 'ela@bloco.local';
    return;
  end if;

  insert into public.training_blocks (user_id, name, started_on, total_weeks)
  values (v_user, 'Bloco 1 — glúteo e pernas', '2026-09-07', 12)
  returning id into v_block;

  insert into public.training_days (block_id, weekday, title, focus, duration_minutes)
  values (v_block, 1, 'Quadríceps e glúteo', 'Pesado', 55)
  returning id into v_day;

  insert into public.training_day_exercises
    (day_id, position, exercise_partnered_id, exercise_solo_id, sets, reps, rest_seconds, note, strength_sets, strength_reps, skip_on_deload)
  values
    (v_day, 1, (select id from public.exercises where slug = 'hip-thrust-barra'), (select id from public.exercises where slug = 'elevacao-pelvica-maquina'), 3, '8–10', 120, 'O exercício central da semana. Regra de +5 kg.', 4, '6–8', false),
    (v_day, 2, (select id from public.exercises where slug = 'agachamento-livre'), (select id from public.exercises where slug = 'hack-squat'), 3, '8–10', 120, 'Goblet squat até a semana 4, barra a partir da 5.', 3, '6–8', false),
    (v_day, 3, (select id from public.exercises where slug = 'leg-press-45'), (select id from public.exercises where slug = 'leg-press-45'), 2, '10–12', 90, 'Pés na altura média, sem tirar a lombar do encosto.', 3, null, false),
    (v_day, 4, (select id from public.exercises where slug = 'cadeira-extensora'), (select id from public.exercises where slug = 'cadeira-extensora'), 2, '12–15', 60, null, 3, null, false),
    (v_day, 5, (select id from public.exercises where slug = 'panturrilha-em-pe'), (select id from public.exercises where slug = 'panturrilha-em-pe'), 3, '12–15', 60, null, null, null, false);

  insert into public.training_days (block_id, weekday, title, focus, duration_minutes)
  values (v_block, 2, 'Superiores', 'Costas e peito', 45)
  returning id into v_day;

  insert into public.training_day_exercises
    (day_id, position, exercise_partnered_id, exercise_solo_id, sets, reps, rest_seconds, note, strength_sets, strength_reps, skip_on_deload)
  values
    (v_day, 1, (select id from public.exercises where slug = 'remada-curvada-halteres'), (select id from public.exercises where slug = 'remada-baixa-sentada'), 3, '8–10', 90, 'Espessura e postura: puxe para o quadril, um segundo no final.', null, null, false),
    (v_day, 2, (select id from public.exercises where slug = 'supino-halteres'), (select id from public.exercises where slug = 'supino-maquina'), 3, '8–10', 90, null, null, null, false),
    (v_day, 3, (select id from public.exercises where slug = 'face-pull'), (select id from public.exercises where slug = 'face-pull'), 3, '12–15', 60, 'Entrou no lugar da puxada alta. É postura de ombro.', null, null, false),
    (v_day, 4, (select id from public.exercises where slug = 'triceps-polia'), (select id from public.exercises where slug = 'triceps-polia'), 2, '10–12', 60, null, null, null, false),
    (v_day, 5, (select id from public.exercises where slug = 'rosca-halteres'), (select id from public.exercises where slug = 'rosca-maquina'), 2, '10–12', 60, null, null, null, false),
    (v_day, 6, (select id from public.exercises where slug = 'abdominal-solo'), (select id from public.exercises where slug = 'abdominal-maquina'), 3, '12–15', 60, null, null, null, false);

  insert into public.training_days (block_id, weekday, title, focus, duration_minutes)
  values (v_block, 3, 'Posterior e glúteo', 'Moderado', 55)
  returning id into v_day;

  insert into public.training_day_exercises
    (day_id, position, exercise_partnered_id, exercise_solo_id, sets, reps, rest_seconds, note, strength_sets, strength_reps, skip_on_deload)
  values
    (v_day, 1, (select id from public.exercises where slug = 'rdl-halteres'), (select id from public.exercises where slug = 'pull-through'), 3, '8–10', 120, 'Pull-through nas 4 primeiras semanas ensina o padrão sem carga na coluna.', 3, '6–8', false),
    (v_day, 2, (select id from public.exercises where slug = 'hip-thrust-barra'), (select id from public.exercises where slug = 'elevacao-pelvica-maquina'), 3, '10–12', 90, 'Uns 75% da carga de segunda. Mesma cadência.', null, null, false),
    (v_day, 3, (select id from public.exercises where slug = 'extensao-45-gluteo'), (select id from public.exercises where slug = 'extensao-45-gluteo'), 2, '12–15', 75, 'Anilha no peito quando 15 ficarem fáceis.', 3, null, false),
    (v_day, 4, (select id from public.exercises where slug = 'cadeira-flexora-sentada'), (select id from public.exercises where slug = 'cadeira-flexora-sentada'), 3, '10–12', 90, null, null, null, false),
    (v_day, 5, (select id from public.exercises where slug = 'abducao-polia'), (select id from public.exercises where slug = 'cadeira-abdutora'), 2, '15–20', 60, null, 3, null, false);

  insert into public.training_days (block_id, weekday, title, focus, duration_minutes)
  values (v_block, 4, 'Superiores', 'Ombro e braço', 45)
  returning id into v_day;

  insert into public.training_day_exercises
    (day_id, position, exercise_partnered_id, exercise_solo_id, sets, reps, rest_seconds, note, strength_sets, strength_reps, skip_on_deload)
  values
    (v_day, 1, (select id from public.exercises where slug = 'supino-inclinado-halteres'), (select id from public.exercises where slug = 'supino-inclinado-maquina'), 3, '8–10', 90, null, null, null, false),
    (v_day, 2, (select id from public.exercises where slug = 'serrote'), (select id from public.exercises where slug = 'remada-unilateral-maquina'), 3, '8–10', 90, null, null, null, false),
    (v_day, 3, (select id from public.exercises where slug = 'desenvolvimento-halteres'), (select id from public.exercises where slug = 'desenvolvimento-maquina'), 2, '8–10', 90, null, null, null, false),
    (v_day, 4, (select id from public.exercises where slug = 'crucifixo-inverso'), (select id from public.exercises where slug = 'crucifixo-inverso-maquina'), 2, '12–15', 60, null, null, null, false),
    (v_day, 5, (select id from public.exercises where slug = 'elevacao-lateral'), (select id from public.exercises where slug = 'elevacao-lateral'), 2, '12–15', 60, 'Dose de manutenção, de propósito.', null, null, false),
    (v_day, 6, (select id from public.exercises where slug = 'rosca-alternada'), (select id from public.exercises where slug = 'rosca-maquina'), 2, '10–12', 60, null, null, null, false),
    (v_day, 7, (select id from public.exercises where slug = 'triceps-testa'), (select id from public.exercises where slug = 'triceps-polia'), 1, '10–12', 60, null, null, null, false),
    (v_day, 8, (select id from public.exercises where slug = 'prancha'), (select id from public.exercises where slug = 'prancha'), 3, '20–40 s', 60, 'Seguido de 8 dead bugs por lado.', null, null, false);

  insert into public.training_days (block_id, weekday, title, focus, duration_minutes)
  values (v_block, 5, 'Glúteo', 'Unilateral e metabólico', 50)
  returning id into v_day;

  insert into public.training_day_exercises
    (day_id, position, exercise_partnered_id, exercise_solo_id, sets, reps, rest_seconds, note, strength_sets, strength_reps, skip_on_deload)
  values
    (v_day, 1, (select id from public.exercises where slug = 'bulgaro'), (select id from public.exercises where slug = 'leg-press-45'), 3, '8–10 por perna', 90, 'Primeiro da sessão, feito descansada. Nas 4 primeiras semanas, só peso do corpo.', null, null, true),
    (v_day, 2, (select id from public.exercises where slug = 'step-up'), (select id from public.exercises where slug = 'leg-press-45'), 2, '10–12 por perna', 90, 'Caixa na altura do joelho. Suba pelo calcanhar.', null, null, true),
    (v_day, 3, (select id from public.exercises where slug = 'hip-thrust-barra'), (select id from public.exercises where slug = 'elevacao-pelvica-maquina'), 2, '12–15', 60, 'Uns 60% da carga de segunda. Descanso curto de propósito.', null, null, false),
    (v_day, 4, (select id from public.exercises where slug = 'coice-polia'), (select id from public.exercises where slug = 'coice-maquina'), 2, '12–15 por perna', 60, null, null, null, false),
    (v_day, 5, (select id from public.exercises where slug = 'abducao-polia'), (select id from public.exercises where slug = 'cadeira-abdutora'), 3, '15–20', 60, 'Três segundos na volta.', null, null, false),
    (v_day, 6, (select id from public.exercises where slug = 'panturrilha-sentada'), (select id from public.exercises where slug = 'panturrilha-sentada'), 2, '12–15', 60, null, null, null, false);

  insert into public.meal_plans
    (user_id, name, kcal_target, protein_g, protein_min_g, carb_g, fat_g, water_min_l, water_max_l)
  values (v_user, 'Plano de ganho de massa', 2430, 175, 110, 295, 60, 2.2, 2.7)
  returning id into v_plan;

  insert into public.meals (plan_id, position, name, time, kcal, protein_g, note)
  values (v_plan, 1, 'Café da manhã', '08:30', 520, 24, null)
  returning id into v_meal;

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 1, null, null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Pão', '50 g', 'Qualquer um, menos frito'),
    (v_option, 2, 'Ovos', '2 un.', 'Ou queijo minas: 60 g / 80 g'),
    (v_option, 3, 'Fruta', '2 porções', null),
    (v_option, 4, 'Leite integral', '200 ml', null),
    (v_option, 5, 'Creatina', '3 g', 'Com água. O horário não muda o efeito');

  insert into public.meals (plan_id, position, name, time, kcal, protein_g, note)
  values (v_plan, 2, 'Almoço', '12:00', 520, 41, null)
  returning id into v_meal;

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 1, null, null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Legumes e verduras', 'à vontade', 'Mínimo 1 pegador'),
    (v_option, 2, 'Frango / carne magra / peixe', '100 / 90 / 120 g', 'Assado, cozido, grelhado ou desfiado'),
    (v_option, 3, 'Arroz / macarrão / batata-doce', '160 / 160 / 200 g', 'Pesar depois de cozido'),
    (v_option, 4, 'Feijão', '100 g', 'Não é opcional para ela: é o ferro do dia'),
    (v_option, 5, 'Azeite', '5 g', 'Cru, por cima');

  insert into public.meals (plan_id, position, name, time, kcal, protein_g, note)
  values (v_plan, 3, 'Lanche', '15:30', 430, 30, 'Se treinar à tarde, este é o pré-treino: faça 60 a 90 min antes.')
  returning id into v_meal;

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 1, 'Prato', null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Carne / frango / peixe', '70 / 80 / 100 g', null),
    (v_option, 2, 'Arroz / macarrão / batata-doce', '150 / 150 / 190 g', null),
    (v_option, 3, 'Azeite', '5 g', null),
    (v_option, 4, 'Fruta', '1 porção', null);

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 2, 'Lanche', null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Pão', '50 g', null),
    (v_option, 2, 'Ovo', '2 un.', null),
    (v_option, 3, 'Frango desfiado ou atum', '50 g', 'Atum em água'),
    (v_option, 4, 'Fruta', '1 porção', null);

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 3, 'Vitamina', 'A mais fácil quando não bate a fome.')
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Leite integral', '250 ml', null),
    (v_option, 2, 'Banana', '100 g', '1 média'),
    (v_option, 3, 'Aveia em flocos', '30 g', null),
    (v_option, 4, 'Pasta de amendoim', '15 g', null);

  insert into public.meals (plan_id, position, name, time, kcal, protein_g, note)
  values (v_plan, 4, 'Jantar', '19:30', 520, 41, 'Se treinar à tarde, é o pós-treino.')
  returning id into v_meal;

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 1, 'Igual ao almoço', null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Legumes e verduras', 'à vontade', null),
    (v_option, 2, 'Frango / carne magra / peixe', '100 / 90 / 120 g', null),
    (v_option, 3, 'Arroz / macarrão / batata-doce', '160 / 160 / 200 g', null),
    (v_option, 4, 'Feijão', '100 g', null),
    (v_option, 5, 'Azeite', '5 g', null);

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 2, 'Hambúrguer caseiro', null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Pão de hambúrguer', '80 g', null),
    (v_option, 2, 'Hambúrguer caseiro', '110 g', 'Patinho ou frango'),
    (v_option, 3, 'Queijo branco', '20 g', null),
    (v_option, 4, 'Alface, tomate, cebola', 'à vontade', null);

  insert into public.meals (plan_id, position, name, time, kcal, protein_g, note)
  values (v_plan, 5, 'Ceia', '21:00', 460, 34, 'Líquida e doce de propósito: é a refeição que entra mesmo sem fome.')
  returning id into v_meal;

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 1, 'Com whey', null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Iogurte natural integral', '200 ml', 'Ou leite: 250 ml'),
    (v_option, 2, 'Whey protein', '25 g', null),
    (v_option, 3, 'Aveia em flocos', '40 g', null),
    (v_option, 4, 'Mel', '10 g', null),
    (v_option, 5, 'Pasta de amendoim', '10 g', null);

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 2, 'Sem whey', 'A proteína do dia cai uns 17 g e continua acima do mínimo.')
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Iogurte natural integral', '200 ml', null),
    (v_option, 2, 'Aveia em flocos', '40 g', null),
    (v_option, 3, 'Mel', '10 g', null),
    (v_option, 4, 'Pasta de amendoim', '20 g', null),
    (v_option, 5, 'Fruta', '1 porção', null);

  insert into public.plan_notes (plan_id, kind, position, title, body) values
    (v_plan, 'regra', 1, 'Organização', 'Deixar as refeições do dia prontas pelo menos um dia antes.'),
    (v_plan, 'regra', 2, 'Água', 'Mínimo 2,5 L por dia.'),
    (v_plan, 'regra', 3, 'Sono', 'Mínimo 7 h por noite.'),
    (v_plan, 'regra', 4, 'Cafeína', 'Nada com cafeína depois das 14h.'),
    (v_plan, 'regra', 5, 'Refeição livre', 'Até 2 por semana, em dias diferentes. Substitui o almoço ou o jantar, não soma. Evitar fritura.'),
    (v_plan, 'regra', 6, 'Creatina', '3 g todo dia, com água, sem interrupção.'),
    (v_plan, 'detalhe', 1, 'Ajuste quinzenal do peso', 'Pesar em 3 manhãs por semana, depois do banheiro e antes de comer, sempre na mesma balança. Vale a média da semana, não o dia.

Meta: subir 150 a 300 g por semana.

Se a média não subir por 2 semanas seguidas, somar 150 kcal por dia: mais 20 g de arroz no almoço e no jantar, mais 10 g de pasta de amendoim na ceia. Repetir a cada 2 semanas até a média voltar a subir.

Se a média subir mais de 400 g por semana durante 2 semanas e a cintura aumentar visivelmente, tirar 100 kcal por dia (a pasta de amendoim da ceia).'),
    (v_plan, 'detalhe', 2, 'Substituições', 'Arroz, macarrão e batata trocam entre si nas quantidades da tabela.

Frango, carne bovina magra e peixe trocam entre si nas quantidades da tabela. Carne vermelha 3 a 4 vezes por semana, pelo ferro.

O whey da ceia pode sair: use a opção sem whey, que compensa com iogurte e pasta de amendoim.

Se o apetite for o problema, corte a carne. Nunca corte arroz, pão ou aveia: é de onde vem a caloria que faz ganhar peso.'),
    (v_plan, 'detalhe', 3, 'Listas', 'Carnes magras: patinho, coxão mole, alcatra, filé mignon, frango sem pele, tilápia, merluza, atum em água.

Frutas: banana, maçã, mamão, melão, manga, abacaxi, laranja, morango, uva.

Legumes e verduras: alface, rúcula, agrião, tomate, pepino, cenoura, beterraba, abobrinha, chuchu, brócolis, couve-flor, vagem, berinjela.

Temperos: alho, cebola, salsinha, cebolinha, orégano, manjericão, açafrão, páprica, pimenta-do-reino, limão, vinagre.');
end $$;

-- ===== ele (jhonas@bloco.local) =====
do $$
declare
  v_user uuid;
  v_block uuid;
  v_day uuid;
  v_plan uuid;
  v_meal uuid;
  v_option uuid;
begin
  select id into v_user from auth.users where email = 'jhonas@bloco.local';
  if v_user is null then
    raise notice 'Usuário % não existe, plano ignorado.', 'jhonas@bloco.local';
    return;
  end if;

  insert into public.training_blocks (user_id, name, started_on, total_weeks)
  values (v_user, 'Bloco 1 — glúteo e pernas', '2026-09-07', 12)
  returning id into v_block;

  insert into public.training_days (block_id, weekday, title, focus, duration_minutes)
  values (v_block, 1, 'Quadríceps e glúteo', 'Pesado', 55)
  returning id into v_day;

  insert into public.training_day_exercises
    (day_id, position, exercise_partnered_id, exercise_solo_id, sets, reps, rest_seconds, note, strength_sets, strength_reps, skip_on_deload)
  values
    (v_day, 1, (select id from public.exercises where slug = 'hip-thrust-barra'), (select id from public.exercises where slug = 'elevacao-pelvica-maquina'), 3, '8–10', 120, 'O exercício central da semana. Regra de +5 kg.', 4, '6–8', false),
    (v_day, 2, (select id from public.exercises where slug = 'agachamento-livre'), (select id from public.exercises where slug = 'hack-squat'), 3, '8–10', 120, 'Goblet squat até a semana 4, barra a partir da 5.', 3, '6–8', false),
    (v_day, 3, (select id from public.exercises where slug = 'leg-press-45'), (select id from public.exercises where slug = 'leg-press-45'), 2, '10–12', 90, 'Pés na altura média, sem tirar a lombar do encosto.', 3, null, false),
    (v_day, 4, (select id from public.exercises where slug = 'cadeira-extensora'), (select id from public.exercises where slug = 'cadeira-extensora'), 2, '12–15', 60, null, 3, null, false),
    (v_day, 5, (select id from public.exercises where slug = 'panturrilha-em-pe'), (select id from public.exercises where slug = 'panturrilha-em-pe'), 3, '12–15', 60, null, null, null, false);

  insert into public.training_days (block_id, weekday, title, focus, duration_minutes)
  values (v_block, 2, 'Superiores', 'Costas e peito', 45)
  returning id into v_day;

  insert into public.training_day_exercises
    (day_id, position, exercise_partnered_id, exercise_solo_id, sets, reps, rest_seconds, note, strength_sets, strength_reps, skip_on_deload)
  values
    (v_day, 1, (select id from public.exercises where slug = 'remada-curvada-halteres'), (select id from public.exercises where slug = 'remada-baixa-sentada'), 3, '8–10', 90, 'Espessura e postura: puxe para o quadril, um segundo no final.', null, null, false),
    (v_day, 2, (select id from public.exercises where slug = 'supino-halteres'), (select id from public.exercises where slug = 'supino-maquina'), 3, '8–10', 90, null, null, null, false),
    (v_day, 3, (select id from public.exercises where slug = 'face-pull'), (select id from public.exercises where slug = 'face-pull'), 3, '12–15', 60, 'Entrou no lugar da puxada alta. É postura de ombro.', null, null, false),
    (v_day, 4, (select id from public.exercises where slug = 'triceps-polia'), (select id from public.exercises where slug = 'triceps-polia'), 2, '10–12', 60, null, null, null, false),
    (v_day, 5, (select id from public.exercises where slug = 'rosca-halteres'), (select id from public.exercises where slug = 'rosca-maquina'), 2, '10–12', 60, null, null, null, false),
    (v_day, 6, (select id from public.exercises where slug = 'abdominal-solo'), (select id from public.exercises where slug = 'abdominal-maquina'), 3, '12–15', 60, null, null, null, false);

  insert into public.training_days (block_id, weekday, title, focus, duration_minutes)
  values (v_block, 3, 'Posterior e glúteo', 'Moderado', 55)
  returning id into v_day;

  insert into public.training_day_exercises
    (day_id, position, exercise_partnered_id, exercise_solo_id, sets, reps, rest_seconds, note, strength_sets, strength_reps, skip_on_deload)
  values
    (v_day, 1, (select id from public.exercises where slug = 'rdl-halteres'), (select id from public.exercises where slug = 'pull-through'), 3, '8–10', 120, 'Pull-through nas 4 primeiras semanas ensina o padrão sem carga na coluna.', 3, '6–8', false),
    (v_day, 2, (select id from public.exercises where slug = 'hip-thrust-barra'), (select id from public.exercises where slug = 'elevacao-pelvica-maquina'), 3, '10–12', 90, 'Uns 75% da carga de segunda. Mesma cadência.', null, null, false),
    (v_day, 3, (select id from public.exercises where slug = 'extensao-45-gluteo'), (select id from public.exercises where slug = 'extensao-45-gluteo'), 2, '12–15', 75, 'Anilha no peito quando 15 ficarem fáceis.', 3, null, false),
    (v_day, 4, (select id from public.exercises where slug = 'cadeira-flexora-sentada'), (select id from public.exercises where slug = 'cadeira-flexora-sentada'), 3, '10–12', 90, null, null, null, false),
    (v_day, 5, (select id from public.exercises where slug = 'abducao-polia'), (select id from public.exercises where slug = 'cadeira-abdutora'), 2, '15–20', 60, null, 3, null, false);

  insert into public.training_days (block_id, weekday, title, focus, duration_minutes)
  values (v_block, 4, 'Superiores', 'Ombro e braço', 45)
  returning id into v_day;

  insert into public.training_day_exercises
    (day_id, position, exercise_partnered_id, exercise_solo_id, sets, reps, rest_seconds, note, strength_sets, strength_reps, skip_on_deload)
  values
    (v_day, 1, (select id from public.exercises where slug = 'supino-inclinado-halteres'), (select id from public.exercises where slug = 'supino-inclinado-maquina'), 3, '8–10', 90, null, null, null, false),
    (v_day, 2, (select id from public.exercises where slug = 'serrote'), (select id from public.exercises where slug = 'remada-unilateral-maquina'), 3, '8–10', 90, null, null, null, false),
    (v_day, 3, (select id from public.exercises where slug = 'desenvolvimento-halteres'), (select id from public.exercises where slug = 'desenvolvimento-maquina'), 2, '8–10', 90, null, null, null, false),
    (v_day, 4, (select id from public.exercises where slug = 'crucifixo-inverso'), (select id from public.exercises where slug = 'crucifixo-inverso-maquina'), 2, '12–15', 60, null, null, null, false),
    (v_day, 5, (select id from public.exercises where slug = 'elevacao-lateral'), (select id from public.exercises where slug = 'elevacao-lateral'), 2, '12–15', 60, 'Dose de manutenção, de propósito.', null, null, false),
    (v_day, 6, (select id from public.exercises where slug = 'rosca-alternada'), (select id from public.exercises where slug = 'rosca-maquina'), 2, '10–12', 60, null, null, null, false),
    (v_day, 7, (select id from public.exercises where slug = 'triceps-testa'), (select id from public.exercises where slug = 'triceps-polia'), 1, '10–12', 60, null, null, null, false),
    (v_day, 8, (select id from public.exercises where slug = 'prancha'), (select id from public.exercises where slug = 'prancha'), 3, '20–40 s', 60, 'Seguido de 8 dead bugs por lado.', null, null, false);

  insert into public.training_days (block_id, weekday, title, focus, duration_minutes)
  values (v_block, 5, 'Glúteo', 'Unilateral e metabólico', 50)
  returning id into v_day;

  insert into public.training_day_exercises
    (day_id, position, exercise_partnered_id, exercise_solo_id, sets, reps, rest_seconds, note, strength_sets, strength_reps, skip_on_deload)
  values
    (v_day, 1, (select id from public.exercises where slug = 'bulgaro'), (select id from public.exercises where slug = 'leg-press-45'), 3, '8–10 por perna', 90, 'Primeiro da sessão, feito descansada. Nas 4 primeiras semanas, só peso do corpo.', null, null, true),
    (v_day, 2, (select id from public.exercises where slug = 'step-up'), (select id from public.exercises where slug = 'leg-press-45'), 2, '10–12 por perna', 90, 'Caixa na altura do joelho. Suba pelo calcanhar.', null, null, true),
    (v_day, 3, (select id from public.exercises where slug = 'hip-thrust-barra'), (select id from public.exercises where slug = 'elevacao-pelvica-maquina'), 2, '12–15', 60, 'Uns 60% da carga de segunda. Descanso curto de propósito.', null, null, false),
    (v_day, 4, (select id from public.exercises where slug = 'coice-polia'), (select id from public.exercises where slug = 'coice-maquina'), 2, '12–15 por perna', 60, null, null, null, false),
    (v_day, 5, (select id from public.exercises where slug = 'abducao-polia'), (select id from public.exercises where slug = 'cadeira-abdutora'), 3, '15–20', 60, 'Três segundos na volta.', null, null, false),
    (v_day, 6, (select id from public.exercises where slug = 'panturrilha-sentada'), (select id from public.exercises where slug = 'panturrilha-sentada'), 2, '12–15', 60, null, null, null, false);

  insert into public.meal_plans
    (user_id, name, kcal_target, protein_g, protein_min_g, carb_g, fat_g, water_min_l, water_max_l)
  values (v_user, 'Plano de ganho de massa', 2700, 210, 160, 300, 60, 3.5, null)
  returning id into v_plan;

  insert into public.meals (plan_id, position, name, time, kcal, protein_g, note)
  values (v_plan, 1, 'Café da manhã', '08:30', 600, 30, null)
  returning id into v_meal;

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 1, null, null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Pão', '60 g', 'Qualquer um, menos frito'),
    (v_option, 2, 'Ovos', '3 un.', 'Ou queijo minas: 60 g / 80 g'),
    (v_option, 3, 'Fruta', '2 porções', null),
    (v_option, 4, 'Leite integral', '—', null),
    (v_option, 5, 'Creatina', '5 g', 'Com água. O horário não muda o efeito');

  insert into public.meals (plan_id, position, name, time, kcal, protein_g, note)
  values (v_plan, 2, 'Almoço', '12:00', 620, 55, null)
  returning id into v_meal;

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 1, null, null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Legumes e verduras', 'à vontade', 'Mínimo 1 pegador'),
    (v_option, 2, 'Frango / carne magra / peixe', '160 / 150 / 180 g', 'Assado, cozido, grelhado ou desfiado'),
    (v_option, 3, 'Arroz / macarrão / batata-doce', '210 / 210 / 230 g', 'Pesar depois de cozido'),
    (v_option, 4, 'Feijão', '100 g', 'Não é opcional para ela: é o ferro do dia'),
    (v_option, 5, 'Azeite', '—', 'Cru, por cima');

  insert into public.meals (plan_id, position, name, time, kcal, protein_g, note)
  values (v_plan, 3, 'Lanche', '15:30', 520, 45, 'Se treinar à tarde, este é o pré-treino: faça 60 a 90 min antes.')
  returning id into v_meal;

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 1, 'Prato', null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Carne / frango / peixe', '150 / 160 / 180 g', null),
    (v_option, 2, 'Arroz / macarrão / batata-doce', '210 / 210 / 230 g', null),
    (v_option, 3, 'Azeite', '—', null),
    (v_option, 4, 'Fruta', '—', null);

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 2, 'Lanche', null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Pão', '60 g', null),
    (v_option, 2, 'Ovo', '2 un.', null),
    (v_option, 3, 'Frango desfiado ou atum', '80 g', 'Atum em água'),
    (v_option, 4, 'Fruta', '2 porções', null);

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 3, 'Vitamina', 'A mais fácil quando não bate a fome.')
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Leite integral', '300 ml', null),
    (v_option, 2, 'Banana', '120 g', '1 média'),
    (v_option, 3, 'Aveia em flocos', '40 g', null),
    (v_option, 4, 'Pasta de amendoim', '20 g', null);

  insert into public.meals (plan_id, position, name, time, kcal, protein_g, note)
  values (v_plan, 4, 'Jantar', '19:30', 620, 55, 'Se treinar à tarde, é o pós-treino.')
  returning id into v_meal;

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 1, 'Igual ao almoço', null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Legumes e verduras', 'à vontade', null),
    (v_option, 2, 'Frango / carne magra / peixe', '160 / 150 / 180 g', null),
    (v_option, 3, 'Arroz / macarrão / batata-doce', '210 / 210 / 230 g', null),
    (v_option, 4, 'Feijão', '100 g', null),
    (v_option, 5, 'Azeite', '—', null);

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 2, 'Hambúrguer caseiro', null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Pão de hambúrguer', '100 g', null),
    (v_option, 2, 'Hambúrguer caseiro', '160 g', 'Patinho ou frango'),
    (v_option, 3, 'Queijo branco', '20 g', null),
    (v_option, 4, 'Alface, tomate, cebola', 'à vontade', null);

  insert into public.meals (plan_id, position, name, time, kcal, protein_g, note)
  values (v_plan, 5, 'Ceia', '21:00', 500, 38, 'Líquida e doce de propósito: é a refeição que entra mesmo sem fome.')
  returning id into v_meal;

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 1, 'Com whey', null)
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Iogurte natural integral', '200 ml', 'Ou leite: 250 ml'),
    (v_option, 2, 'Whey protein', '25 g', null),
    (v_option, 3, 'Aveia em flocos', '60 g', null),
    (v_option, 4, 'Mel', '10 g', null),
    (v_option, 5, 'Pasta de amendoim', '—', null);

  insert into public.meal_options (meal_id, position, label, note)
  values (v_meal, 2, 'Sem whey', 'A proteína do dia cai uns 17 g e continua acima do mínimo.')
  returning id into v_option;

  insert into public.meal_items (option_id, position, name, amount, note) values
    (v_option, 1, 'Iogurte natural integral', '200 ml', null),
    (v_option, 2, 'Aveia em flocos', '60 g', null),
    (v_option, 3, 'Mel', '10 g', null),
    (v_option, 4, 'Pasta de amendoim', '20 g', null),
    (v_option, 5, 'Fruta', '1 porção', null);

  insert into public.plan_notes (plan_id, kind, position, title, body) values
    (v_plan, 'regra', 1, 'Organização', 'Deixar as refeições do dia prontas pelo menos um dia antes.'),
    (v_plan, 'regra', 2, 'Água', 'Mínimo 3,5 L por dia.'),
    (v_plan, 'regra', 3, 'Sono', 'Mínimo 7 h por noite.'),
    (v_plan, 'regra', 4, 'Cafeína', 'Nada com cafeína depois das 14h.'),
    (v_plan, 'regra', 5, 'Refeição livre', 'Até 2 por semana, em dias diferentes. Substitui o almoço ou o jantar, não soma. Evitar fritura.'),
    (v_plan, 'regra', 6, 'Creatina', '5 g todo dia, com água, sem interrupção.'),
    (v_plan, 'detalhe', 1, 'Ajuste quinzenal do peso', 'Pesar em 3 manhãs por semana, depois do banheiro e antes de comer, sempre na mesma balança. Vale a média da semana, não o dia.

Meta: subir 150 a 300 g por semana.

Se a média não subir por 2 semanas seguidas, somar 150 kcal por dia: mais 20 g de arroz no almoço e no jantar, mais 10 g de pasta de amendoim na ceia. Repetir a cada 2 semanas até a média voltar a subir.

Se a média subir mais de 400 g por semana durante 2 semanas e a cintura aumentar visivelmente, tirar 100 kcal por dia (a pasta de amendoim da ceia).'),
    (v_plan, 'detalhe', 2, 'Substituições', 'Arroz, macarrão e batata trocam entre si nas quantidades da tabela.

Frango, carne bovina magra e peixe trocam entre si nas quantidades da tabela. Carne vermelha 3 a 4 vezes por semana, pelo ferro.

O whey da ceia pode sair: use a opção sem whey, que compensa com iogurte e pasta de amendoim.

Se o apetite for o problema, corte a carne. Nunca corte arroz, pão ou aveia: é de onde vem a caloria que faz ganhar peso.'),
    (v_plan, 'detalhe', 3, 'Listas', 'Carnes magras: patinho, coxão mole, alcatra, filé mignon, frango sem pele, tilápia, merluza, atum em água.

Frutas: banana, maçã, mamão, melão, manga, abacaxi, laranja, morango, uva.

Legumes e verduras: alface, rúcula, agrião, tomate, pepino, cenoura, beterraba, abobrinha, chuchu, brócolis, couve-flor, vagem, berinjela.

Temperos: alho, cebola, salsinha, cebolinha, orégano, manjericão, açafrão, páprica, pimenta-do-reino, limão, vinagre.');
end $$;
