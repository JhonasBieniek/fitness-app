/**
 * Monta o catálogo de exercícios a partir de `scripts/catalogo.mjs`.
 *
 * As fotos vêm do free-exercise-db, que é domínio público (Unlicense), e são
 * copiadas para dentro do repositório em vez de referenciadas por URL: tira uma
 * dependência de rede do caminho crítico, funciona offline no PWA e não quebra
 * se o repositório de origem sair do ar.
 *
 * Exercício com `source: null` fica sem foto de propósito — o acervo não tem
 * aquele movimento, e uma foto de outro exercício ensina errado.
 *
 * Uso: node scripts/build-exercise-catalog.mjs
 * Saída: public/exercicios/*.jpg e supabase/seed/exercises.sql
 */

import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { CATALOG } from './catalogo.mjs'

const DATASET =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

const OUT_IMAGES = join(process.cwd(), 'public', 'exercicios')
const OUT_SQL = join(process.cwd(), 'supabase', 'seed', 'exercises.sql')

function sqlText(value) {
  if (value === null || value === undefined) return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlTextArray(values) {
  if (!values || values.length === 0) return `'{}'`
  return `array[${values.map(sqlText).join(', ')}]`
}

async function main() {
  const response = await fetch(DATASET)
  if (!response.ok) throw new Error(`Falha ao baixar o dataset: HTTP ${response.status}`)

  const dataset = await response.json()
  const byName = new Map(dataset.map((exercise) => [exercise.name.toLowerCase(), exercise]))

  await mkdir(OUT_IMAGES, { recursive: true })
  await mkdir(join(process.cwd(), 'supabase', 'seed'), { recursive: true })

  const problems = []
  const rows = []
  const keptFiles = new Set()

  for (const item of CATALOG) {
    const paths = []

    if (item.source) {
      const source = byName.get(item.source.toLowerCase())

      if (!source) {
        problems.push(`${item.slug}: "${item.source}" não existe no acervo`)
      } else {
        for (const [index, image] of source.images.slice(0, 2).entries()) {
          const url = `${IMAGE_BASE}/${image.split('/').slice(-2).map(encodeURIComponent).join('/')}`
          const file = `${item.slug}-${index}.jpg`

          const imageResponse = await fetch(url)
          if (!imageResponse.ok) {
            problems.push(`${item.slug} imagem ${index}: HTTP ${imageResponse.status}`)
            continue
          }

          await writeFile(join(OUT_IMAGES, file), Buffer.from(await imageResponse.arrayBuffer()))
          keptFiles.add(file)
          paths.push(`/exercicios/${file}`)
        }
      }
    }

    rows.push(
      `  (${sqlText(item.slug)}, ${sqlText(item.name)}, ${sqlText(item.equipment)}, ` +
        `${sqlText(item.muscle)}, ${sqlText(paths[0] ?? null)}, ${sqlText(paths[1] ?? null)}, ` +
        `${sqlText(item.cue)}, ${sqlTextArray(item.steps)})`,
    )
  }

  // Remove fotos de exercícios que deixaram de ter fonte, para o diretório não
  // acumular imagem órfã a cada mudança do catálogo.
  for (const file of await readdir(OUT_IMAGES)) {
    if (file.endsWith('.jpg') && !keptFiles.has(file)) {
      await unlink(join(OUT_IMAGES, file))
    }
  }

  const sql = `-- Gerado por scripts/build-exercise-catalog.mjs. Não edite à mão.
-- Fotos: free-exercise-db (Unlicense). Exercício sem foto é exercício que o
-- acervo não tem: melhor nenhuma imagem do que a imagem de outro movimento.

insert into public.exercises
  (slug, name, equipment, primary_muscle, media_start_path, media_end_path, cue, steps)
values
${rows.join(',\n')}
on conflict (slug) do update set
  name = excluded.name,
  equipment = excluded.equipment,
  primary_muscle = excluded.primary_muscle,
  media_start_path = excluded.media_start_path,
  media_end_path = excluded.media_end_path,
  cue = excluded.cue,
  steps = excluded.steps;
`

  await writeFile(OUT_SQL, sql, 'utf8')

  const withPhoto = CATALOG.filter((item) => item.source).length
  console.log(`${CATALOG.length} exercícios, ${withPhoto} com foto, ${keptFiles.size} arquivos.`)

  if (problems.length > 0) {
    console.log('\nProblemas:')
    problems.forEach((problem) => console.log(`  ${problem}`))
    process.exitCode = 1
  }
}

await main()
