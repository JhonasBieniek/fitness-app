/**
 * Gera os ícones do PWA a partir da mesma marca usada no cabeçalho.
 *
 * Duas versões, porque um só desenho não serve para os dois tamanhos:
 * - `icone-*.png`: transparente, para navegadores que compõem o próprio fundo.
 * - `icone-mascarado-*.png`: com fundo e margem de segurança, para Android
 *   recortar em círculo, quadrado ou seja lá qual for a máscara do launcher.
 *
 * Uso: node scripts/build-icons.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import sharp from 'sharp'

const OUT = join(process.cwd(), 'public', 'icones')

const INK = '#1A1918'
const PAPER = '#FAFAF8'
const ACCENT = '#37604A'

/** As doze marcas do protocolo, desenhadas em um viewBox de 24. */
function dialPaths({ stroke, accent }) {
  const total = 12
  const lines = []

  for (let tick = 1; tick <= total; tick += 1) {
    const angle = ((tick - 1) / total) * 2 * Math.PI - Math.PI / 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    // No ícone a "semana atual" é fixa no topo: dá assimetria suficiente para
    // a marca ser reconhecível de relance, mesmo pequena.
    if (tick === 1) {
      lines.push(
        `<line x1="${(12 + cos * 2.4).toFixed(3)}" y1="${(12 + sin * 2.4).toFixed(3)}" ` +
          `x2="${(12 + cos * 10.8).toFixed(3)}" y2="${(12 + sin * 10.8).toFixed(3)}" ` +
          `stroke="${accent}" stroke-width="2.3" stroke-linecap="round" />`,
      )
      continue
    }

    lines.push(
      `<circle cx="${(12 + cos * 9.9).toFixed(3)}" cy="${(12 + sin * 9.9).toFixed(3)}" ` +
        `r="0.95" fill="${stroke}" opacity="0.28" />`,
    )
  }

  return lines.join('')
}

function markSvg({ size, background, stroke, accent, padding }) {
  const inner = 24
  const scale = (size * (1 - padding * 2)) / inner
  const offset = (size - inner * scale) / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${background ? `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${background}" />` : ''}
  <g transform="translate(${offset} ${offset}) scale(${scale})" fill="none">${dialPaths({ stroke, accent })}</g>
</svg>`
}

async function main() {
  await mkdir(OUT, { recursive: true })

  const jobs = [
    // Transparente, tinta escura: usado sobre fundos claros.
    {
      file: 'icone-192.png',
      size: 192,
      background: null,
      stroke: INK,
      accent: ACCENT,
      padding: 0.12,
    },
    {
      file: 'icone-512.png',
      size: 512,
      background: null,
      stroke: INK,
      accent: ACCENT,
      padding: 0.12,
    },
    // Mascarável: 20% de margem, que é o mínimo seguro da zona de recorte.
    {
      file: 'icone-mascarado-192.png',
      size: 192,
      background: PAPER,
      stroke: INK,
      accent: ACCENT,
      padding: 0.22,
    },
    {
      file: 'icone-mascarado-512.png',
      size: 512,
      background: PAPER,
      stroke: INK,
      accent: ACCENT,
      padding: 0.22,
    },
    // iOS não aplica máscara nem transparência: precisa do fundo desenhado.
    {
      file: 'apple-touch-icon.png',
      size: 180,
      background: PAPER,
      stroke: INK,
      accent: ACCENT,
      padding: 0.18,
    },
  ]

  for (const job of jobs) {
    const svg = markSvg(job)
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(OUT, job.file))
    console.log(`  ${job.file}`)
  }

  // Versão vetorial, usada no favicon.
  await writeFile(
    join(OUT, 'marca.svg'),
    markSvg({
      size: 24,
      background: null,
      stroke: 'currentColor',
      accent: 'currentColor',
      padding: 0,
    }),
    'utf8',
  )

  console.log('  marca.svg')
}

await main()
