-- "Comecei sem querer" apaga a sessão, mas a tabela só tinha policy de select,
-- insert e update. Sem policy de delete a RLS descarta as linhas em silêncio:
-- o Postgres não devolve erro, apenas não apaga nada, e o botão parecia
-- funcionar enquanto o treino continuava aberto.
--
-- Os logs saem junto pela cascata de `exercise_logs.session_id`, que roda como
-- operação do sistema e não passa por policy.
create policy "workout_sessions_delete_own"
  on public.workout_sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id);
