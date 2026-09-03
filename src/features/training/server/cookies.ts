/**
 * Nomes de cookie ficam fora do arquivo de Server Actions: um módulo
 * `'use server'` só pode exportar funções assíncronas, e uma constante ali
 * invalida o módulo inteiro na hora do build.
 */
export const MODE_COOKIE = 'bloco-modo'
