/**
 * Quebra o corpo de uma nota do plano em parágrafos e tabelas.
 *
 * Substituições e listas são pares — "o quê" e "por quê / quais" — e liam mal
 * como blocos de prosa: para saber por quanto trocar o arroz era preciso varrer
 * uma frase inteira. Uma linha com ` | ` no meio vira uma linha de tabela, e
 * linhas assim, uma embaixo da outra, formam uma tabela só.
 *
 * A convenção fica no texto, e não no schema, porque é o mesmo campo que já
 * carrega os parágrafos: quem escreve a nota decide o que é tabela sem precisar
 * de migration. O que não segue a convenção continua sendo parágrafo, então
 * nota antiga não quebra.
 */

export type NoteRow = { label: string; value: string }

export type NoteBlock = { kind: 'paragrafo'; text: string } | { kind: 'tabela'; rows: NoteRow[] }

const SEPARADOR = ' | '

function toRow(line: string): NoteRow | null {
  const at = line.indexOf(SEPARADOR)
  if (at === -1) return null

  const label = line.slice(0, at).trim()
  const value = line.slice(at + SEPARADOR.length).trim()

  return label && value ? { label, value } : null
}

export function parseNoteBody(body: string): NoteBlock[] {
  const blocks: NoteBlock[] = []
  let rows: NoteRow[] = []

  function fecharTabela() {
    if (rows.length > 0) {
      blocks.push({ kind: 'tabela', rows })
      rows = []
    }
  }

  for (const line of body.split('\n')) {
    const text = line.trim()
    if (!text) continue

    const row = toRow(text)

    if (row) {
      rows.push(row)
      continue
    }

    fecharTabela()
    blocks.push({ kind: 'paragrafo', text })
  }

  fecharTabela()

  return blocks
}
