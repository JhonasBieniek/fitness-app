/**
 * Monta o catálogo de exercícios a partir do free-exercise-db.
 *
 * O dataset é domínio público (Unlicense), então as imagens são copiadas para
 * dentro do repositório em vez de referenciadas por URL. Isso tira uma
 * dependência de rede do caminho crítico, faz as fotos funcionarem offline no
 * PWA e evita que o app quebre se o repositório de origem sair do ar.
 *
 * Uso: node scripts/build-exercise-catalog.mjs
 * Saída: public/exercicios/*.jpg e supabase/seed/exercises.sql
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DATASET =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

const OUT_IMAGES = join(process.cwd(), 'public', 'exercicios')
const OUT_SQL = join(process.cwd(), 'supabase', 'seed', 'exercises.sql')

/**
 * Nosso vocabulário em português mapeado para o dataset em inglês.
 * `source` é o campo `name` exato do free-exercise-db.
 */
const CATALOG = [
  // Glúteo e posterior
  [
    'hip-thrust-barra',
    'Hip thrust com barra',
    'barra',
    'Glúteo máximo',
    'Barbell Hip Thrust',
    'Não encoste o glúteo no chão. Um segundo de aperto no topo.',
  ],
  [
    'elevacao-pelvica-maquina',
    'Elevação pélvica na máquina',
    'máquina',
    'Glúteo máximo',
    'Barbell Glute Bridge',
    'Mesma cadência da barra. A carga não se compara com a do hip thrust livre.',
  ],
  [
    'rdl-halteres',
    'Levantamento terra romeno',
    'halteres',
    'Posterior de coxa',
    'Romanian Deadlift',
    'Quadril para trás, halteres colados na perna. Pare antes de perder a lombar neutra.',
  ],
  [
    'pull-through',
    'Pull-through na polia',
    'polia',
    'Glúteo máximo',
    'Pull Through',
    'Ensina o padrão do terra romeno sem carga na coluna.',
  ],
  [
    'extensao-45-gluteo',
    'Extensão 45° foco glúteo',
    'máquina',
    'Glúteo máximo',
    'Hyperextensions (Back Extensions)',
    'Pés abertos e virados para fora, queixo baixo. Suba só até alinhar o quadril.',
  ],
  [
    'cadeira-flexora-sentada',
    'Cadeira flexora sentada',
    'máquina',
    'Posterior de coxa',
    'Seated Leg Curl',
    'Sentada alonga mais que deitada. Dois segundos na volta.',
  ],
  [
    'coice-polia',
    'Coice na polia',
    'polia',
    'Glúteo máximo',
    'One-Legged Cable Kickback',
    'Tronco à frente, um segundo de aperto, sem hiperestender a lombar.',
  ],
  [
    'coice-maquina',
    'Coice na máquina',
    'máquina',
    'Glúteo máximo',
    'Glute Kickback',
    'Tronco à frente, um segundo de aperto.',
  ],
  [
    'abducao-polia',
    'Abdução em pé na polia',
    'polia',
    'Glúteo médio',
    'Thigh Abductor',
    'Três segundos na volta. Só sobe carga quando fechar 20 repetições.',
  ],
  [
    'cadeira-abdutora',
    'Cadeira abdutora',
    'máquina',
    'Glúteo médio',
    'Thigh Abductor',
    'Tronco inclinado uns 30° à frente: é o que leva o estímulo para o glúteo médio.',
  ],

  // Quadríceps
  [
    'goblet-squat',
    'Goblet squat',
    'halteres',
    'Quadríceps',
    'Goblet Squat',
    'Profundidade completa, joelhos na linha dos pés.',
  ],
  [
    'agachamento-livre',
    'Agachamento livre',
    'barra',
    'Quadríceps',
    'Barbell Squat',
    'Profundidade completa. Nunca até a falha.',
  ],
  [
    'hack-squat',
    'Agachamento hack',
    'máquina',
    'Quadríceps',
    'Hack Squat',
    'Lombar colada no encosto o tempo todo.',
  ],
  [
    'leg-press-45',
    'Leg press 45°',
    'máquina',
    'Quadríceps',
    'Leg Press',
    'Pés na altura média, sem tirar a lombar do encosto.',
  ],
  [
    'cadeira-extensora',
    'Cadeira extensora',
    'máquina',
    'Quadríceps',
    'Leg Extensions',
    'Dois segundos na descida, um no topo.',
  ],
  [
    'bulgaro',
    'Agachamento búlgaro',
    'halteres',
    'Quadríceps',
    'Split Squat with Dumbbells',
    'Tronco 15 a 20° à frente para levar mais carga ao glúteo.',
  ],
  [
    'step-up',
    'Step-up alto',
    'halteres',
    'Glúteo máximo',
    'Step-up with Knee Raise',
    'Suba empurrando pelo calcanhar, sem impulsionar com a perna de trás.',
  ],

  // Panturrilha
  [
    'panturrilha-em-pe',
    'Panturrilha em pé',
    'máquina',
    'Panturrilha',
    'Standing Calf Raises',
    'Pausa de um segundo embaixo.',
  ],
  [
    'panturrilha-sentada',
    'Panturrilha sentada',
    'máquina',
    'Panturrilha',
    'Seated Calf Raise',
    'Pausa de um segundo embaixo.',
  ],

  // Costas
  [
    'remada-curvada-halteres',
    'Remada curvada com halteres',
    'halteres',
    'Costas',
    'Bent Over Two-Dumbbell Row',
    'Puxe para o quadril com as escápulas retraídas. Um segundo no final.',
  ],
  [
    'remada-baixa-sentada',
    'Remada baixa sentada',
    'polia',
    'Costas',
    'Seated Cable Rows',
    'Pegada neutra, escápulas retraídas.',
  ],
  [
    'serrote',
    'Serrote com halter',
    'halteres',
    'Costas',
    'One-Arm Dumbbell Row',
    'Cotovelo junto ao corpo, puxando para o quadril.',
  ],
  [
    'remada-unilateral-maquina',
    'Remada unilateral na máquina',
    'máquina',
    'Costas',
    'Leverage High Row',
    'Cotovelo junto ao corpo.',
  ],

  // Peito
  [
    'supino-halteres',
    'Supino com halteres',
    'halteres',
    'Peito',
    'Dumbbell Bench Press',
    'Escápulas retraídas, cotovelos a uns 45°.',
  ],
  [
    'supino-maquina',
    'Supino na máquina',
    'máquina',
    'Peito',
    'Leverage Chest Press',
    'Escápulas retraídas.',
  ],
  [
    'supino-inclinado-halteres',
    'Supino inclinado com halteres',
    'halteres',
    'Peito',
    'Incline Dumbbell Press',
    'Banco a 30°.',
  ],
  [
    'supino-inclinado-maquina',
    'Supino inclinado na máquina',
    'máquina',
    'Peito',
    'Leverage Incline Chest Press',
    'Banco a 30°.',
  ],

  // Ombro
  [
    'face-pull',
    'Face pull na polia',
    'polia',
    'Deltoide posterior',
    'Face Pull',
    'Corda na altura do rosto, cotovelos altos, rotação externa no final.',
  ],
  [
    'desenvolvimento-halteres',
    'Desenvolvimento com halteres',
    'halteres',
    'Ombro',
    'Dumbbell Shoulder Press',
    'Glúteo contraído, costela fechada.',
  ],
  [
    'desenvolvimento-maquina',
    'Desenvolvimento na máquina',
    'máquina',
    'Ombro',
    'Leverage Shoulder Press',
    'Costela fechada.',
  ],
  [
    'crucifixo-inverso',
    'Crucifixo inverso',
    'halteres',
    'Deltoide posterior',
    'Seated Bent-Over Rear Delt Raise',
    'Dois segundos na volta. É postura, não volume.',
  ],
  [
    'crucifixo-inverso-maquina',
    'Crucifixo inverso na máquina',
    'máquina',
    'Deltoide posterior',
    'Cable Rear Delt Fly',
    'Dois segundos na volta.',
  ],
  [
    'elevacao-lateral',
    'Elevação lateral',
    'halteres',
    'Deltoide lateral',
    'Side Lateral Raise',
    'Dose de manutenção, de propósito. Não precisa crescer aqui.',
  ],

  // Braço
  [
    'triceps-polia',
    'Tríceps na polia',
    'polia',
    'Tríceps',
    'Triceps Pushdown',
    'Cotovelos parados ao lado do corpo.',
  ],
  [
    'triceps-testa',
    'Tríceps testa',
    'halteres',
    'Tríceps',
    'EZ-Bar Skullcrusher',
    'Cotovelos apontados para o teto.',
  ],
  [
    'rosca-halteres',
    'Rosca com halteres',
    'halteres',
    'Bíceps',
    'Dumbbell Bicep Curl',
    'Sem balanço de tronco.',
  ],
  [
    'rosca-alternada',
    'Rosca alternada',
    'halteres',
    'Bíceps',
    'Alternate Hammer Curl',
    'Sem balanço de tronco.',
  ],
  [
    'rosca-maquina',
    'Rosca na máquina',
    'máquina',
    'Bíceps',
    'Preacher Curl',
    'Braço colado no apoio.',
  ],

  // Core
  [
    'abdominal-solo',
    'Abdominal no solo',
    'peso do corpo',
    'Core',
    'Crunches',
    'Sem puxar o pescoço com as mãos.',
  ],
  [
    'abdominal-maquina',
    'Abdominal na máquina',
    'máquina',
    'Core',
    'Ab Crunch Machine',
    'Movimento vem da coluna, não do quadril.',
  ],
  [
    'prancha',
    'Prancha',
    'peso do corpo',
    'Core',
    'Plank',
    'Glúteo contraído, quadril na linha dos ombros.',
  ],
  [
    'dead-bug',
    'Dead bug',
    'peso do corpo',
    'Core',
    'Dead Bug',
    'Lombar colada no chão o tempo inteiro.',
  ],
]

