-- Adiciona a nota "Porções de frutas" a todo plano de dieta ativo.
--
-- Idempotente: confere pelo título antes de inserir, então rodar de novo não
-- duplica. A posição é a próxima livre entre os detalhes de cada plano, em vez
-- de fixa em 4, para não depender de quantas notas o plano já tem em produção.
do $$
declare
  v_plan record;
  v_body text := 'Abacaxi | 80 g
Acerola | 120 g
Ameixa | 75 g
Banana | 60 g
Caju | 100 g
Caqui | 60 g
Carambola | 90 g
Figo | 100 g
Goiaba | 90 g
Graviola | 70 g
Jabuticaba | 80 g
Kiwi | 100 g
Laranja | 100 g
Maçã | 70 g
Mamão | 100 g
Manga | 60 g
Maracujá | 80 g
Melancia | 120 g
Melão | 130 g
Morango | 120 g
Pera | 80 g
Pêssego | 100 g
Pitanga | 100 g
Romã | 60 g
Tangerina ou poncã | 100 g
Uva | 80 g';
  v_next_position smallint;
  v_added int := 0;
begin
  for v_plan in select id from public.meal_plans where is_active loop
    if not exists (
      select 1 from public.plan_notes
       where plan_id = v_plan.id and kind = 'detalhe' and title = 'Porções de frutas'
    ) then
      select coalesce(max(position), 0) + 1
        into v_next_position
        from public.plan_notes
       where plan_id = v_plan.id and kind = 'detalhe';

      insert into public.plan_notes (plan_id, kind, position, title, body)
      values (v_plan.id, 'detalhe', v_next_position, 'Porções de frutas', v_body);

      v_added := v_added + 1;
    end if;
  end loop;

  raise notice 'Nota adicionada a % plano(s) ativo(s).', v_added;
end $$;
