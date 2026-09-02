import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'supabase/.temp/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  {
    // O domínio é TypeScript puro: nada de framework, banco ou I/O aqui dentro.
    // É o que permite testar a lógica de dia/horário sem subir nada.
    files: ['src/features/*/domain/**/*.ts', 'src/shared/lib/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['next', 'next/*', 'server-only'],
              message: 'A camada de domínio não pode depender do framework.',
            },
            {
              group: ['@supabase/*', '@/lib/supabase/*'],
              message: 'A camada de domínio não pode acessar o banco.',
            },
          ],
        },
      ],
    },
  },
]

export default eslintConfig
