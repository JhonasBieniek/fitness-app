/**
 * Gera o seed do plano de treino e alimentação.
 *
 * O plano é escrito aqui como estrutura de dados e traduzido para SQL, em vez
 * de digitado como SQL. São cinco dias de treino, cinco refeições e duas
 * versões de porção: à mão, um erro de vírgula passaria despercebido.
 *
 * As linhas são associadas ao usuário por e-mail, então o mesmo arquivo serve
 * para o banco local e para o projeto na nuvem, onde os ids são outros.
 *
 * Uso: node scripts/build-plan-seed.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const OUT = join(process.cwd(), 'supabase', 'seed', 'plans.sql')

const ELA = 'ela@bloco.local'
const ELE = 'jhonas@bloco.local'

const BLOCK_START = '2026-09-07' // segunda-feira

// ---------------------------------------------------------------------------
// Treino
// ---------------------------------------------------------------------------
// [posição, slug acompanhada, slug sozinha, séries, reps, descanso, nota,
//  séries força, reps força, sai no deload]
const TRAINING_DAYS = [
  {
    weekday: 1,
    title: 'Quadríceps e glúteo',
    focus: 'Pesado',
    duration: 55,
    exercises: [
      [
        'hip-thrust-barra',
        'elevacao-pelvica-maquina',
        3,
        '8–10',
        120,
        'O exercício central da semana. Regra de +5 kg.',
        4,
        '6–8',
        false,
      ],
      [
        'agachamento-livre',
        'hack-squat',
        3,
        '8–10',
        120,
        'Goblet squat até a semana 4, barra a partir da 5.',
        3,
        '6–8',
        false,
      ],
      [
        'leg-press-45',
        'leg-press-45',
        2,
        '10–12',
        90,
        'Pés na altura média, sem tirar a lombar do encosto.',
        3,
        null,
        false,
      ],
      ['cadeira-extensora', 'cadeira-extensora', 2, '12–15', 60, null, 3, null, false],
      ['panturrilha-em-pe', 'panturrilha-em-pe', 3, '12–15', 60, null, null, null, false],
    ],
  },
  {
    weekday: 2,
    title: 'Superiores',
    focus: 'Costas e peito',
    duration: 45,
    exercises: [
      [
        'remada-curvada-halteres',
        'remada-baixa-sentada',
        3,
        '8–10',
        90,
        'Espessura e postura: puxe para o quadril, um segundo no final.',
        null,
        null,
        false,
      ],
      ['supino-halteres', 'supino-maquina', 3, '8–10', 90, null, null, null, false],
      [
        'face-pull',
        'face-pull',
        3,
        '12–15',
        60,
        'Entrou no lugar da puxada alta. É postura de ombro.',
        null,
        null,
        false,
      ],
      ['triceps-polia', 'triceps-polia', 2, '10–12', 60, null, null, null, false],
      ['rosca-halteres', 'rosca-maquina', 2, '10–12', 60, null, null, null, false],
      ['abdominal-solo', 'abdominal-maquina', 3, '12–15', 60, null, null, null, false],
    ],
  },
  {
    weekday: 3,
    title: 'Posterior e glúteo',
    focus: 'Moderado',
    duration: 55,
    exercises: [
      [
        'rdl-halteres',
        'pull-through',
        3,
        '8–10',
        120,
        'Pull-through nas 4 primeiras semanas ensina o padrão sem carga na coluna.',
        3,
        '6–8',
        false,
      ],
      [
        'hip-thrust-barra',
        'elevacao-pelvica-maquina',
        3,
        '10–12',
        90,
        'Uns 75% da carga de segunda. Mesma cadência.',
        null,
        null,
        false,
      ],
      [
        'extensao-45-gluteo',
        'extensao-45-gluteo',
        2,
        '12–15',
        75,
        'Anilha no peito quando 15 ficarem fáceis.',
        3,
        null,
        false,
      ],
      [
        'cadeira-flexora-sentada',
        'cadeira-flexora-sentada',
        3,
        '10–12',
        90,
        null,
        null,
        null,
        false,
      ],
      ['abducao-polia', 'cadeira-abdutora', 2, '15–20', 60, null, 3, null, false],
    ],
  },
  {
    weekday: 4,
    title: 'Superiores',
    focus: 'Ombro e braço',
    duration: 45,
    exercises: [
      [
        'supino-inclinado-halteres',
        'supino-inclinado-maquina',
        3,
        '8–10',
        90,
        null,
        null,
        null,
        false,
      ],
      ['serrote', 'remada-unilateral-maquina', 3, '8–10', 90, null, null, null, false],
      [
        'desenvolvimento-halteres',
        'desenvolvimento-maquina',
        2,
        '8–10',
        90,
        null,
        null,
        null,
        false,
      ],
      ['crucifixo-inverso', 'crucifixo-inverso-maquina', 2, '12–15', 60, null, null, null, false],
      [
        'elevacao-lateral',
        'elevacao-lateral',
        2,
        '12–15',
        60,
        'Dose de manutenção, de propósito.',
        null,
        null,
        false,
      ],
      ['rosca-alternada', 'rosca-maquina', 2, '10–12', 60, null, null, null, false],
      ['triceps-testa', 'triceps-polia', 1, '10–12', 60, null, null, null, false],
      [
        'prancha',
        'prancha',
        3,
        '20–40 s',
        60,
        'Seguido de 8 dead bugs por lado.',
        null,
        null,
        false,
      ],
    ],
  },
  {
    weekday: 5,
    title: 'Glúteo',
    focus: 'Unilateral e metabólico',
    duration: 50,
    exercises: [
      [
        'bulgaro',
        'leg-press-45',
        3,
        '8–10 por perna',
        90,
        'Primeiro da sessão, feito descansada. Nas 4 primeiras semanas, só peso do corpo.',
        null,
        null,
        true,
      ],
      [
        'step-up',
        'leg-press-45',
        2,
        '10–12 por perna',
        90,
        'Caixa na altura do joelho. Suba pelo calcanhar.',
        null,
        null,
        true,
      ],
      [
        'hip-thrust-barra',
        'elevacao-pelvica-maquina',
        2,
        '12–15',
        60,
        'Uns 60% da carga de segunda. Descanso curto de propósito.',
        null,
        null,
        false,
      ],
      ['coice-polia', 'coice-maquina', 2, '12–15 por perna', 60, null, null, null, false],
      [
        'abducao-polia',
        'cadeira-abdutora',
        3,
        '15–20',
        60,
        'Três segundos na volta.',
        null,
        null,
        false,
      ],
      ['panturrilha-sentada', 'panturrilha-sentada', 2, '12–15', 60, null, null, null, false],
    ],
  },
]

// ---------------------------------------------------------------------------
// Alimentação
// ---------------------------------------------------------------------------
const TARGETS = {
  [ELA]: {
    kcal: 2430,
    protein: 175,
    proteinMin: 110,
    carb: 295,
    fat: 60,
    waterMin: 2.2,
    waterMax: 2.7,
  },
  [ELE]: {
    kcal: 2700,
    protein: 210,
    proteinMin: 160,
    carb: 300,
    fat: 60,
    waterMin: 3.5,
    waterMax: null,
  },
}

// Cada item traz a porção das duas pessoas: o cardápio é o mesmo, muda a quantidade.
const MEALS = [
  {
    position: 1,
    name: 'Café da manhã',
    timeFasted: '08:30',
    timeEvening: '09:00',
    kcal: { [ELA]: 520, [ELE]: 600 },
    protein: { [ELA]: 24, [ELE]: 30 },
    note: 'Na versão de manhã, é a primeira refeição do dia, logo depois do treino.',
    options: [
      {
        items: [
          ['Pão', { [ELA]: '50 g', [ELE]: '60 g' }, 'Qualquer um, menos frito'],
          ['Ovos', { [ELA]: '2 un.', [ELE]: '3 un.' }, 'Ou queijo minas: 60 g / 80 g'],
          ['Fruta', { [ELA]: '2 porções', [ELE]: '2 porções' }, null],
          ['Leite integral', { [ELA]: '200 ml', [ELE]: '—' }, null],
          ['Creatina', { [ELA]: '3 g', [ELE]: '5 g' }, 'Com água. O horário não muda o efeito'],
        ],
      },
    ],
  },
  {
    position: 2,
    name: 'Almoço',
    timeFasted: '12:00',
    timeEvening: '12:00',
    kcal: { [ELA]: 520, [ELE]: 620 },
    protein: { [ELA]: 41, [ELE]: 55 },
    note: null,
    options: [
      {
        items: [
          ['Legumes e verduras', { [ELA]: 'à vontade', [ELE]: 'à vontade' }, 'Mínimo 1 pegador'],
          [
            'Frango / carne magra / peixe',
            { [ELA]: '100 / 90 / 120 g', [ELE]: '160 / 150 / 180 g' },
            'Assado, cozido, grelhado ou desfiado',
          ],
          [
            'Arroz / macarrão / batata-doce',
            { [ELA]: '160 / 160 / 200 g', [ELE]: '210 / 210 / 230 g' },
            'Pesar depois de cozido',
          ],
          [
            'Feijão',
            { [ELA]: '100 g', [ELE]: '100 g' },
            'Não é opcional para ela: é o ferro do dia',
          ],
          ['Azeite', { [ELA]: '5 g', [ELE]: '—' }, 'Cru, por cima'],
        ],
      },
    ],
  },
  {
    position: 3,
    name: 'Lanche',
    timeFasted: '15:30',
    timeEvening: '15:30',
    kcal: { [ELA]: 430, [ELE]: 520 },
    protein: { [ELA]: 30, [ELE]: 45 },
    note: 'Se treinar à tarde, este é o pré-treino: faça 60 a 90 min antes.',
    options: [
      {
        label: 'Prato',
        items: [
          [
            'Carne / frango / peixe',
            { [ELA]: '70 / 80 / 100 g', [ELE]: '150 / 160 / 180 g' },
            null,
          ],
          [
            'Arroz / macarrão / batata-doce',
            { [ELA]: '150 / 150 / 190 g', [ELE]: '210 / 210 / 230 g' },
            null,
          ],
          ['Azeite', { [ELA]: '5 g', [ELE]: '—' }, null],
          ['Fruta', { [ELA]: '1 porção', [ELE]: '—' }, null],
        ],
      },
      {
        label: 'Lanche',
        items: [
          ['Pão', { [ELA]: '50 g', [ELE]: '60 g' }, null],
          ['Ovo', { [ELA]: '2 un.', [ELE]: '2 un.' }, null],
          ['Frango desfiado ou atum', { [ELA]: '50 g', [ELE]: '80 g' }, 'Atum em água'],
          ['Fruta', { [ELA]: '1 porção', [ELE]: '2 porções' }, null],
        ],
      },
      {
        label: 'Vitamina',
        note: 'A mais fácil quando não bate a fome.',
        items: [
          ['Leite integral', { [ELA]: '250 ml', [ELE]: '300 ml' }, null],
          ['Banana', { [ELA]: '100 g', [ELE]: '120 g' }, '1 média'],
          ['Aveia em flocos', { [ELA]: '30 g', [ELE]: '40 g' }, null],
          ['Pasta de amendoim', { [ELA]: '15 g', [ELE]: '20 g' }, null],
        ],
      },
    ],
  },
  {
    position: 4,
    name: 'Jantar',
    timeFasted: '19:30',
    timeEvening: '19:30',
    kcal: { [ELA]: 520, [ELE]: 620 },
    protein: { [ELA]: 41, [ELE]: 55 },
    note: 'Se treinar à tarde, é o pós-treino.',
    options: [
      {
        label: 'Igual ao almoço',
        items: [
          ['Legumes e verduras', { [ELA]: 'à vontade', [ELE]: 'à vontade' }, null],
          [
            'Frango / carne magra / peixe',
            { [ELA]: '100 / 90 / 120 g', [ELE]: '160 / 150 / 180 g' },
            null,
          ],
          [
            'Arroz / macarrão / batata-doce',
            { [ELA]: '160 / 160 / 200 g', [ELE]: '210 / 210 / 230 g' },
            null,
          ],
          ['Feijão', { [ELA]: '100 g', [ELE]: '100 g' }, null],
          ['Azeite', { [ELA]: '5 g', [ELE]: '—' }, null],
        ],
      },
      {
        label: 'Hambúrguer caseiro',
        items: [
          ['Pão de hambúrguer', { [ELA]: '80 g', [ELE]: '100 g' }, null],
          ['Hambúrguer caseiro', { [ELA]: '110 g', [ELE]: '160 g' }, 'Patinho ou frango'],
          ['Queijo branco', { [ELA]: '20 g', [ELE]: '20 g' }, null],
          ['Alface, tomate, cebola', { [ELA]: 'à vontade', [ELE]: 'à vontade' }, null],
        ],
      },
    ],
  },
  {
    position: 5,
    name: 'Ceia',
    timeFasted: '21:00',
    timeEvening: '21:00',
    kcal: { [ELA]: 460, [ELE]: 500 },
    protein: { [ELA]: 34, [ELE]: 38 },
    note: 'Líquida e doce de propósito: é a refeição que entra mesmo sem fome.',
    options: [
      {
        label: 'Com whey',
        items: [
          ['Iogurte natural integral', { [ELA]: '200 ml', [ELE]: '200 ml' }, 'Ou leite: 250 ml'],
          ['Whey protein', { [ELA]: '25 g', [ELE]: '25 g' }, null],
          ['Aveia em flocos', { [ELA]: '40 g', [ELE]: '60 g' }, null],
          ['Mel', { [ELA]: '10 g', [ELE]: '10 g' }, null],
          ['Pasta de amendoim', { [ELA]: '10 g', [ELE]: '—' }, null],
        ],
      },
      {
        label: 'Sem whey',
        note: 'A proteína do dia cai uns 17 g e continua acima do mínimo.',
        items: [
          ['Iogurte natural integral', { [ELA]: '200 ml', [ELE]: '200 ml' }, null],
          ['Aveia em flocos', { [ELA]: '40 g', [ELE]: '60 g' }, null],
          ['Mel', { [ELA]: '10 g', [ELE]: '10 g' }, null],
          ['Pasta de amendoim', { [ELA]: '20 g', [ELE]: '20 g' }, null],
          ['Fruta', { [ELA]: '1 porção', [ELE]: '1 porção' }, null],
        ],
      },
    ],
  },
]

const RULES = [
  ['Organização', 'Deixar as refeições do dia prontas pelo menos um dia antes.'],
  ['Água', { [ELA]: 'Mínimo 2,5 L por dia.', [ELE]: 'Mínimo 3,5 L por dia.' }],
  ['Sono', 'Mínimo 7 h por noite.'],
  ['Cafeína', 'Nada com cafeína depois das 14h.'],
  [
    'Refeição livre',
    'Até 2 por semana, em dias diferentes. Substitui o almoço ou o jantar, não soma. Evitar fritura.',
  ],
  [
    'Creatina',
    {
      [ELA]: '3 g todo dia, com água, sem interrupção.',
      [ELE]: '5 g todo dia, com água, sem interrupção.',
    },
  ],
]

const FASTING = [
  [
    'Treino em jejum',
    'O café da manhã é a primeira refeição do dia, logo depois do treino. São as mesmas 5 refeições, só com o café mais tarde.\n\nSe aparecer tontura, cair a carga na barra ou faltar força nas últimas séries, adiante a fruta do café (1 banana) para 20 minutos antes de treinar. Ela sai do café, não entra por cima: o total do dia não muda.',
  ],
]

const DETAILS = [
  [
    'Ajuste quinzenal do peso',
    'Pesar em 3 manhãs por semana, depois do banheiro e antes de comer, sempre na mesma balança. Vale a média da semana, não o dia.\n\nMeta: subir 150 a 300 g por semana.\n\nSe a média não subir por 2 semanas seguidas, somar 150 kcal por dia: mais 20 g de arroz no almoço e no jantar, mais 10 g de pasta de amendoim na ceia. Repetir a cada 2 semanas até a média voltar a subir.\n\nSe a média subir mais de 400 g por semana durante 2 semanas e a cintura aumentar visivelmente, tirar 100 kcal por dia (a pasta de amendoim da ceia).',
  ],
  [
    'Substituições',
    'Arroz, macarrão e batata trocam entre si nas quantidades da tabela.\n\nFrango, carne bovina magra e peixe trocam entre si nas quantidades da tabela. Carne vermelha 3 a 4 vezes por semana, pelo ferro.\n\nO whey da ceia pode sair: use a opção sem whey, que compensa com iogurte e pasta de amendoim.\n\nSe o apetite for o problema, corte a carne. Nunca corte arroz, pão ou aveia: é de onde vem a caloria que faz ganhar peso.',
  ],
  [
    'Listas',
    'Carnes magras: patinho, coxão mole, alcatra, filé mignon, frango sem pele, tilápia, merluza, atum em água.\n\nFrutas: banana, maçã, mamão, melão, manga, abacaxi, laranja, morango, uva.\n\nLegumes e verduras: alface, rúcula, agrião, tomate, pepino, cenoura, beterraba, abobrinha, chuchu, brócolis, couve-flor, vagem, berinjela.\n\nTemperos: alho, cebola, salsinha, cebolinha, orégano, manjericão, açafrão, páprica, pimenta-do-reino, limão, vinagre.',
  ],
]

// ---------------------------------------------------------------------------
// Geração
// ---------------------------------------------------------------------------
function q(value) {
  if (value === null || value === undefined || value === '') return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

function pick(value, email) {
  return value !== null && typeof value === 'object' ? value[email] : value
}

const lines = []
const say = (line = '') => lines.push(line)

say('-- Gerado por scripts/build-plan-seed.mjs. Não edite à mão.')
say('-- Vincula o plano pelo e-mail, então funciona no banco local e na nuvem.')
say('')

for (const email of [ELA, ELE]) {
  const target = TARGETS[email]
  const label = email === ELA ? 'ela' : 'ele'

  say(`-- ===== ${label} (${email}) =====`)
  say('do $$')
  say('declare')
  say('  v_user uuid;')
  say('  v_block uuid;')
  say('  v_day uuid;')
  say('  v_plan uuid;')
  say('  v_meal uuid;')
  say('  v_option uuid;')
  say('begin')
  say(`  select id into v_user from auth.users where email = ${q(email)};`)
  say('  if v_user is null then')
  say(`    raise notice 'Usuário % não existe, plano ignorado.', ${q(email)};`)
  say('    return;')
  say('  end if;')
  say('')

  // --- treino
  say('  insert into public.training_blocks (user_id, name, started_on, total_weeks)')
  say(`  values (v_user, 'Bloco 1 — glúteo e pernas', ${q(BLOCK_START)}, 12)`)
  say('  returning id into v_block;')
  say('')

  for (const day of TRAINING_DAYS) {
    say('  insert into public.training_days (block_id, weekday, title, focus, duration_minutes)')
    say(`  values (v_block, ${day.weekday}, ${q(day.title)}, ${q(day.focus)}, ${day.duration})`)
    say('  returning id into v_day;')
    say('')
    say('  insert into public.training_day_exercises')
    say(
      '    (day_id, position, exercise_partnered_id, exercise_solo_id, sets, reps, rest_seconds, note, strength_sets, strength_reps, skip_on_deload)',
    )
    say('  values')

    const rows = day.exercises.map(
      ([partnered, solo, sets, reps, rest, note, sSets, sReps, skip], index) =>
        `    (v_day, ${index + 1}, ` +
        `(select id from public.exercises where slug = ${q(partnered)}), ` +
        `(select id from public.exercises where slug = ${q(solo)}), ` +
        `${sets}, ${q(reps)}, ${rest}, ${q(note)}, ${sSets ?? 'null'}, ${q(sReps)}, ${skip})`,
    )

    say(rows.join(',\n') + ';')
    say('')
  }

  // --- alimentação
  say('  insert into public.meal_plans')
  say(
    '    (user_id, name, kcal_target, protein_g, protein_min_g, carb_g, fat_g, water_min_l, water_max_l)',
  )
  say(
    `  values (v_user, 'Plano de ganho de massa', ${target.kcal}, ${target.protein}, ${target.proteinMin}, ` +
      `${target.carb}, ${target.fat}, ${target.waterMin}, ${target.waterMax ?? 'null'})`,
  )
  say('  returning id into v_plan;')
  say('')

  for (const meal of MEALS) {
    say(
      '  insert into public.meals (plan_id, position, name, time_fasted, time_evening, kcal, protein_g, note)',
    )
    say(
      `  values (v_plan, ${meal.position}, ${q(meal.name)}, ${q(meal.timeFasted)}, ${q(meal.timeEvening)}, ` +
        `${meal.kcal[email]}, ${meal.protein[email]}, ${q(meal.note)})`,
    )
    say('  returning id into v_meal;')
    say('')

    for (const [optionIndex, option] of meal.options.entries()) {
      say('  insert into public.meal_options (meal_id, position, label, note)')
      say(
        `  values (v_meal, ${optionIndex + 1}, ${q(option.label ?? null)}, ${q(option.note ?? null)})`,
      )
      say('  returning id into v_option;')
      say('')
      say('  insert into public.meal_items (option_id, position, name, amount, note) values')

      const items = option.items.map(
        ([name, amount, note], index) =>
          `    (v_option, ${index + 1}, ${q(name)}, ${q(amount[email])}, ${q(note)})`,
      )

      say(items.join(',\n') + ';')
      say('')
    }
  }

  say('  insert into public.plan_notes (plan_id, kind, position, title, body) values')
  const noteRows = [
    ...RULES.map(
      ([title, body], index) =>
        `    (v_plan, 'regra', ${index + 1}, ${q(title)}, ${q(pick(body, email))})`,
    ),
    ...DETAILS.map(
      ([title, body], index) => `    (v_plan, 'detalhe', ${index + 1}, ${q(title)}, ${q(body)})`,
    ),
    ...FASTING.map(
      ([title, body], index) => `    (v_plan, 'jejum', ${index + 1}, ${q(title)}, ${q(body)})`,
    ),
  ]
  say(noteRows.join(',\n') + ';')
  say('end $$;')
  say('')
}

await mkdir(join(process.cwd(), 'supabase', 'seed'), { recursive: true })
await writeFile(OUT, lines.join('\n'), 'utf8')

const exerciseCount = TRAINING_DAYS.reduce((sum, day) => sum + day.exercises.length, 0)
const itemCount = MEALS.reduce(
  (sum, meal) => sum + meal.options.reduce((inner, option) => inner + option.items.length, 0),
  0,
)

console.log(
  `Seed gerado: 2 usuários x (${TRAINING_DAYS.length} dias / ${exerciseCount} exercícios / ${MEALS.length} refeições / ${itemCount} itens).`,
)
