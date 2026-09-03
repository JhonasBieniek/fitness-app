/**
 * Prepara o banco local para desenvolvimento: zera, aplica migrations, carrega
 * o catálogo de exercícios, cria as duas contas de teste e aplica os planos.
 *
 * As contas são criadas pela Admin API do GoTrue, e não com INSERT direto em
 * `auth.users`: assim a senha, a identidade e os metadados ficam exatamente
 * como ficariam em produção.
 *
 * Só funciona contra o Supabase local. As credenciais abaixo são as chaves de
 * demonstração, idênticas em toda instalação local.
 *
 * Uso: npm run db:seed:local
 */

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const API_URL = 'http://127.0.0.1:54321'
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const DB_CONTAINER = 'supabase_db_fitness-app'

const USERS = [
  { email: 'ela@bloco.local', password: 'bloco123456', displayName: 'Manu', level: 'iniciante' },
  {
    email: 'jhonas@bloco.local',
    password: 'bloco123456',
    displayName: 'Jhonas',
    level: 'intermediario',
  },
]

function run(command, args, options = {}) {
  return execFileSync(command, args, { stdio: 'inherit', shell: true, ...options })
}

async function createUser({ email, password, displayName }) {
  const response = await fetch(`${API_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    }),
  })

  if (!response.ok) {
    throw new Error(`Falha ao criar ${email}: HTTP ${response.status} ${await response.text()}`)
  }

  console.log(`  conta criada: ${email}`)
}

async function main() {
  console.log('Zerando o banco local e aplicando migrations...')
  run('npx', ['supabase', 'db', 'reset'])

  console.log('\nCriando contas de teste...')
  for (const user of USERS) {
    await createUser(user)
  }

  console.log('\nAplicando os planos...')
  const sql = readFileSync(join(process.cwd(), 'supabase', 'seed', 'plans.sql'), 'utf8')
  execFileSync(
    'docker',
    [
      'exec',
      '-i',
      DB_CONTAINER,
      'psql',
      '-v',
      'ON_ERROR_STOP=1',
      '-U',
      'postgres',
      '-d',
      'postgres',
    ],
    { input: sql, stdio: ['pipe', 'inherit', 'inherit'] },
  )

  console.log('\nAjustando o nível de cada conta...')
  const levels = USERS.map(
    (user) =>
      `update public.profiles set level = '${user.level}' where id = (select id from auth.users where email = '${user.email}');`,
  ).join('\n')

  execFileSync(
    'docker',
    [
      'exec',
      '-i',
      DB_CONTAINER,
      'psql',
      '-v',
      'ON_ERROR_STOP=1',
      '-U',
      'postgres',
      '-d',
      'postgres',
    ],
    { input: levels, stdio: ['pipe', 'inherit', 'inherit'] },
  )

  console.log('\nPronto. Entre com qualquer uma das contas:')
  USERS.forEach((user) => console.log(`  ${user.email} / ${user.password}`))
}

await main()