function sqlText(value) {
  if (value === null || value === undefined) return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

async function main() {
  const response = await fetch(DATASET)
  if (!response.ok) throw new Error(`Falha ao baixar o dataset: HTTP ${response.status}`)

  const dataset = await response.json()
  const byName = new Map(dataset.map((exercise) => [exercise.name.toLowerCase(), exercise]))

  await mkdir(OUT_IMAGES, { recursive: true })
  await mkdir(join(process.cwd(), 'supabase', 'seed'), { recursive: true })

  const missing = []
  const rows = []

  for (const [slug, name, equipment, muscle, sourceName, cue] of CATALOG) {
    const source = byName.get(sourceName.toLowerCase())

    if (!source) {
      missing.push(`${slug} -> "${sourceName}"`)
      continue
    }

    const paths = []

    for (const [index, image] of source.images.slice(0, 2).entries()) {
      const url = `${IMAGE_BASE}/${image.split('/').slice(-2).map(encodeURIComponent).join('/')}`
      const file = `${slug}-${index}.jpg`

      const imageResponse = await fetch(url)
      if (!imageResponse.ok) {
        missing.push(`${slug} imagem ${index}: HTTP ${imageResponse.status}`)
        continue
      }

      await writeFile(join(OUT_IMAGES, file), Buffer.from(await imageResponse.arrayBuffer()))
      paths.push(`/exercicios/${file}`)
    }

    rows.push(
      `  (${sqlText(slug)}, ${sqlText(name)}, ${sqlText(equipment)}, ${sqlText(muscle)}, ` +
        `${sqlText(paths[0] ?? null)}, ${sqlText(paths[1] ?? null)}, ${sqlText(cue)})`,
    )

    process.stdout.write(`. ${slug}\n`)
  }

  const sql = [
    '-- Gerado por scripts/build-exercise-catalog.mjs. Não edite à mão.',
    '-- Fonte: github.com/yuhonas/free-exercise-db (Unlicense, domínio público).',
    '',
    'insert into public.exercises (slug, name, equipment, primary_muscle, media_start_path, media_end_path, cue)',
    'values',
    rows.join(',\n') + ';',
    '',
  ].join('\n')

  await writeFile(OUT_SQL, sql, 'utf8')

  console.log(`\n${rows.length} exercícios no catálogo.`)
  if (missing.length) {
    console.log(`\nNão resolvidos (${missing.length}):`)
    missing.forEach((entry) => console.log(`  - ${entry}`))
    process.exitCode = 1
  }
}

await main()
