import { describe, expect, it } from 'vitest'

import { parseNoteBody } from './note-blocks'

describe('parseNoteBody', () => {
  it('mantém prosa como parágrafo', () => {
    expect(parseNoteBody('Uma frase.\n\nOutra frase.')).toEqual([
      { kind: 'paragrafo', text: 'Uma frase.' },
      { kind: 'paragrafo', text: 'Outra frase.' },
    ])
  })

  it('junta linhas seguidas com barra em uma tabela só', () => {
    expect(parseNoteBody('Arroz | macarrão\nFrango | peixe')).toEqual([
      {
        kind: 'tabela',
        rows: [
          { label: 'Arroz', value: 'macarrão' },
          { label: 'Frango', value: 'peixe' },
        ],
      },
    ])
  })

  it('parágrafos e tabelas convivem, na ordem em que aparecem', () => {
    const blocks = parseNoteBody('Abertura.\n\nArroz | macarrão\nFrango | peixe\n\nRessalva.')

    expect(blocks.map((block) => block.kind)).toEqual(['paragrafo', 'tabela', 'paragrafo'])
  })

  it('linha em branco não parte a tabela ao meio', () => {
    const blocks = parseNoteBody('Arroz | macarrão\n\nFrango | peixe')

    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.kind).toBe('tabela')
  })

  it('barra sem um dos lados continua sendo texto', () => {
    expect(parseNoteBody('Arroz | ')).toEqual([{ kind: 'paragrafo', text: 'Arroz |' }])
  })

  it('só a primeira barra separa: o valor pode ter outras', () => {
    expect(parseNoteBody('Arroz | macarrão | batata')).toEqual([
      { kind: 'tabela', rows: [{ label: 'Arroz', value: 'macarrão | batata' }] },
    ])
  })

  it('corpo vazio não vira bloco nenhum', () => {
    expect(parseNoteBody('')).toEqual([])
  })
})
