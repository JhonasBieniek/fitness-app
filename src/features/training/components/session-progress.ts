'use client'

import { useSyncExternalStore } from 'react'

/**
 * O que já foi marcado no treino em andamento, guardado fora da rota.
 *
 * Marcar um exercício não revalida mais a rota — seria uma re-renderização
 * inteira a cada série, com o celular na mão no meio do treino. O preço é que a
 * resposta guardada pelo roteador envelhece: sair para a dieta e voltar traria
 * os marcados de antes.
 *
 * Este armazém fica em módulo, e não no componente, porque a rota desmonta a
 * cada troca de tela e o layout não. Recarregar a página o esvazia de
 * propósito: aí a leitura volta a ser a do banco, que é a verdade.
 */
type Progresso = { sessaoId: string | null; marcados: Record<string, boolean> }

const VAZIO: Progresso = { sessaoId: null, marcados: {} }

let progresso = VAZIO
const inscritos = new Set<() => void>()

function inscrever(notificar: () => void) {
  inscritos.add(notificar)
  return () => {
    inscritos.delete(notificar)
  }
}

/**
 * A sessão faz parte do que se guarda em vez de disparar uma limpeza: assim
 * nada precisa ser zerado durante a renderização, e o que sobrou de um treino
 * encerrado simplesmente deixa de ser lido.
 */
export function marcarExercicio(sessaoId: string, exerciseId: string, feito: boolean) {
  const anteriores = progresso.sessaoId === sessaoId ? progresso.marcados : {}
  progresso = { sessaoId, marcados: { ...anteriores, [exerciseId]: feito } }

  for (const notificar of inscritos) notificar()
}

/** O que foi marcado nesta sessão. Vazio para qualquer outra. */
export function useMarcados(sessaoId: string | null): Record<string, boolean> {
  const atual = useSyncExternalStore(
    inscrever,
    () => progresso,
    // No servidor nada foi marcado: o estado nasce do que veio do banco.
    () => VAZIO,
  )

  return sessaoId !== null && atual.sessaoId === sessaoId ? atual.marcados : VAZIO.marcados
}
