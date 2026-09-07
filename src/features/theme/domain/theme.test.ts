import { describe, expect, it } from 'vitest'

import { isTheme, THEMES } from './theme'

describe('isTheme', () => {
  it('aceita os temas do catálogo', () => {
    for (const theme of THEMES) {
      expect(isTheme(theme)).toBe(true)
    }
  })

  it('recusa qualquer outro valor', () => {
    expect(isTheme('dark')).toBe(false)
    expect(isTheme('')).toBe(false)
    expect(isTheme(undefined)).toBe(false)
    expect(isTheme(null)).toBe(false)
  })
})
