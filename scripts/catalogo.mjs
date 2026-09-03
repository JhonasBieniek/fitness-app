/**
 * O catálogo de exercícios do app.
 *
 * `source` é o nome exato no free-exercise-db, de onde saem as fotos. Vem
 * `null` quando o acervo não tem aquele movimento: foto de outro exercício
 * ensina errado, e é melhor não ter nenhuma. Quem ensina a execução são os
 * `steps`, que são conteúdo nosso e estão corretos por construção.
 */
export const CATALOG = [
  // ---------------------------------------------------------------------------
  // Glúteo e posterior
  // ---------------------------------------------------------------------------
  {
    slug: 'hip-thrust-barra',
    name: 'Hip thrust com barra',
    equipment: 'barra',
    muscle: 'Glúteo máximo',
    source: 'Barbell Hip Thrust',
    cue: 'O erro comum é subir com a lombar em vez do quadril. Quem empurra é o glúteo.',
    steps: [
      'Apoie a escápula na borda do banco, barra na dobra do quadril, pés na largura dos ombros.',
      'Empurre pelo calcanhar até o tronco ficar paralelo ao chão, com o queixo baixo.',
      'Aperte o glúteo um segundo no topo e desça sem encostar no chão.',
    ],
  },
  {
    slug: 'elevacao-pelvica-maquina',
    name: 'Elevação pélvica na máquina',
    equipment: 'máquina',
    muscle: 'Glúteo máximo',
    source: null, // O acervo não tem a máquina de glúteo, só a versão com barra no chão.
    cue: 'Mesma cadência da barra. A carga não se compara com a do hip thrust livre.',
    steps: [
      'Ajuste o encosto para o apoio ficar na dobra do quadril, não na barriga.',
      'Empurre até estender o quadril, sem jogar a lombar para trás.',
      'Um segundo de aperto no topo e dois segundos na volta.',
    ],
  },
  {
    slug: 'rdl-halteres',
    name: 'Levantamento terra romeno',
    equipment: 'halteres',
    muscle: 'Posterior de coxa',
    source: null, // As duas fotos do acervo são em pé com barra: não mostram a dobra do quadril.
    cue: 'Não é agachar: o joelho quase não dobra, quem desce é o quadril.',
    steps: [
      'Em pé, halteres à frente das coxas, joelhos levemente destravados.',
      'Leve o quadril para trás deslizando os halteres pela perna, coluna neutra.',
      'Pare quando sentir o posterior alongar e volte empurrando o quadril à frente.',
    ],
  },
  {
    slug: 'pull-through',
    name: 'Pull-through na polia',
    equipment: 'polia',
    muscle: 'Glúteo máximo',
    source: 'Pull Through',
    cue: 'Ensina o padrão do terra romeno sem carga na coluna.',
    steps: [
      'De costas para a polia baixa, corda entre as pernas, dois passos à frente.',
      'Leve o quadril para trás deixando a corda descer, tronco quase paralelo ao chão.',
      'Estenda o quadril à frente apertando o glúteo, sem puxar com o braço.',
    ],
  },
  {
    slug: 'extensao-45-gluteo',
    name: 'Extensão 45° foco glúteo',
    equipment: 'máquina',
    muscle: 'Glúteo máximo',
    source: 'Hyperextensions (Back Extensions)',
    cue: 'Passar do alinhamento do quadril tira o glúteo e joga o esforço na lombar.',
    steps: [
      'Apoio na coxa, abaixo do osso do quadril, pés abertos e virados para fora.',
      'Desça até sentir o posterior, com a coluna arredondada de propósito e o queixo baixo.',
      'Suba só até o tronco alinhar com a perna, sem passar disso.',
    ],
  },
  {
    slug: 'cadeira-flexora-sentada',
    name: 'Cadeira flexora sentada',
    equipment: 'máquina',
    muscle: 'Posterior de coxa',
    source: 'Seated Leg Curl',
    cue: 'Sentada alonga mais que deitada. Dois segundos na volta.',
    steps: [
      'Encoste bem o quadril e trave o apoio da coxa antes de começar.',
      'Dobre o joelho até o fim do curso, sem tirar a coxa do apoio.',
      'Volte em dois segundos, controlando até o joelho quase estender.',
    ],
  },
  {
    slug: 'coice-polia',
    name: 'Coice na polia',
    equipment: 'polia',
    muscle: 'Glúteo máximo',
    source: 'One-Legged Cable Kickback',
    cue: 'Se a lombar arqueia para a perna subir mais, a amplitude útil já acabou.',
    steps: [
      'Tornozeleira no pé, tronco inclinado à frente segurando o apoio.',
      'Leve a perna para trás com o joelho quase estendido, parando na linha do tronco.',
      'Um segundo de aperto e volta controlada, sem arquear a lombar.',
    ],
  },
  {
    slug: 'coice-maquina',
    name: 'Coice na máquina',
    equipment: 'máquina',
    muscle: 'Glúteo máximo',
    source: null, // O acervo só tem o coice no solo, sem carga.
    cue: 'Se a lombar arqueia para a perna subir mais, a amplitude útil já acabou.',
    steps: [
      'Apoie o tronco no encosto e alinhe o joelho com o eixo da máquina.',
      'Empurre a plataforma para trás até estender o quadril.',
      'Um segundo de aperto e volta em dois segundos.',
    ],
  },
  {
    slug: 'abducao-polia',
    name: 'Abdução em pé na polia',
    equipment: 'polia',
    muscle: 'Glúteo médio',
    source: null, // O acervo só tem a cadeira abdutora, que é outro exercício.
    cue: 'Três segundos na volta. Só sobe carga quando fechar 20 repetições.',
    steps: [
      'Tornozeleira na perna de fora, de lado para a polia, mão no apoio.',
      'Abra a perna para o lado sem girar o quadril nem inclinar o tronco.',
      'Volte em três segundos, resistindo à polia até o pé quase tocar o chão.',
    ],
  },
  {
    slug: 'cadeira-abdutora',
    name: 'Cadeira abdutora',
    equipment: 'máquina',
    muscle: 'Glúteo médio',
    source: 'Thigh Abductor',
    cue: 'Tronco inclinado uns 30° à frente: é o que leva o estímulo para o glúteo médio.',
    steps: [
      'Sente e incline o tronco uns 30° à frente, apoiando as mãos nos joelhos.',
      'Abra até o fim do curso sem jogar o tronco para trás.',
      'Volte em dois segundos, sem deixar as placas baterem.',
    ],
  },

  // ---------------------------------------------------------------------------
  // Quadríceps
  // ---------------------------------------------------------------------------
  {
    slug: 'goblet-squat',
    name: 'Goblet squat',
    equipment: 'halteres',
    muscle: 'Quadríceps',
    source: 'Goblet Squat',
    cue: 'Profundidade completa, joelhos na linha dos pés.',
    steps: [
      'Halter na vertical junto ao peito, cotovelos por dentro dos joelhos.',
      'Desça entre os calcanhares até a coxa passar da paralela.',
      'Suba empurrando o chão, mantendo o peito alto.',
    ],
  },
  {
    slug: 'agachamento-livre',
    name: 'Agachamento livre',
    equipment: 'barra',
    muscle: 'Quadríceps',
    source: 'Barbell Squat',
    cue: 'Profundidade completa. Nunca até a falha.',
    steps: [
      'Barra apoiada no trapézio, pés na largura dos ombros e levemente abertos.',
      'Desça com o quadril e o joelho juntos, joelho seguindo a linha do pé.',
      'Suba sem deixar o quadril subir antes do peito.',
    ],
  },
  {
    slug: 'hack-squat',
    name: 'Agachamento hack',
    equipment: 'máquina',
    muscle: 'Quadríceps',
    source: 'Hack Squat',
    cue: 'Descolar a lombar do encosto no fundo é o que machuca neste aparelho.',
    steps: [
      'Pés na metade da plataforma, na largura dos ombros.',
      'Desça até a coxa passar da paralela, lombar colada no encosto.',
      'Suba sem travar o joelho no topo.',
    ],
  },
  {
    slug: 'leg-press-45',
    name: 'Leg press 45°',
    equipment: 'máquina',
    muscle: 'Quadríceps',
    source: 'Leg Press',
    cue: 'Pés na altura média, sem tirar a lombar do encosto.',
    steps: [
      'Pés na altura média da plataforma, na largura dos ombros.',
      'Desça até o joelho chegar perto do peito, sem descolar o quadril do banco.',
      'Empurre pelo meio do pé, sem travar o joelho.',
    ],
  },
  {
    slug: 'cadeira-extensora',
    name: 'Cadeira extensora',
    equipment: 'máquina',
    muscle: 'Quadríceps',
    source: 'Leg Extensions',
    cue: 'A carga certa é a que deixa segurar um segundo no topo sem tremer.',
    steps: [
      'Ajuste o encosto para o joelho ficar na linha do eixo da máquina.',
      'Estenda até o fim e segure um segundo no topo.',
      'Desça em dois segundos, sem deixar as placas baterem.',
    ],
  },
  {
    slug: 'bulgaro',
    name: 'Agachamento búlgaro',
    equipment: 'halteres',
    muscle: 'Quadríceps',
    source: null, // O acervo tem afundo, não búlgaro: no búlgaro o pé de trás fica elevado.
    cue: 'Tronco 15 a 20° à frente para levar mais carga ao glúteo.',
    steps: [
      'Peito do pé de trás no banco, pé da frente a um passo largo à frente.',
      'Desça na vertical até o joelho de trás quase tocar o chão.',
      'Suba empurrando pelo calcanhar da frente, tronco levemente inclinado.',
    ],
  },
  {
    slug: 'step-up',
    name: 'Step-up alto',
    equipment: 'halteres',
    muscle: 'Glúteo máximo',
    source: 'Dumbbell Step Ups',
    cue: 'Se o pé de baixo dá impulso, a perna de cima parou de trabalhar.',
    steps: [
      'Banco na altura em que a coxa fica paralela ao chão ao subir o pé.',
      'Suba empurrando só pelo calcanhar da perna de cima.',
      'Desça devagar, encostando a ponta do pé de trás sem apoiar o peso.',
    ],
  },

  // ---------------------------------------------------------------------------
  // Panturrilha
  // ---------------------------------------------------------------------------
  {
    slug: 'panturrilha-em-pe',
    name: 'Panturrilha em pé',
    equipment: 'máquina',
    muscle: 'Panturrilha',
    source: 'Standing Calf Raises',
    cue: 'Sem pique. A repetição que conta é a que passa pela posição alongada.',
    steps: [
      'Ponta do pé na plataforma, calcanhar livre, joelho estendido.',
      'Desça o calcanhar até alongar e segure um segundo embaixo.',
      'Suba até a ponta do pé, sem dobrar o joelho.',
    ],
  },
  {
    slug: 'panturrilha-sentada',
    name: 'Panturrilha sentada',
    equipment: 'máquina',
    muscle: 'Panturrilha',
    source: 'Seated Calf Raise',
    cue: 'Sem pique. A repetição que conta é a que passa pela posição alongada.',
    steps: [
      'Apoio sobre a coxa, perto do joelho, ponta do pé na plataforma.',
      'Desça o calcanhar até o fim e segure um segundo.',
      'Suba com força até a ponta do pé.',
    ],
  },

  // ---------------------------------------------------------------------------
  // Costas
  // ---------------------------------------------------------------------------
  {
    slug: 'remada-curvada-halteres',
    name: 'Remada curvada com halteres',
    equipment: 'halteres',
    muscle: 'Costas',
    source: 'Bent Over Two-Dumbbell Row',
    cue: 'Puxe para o quadril com as escápulas retraídas. Um segundo no final.',
    steps: [
      'Quadril para trás até o tronco ficar quase paralelo, coluna neutra.',
      'Puxe os halteres para o quadril, cotovelo junto ao corpo.',
      'Um segundo apertando a escápula e desça controlando.',
    ],
  },
  {
    slug: 'remada-baixa-sentada',
    name: 'Remada baixa sentada',
    equipment: 'polia',
    muscle: 'Costas',
    source: 'Seated Cable Rows',
    cue: 'Pegada neutra, escápulas retraídas.',
    steps: [
      'Sentada, peito alto, joelho levemente dobrado.',
      'Puxe o triângulo para o abdômen sem jogar o tronco para trás.',
      'Volte deixando a escápula abrir no fim, sem soltar o peso.',
    ],
  },
  {
    slug: 'serrote',
    name: 'Serrote com halter',
    equipment: 'halteres',
    muscle: 'Costas',
    source: 'One-Arm Dumbbell Row',
    cue: 'Cotovelo aberto tira as costas e entrega o movimento para o ombro.',
    steps: [
      'Mão e joelho no banco, coluna paralela ao chão.',
      'Puxe o halter para o quadril com o cotovelo colado no corpo.',
      'Desça até o braço estender, sem girar o tronco.',
    ],
  },
  {
    slug: 'remada-unilateral-maquina',
    name: 'Remada unilateral na máquina',
    equipment: 'máquina',
    muscle: 'Costas',
    source: 'Leverage Iso Row',
    cue: 'Cotovelo aberto tira as costas e entrega o movimento para o ombro.',
    steps: [
      'Peito no apoio, ajuste o banco para a pegada ficar na altura do abdômen.',
      'Puxe um braço por vez, cotovelo junto ao corpo.',
      'Volte deixando a escápula abrir, sem girar o tronco.',
    ],
  },

  // ---------------------------------------------------------------------------
  // Peito
  // ---------------------------------------------------------------------------
  {
    slug: 'supino-halteres',
    name: 'Supino com halteres',
    equipment: 'halteres',
    muscle: 'Peito',
    source: 'Dumbbell Bench Press',
    cue: 'Escápula solta no banco é o que vira dor no ombro depois.',
    steps: [
      'Escápulas retraídas no banco, pés firmes no chão.',
      'Desça os halteres até a altura do peito, cotovelos a uns 45°.',
      'Empurre até quase estender, sem bater os halteres.',
    ],
  },
  {
    slug: 'supino-maquina',
    name: 'Supino na máquina',
    equipment: 'máquina',
    muscle: 'Peito',
    source: 'Leverage Chest Press',
    cue: 'Escápulas retraídas.',
    steps: [
      'Ajuste o banco para a pegada ficar na altura do meio do peito.',
      'Empurre até quase estender, sem tirar a escápula do encosto.',
      'Volte em dois segundos até sentir o peito alongar.',
    ],
  },
  {
    slug: 'supino-inclinado-halteres',
    name: 'Supino inclinado com halteres',
    equipment: 'halteres',
    muscle: 'Peito',
    source: 'Incline Dumbbell Press',
    cue: 'Acima de 30° o exercício vira desenvolvimento de ombro.',
    steps: [
      'Banco a 30°, escápulas retraídas, pés firmes.',
      'Desça até a altura da clavícula, cotovelos a uns 45°.',
      'Empurre sem travar o cotovelo no topo.',
    ],
  },
  {
    slug: 'supino-inclinado-maquina',
    name: 'Supino inclinado na máquina',
    equipment: 'máquina',
    muscle: 'Peito',
    source: 'Leverage Incline Chest Press',
    cue: 'Ajuste o banco antes: pegada alta demais joga tudo no ombro.',
    steps: [
      'Ajuste o banco para a pegada ficar na altura da parte alta do peito.',
      'Empurre até quase estender, escápula colada no encosto.',
      'Volte em dois segundos.',
    ],
  },

  // ---------------------------------------------------------------------------
  // Ombro
  // ---------------------------------------------------------------------------
  {
    slug: 'face-pull',
    name: 'Face pull na polia',
    equipment: 'polia',
    muscle: 'Deltoide posterior',
    source: 'Face Pull',
    cue: 'Corda na altura do rosto, cotovelos altos, rotação externa no final.',
    steps: [
      'Corda na polia alta, na altura do rosto, um passo para trás.',
      'Puxe separando as pontas da corda, com o cotovelo acima da linha do punho.',
      'Termine com as mãos ao lado da cabeça e volte controlando.',
    ],
  },
  {
    slug: 'desenvolvimento-halteres',
    name: 'Desenvolvimento com halteres',
    equipment: 'halteres',
    muscle: 'Ombro',
    source: 'Dumbbell Shoulder Press',
    cue: 'Glúteo contraído, costela fechada.',
    steps: [
      'Sentada com encosto, halteres na altura da orelha, cotovelo à frente.',
      'Empurre para cima sem jogar a costela para a frente.',
      'Desça até a altura da orelha, controlando.',
    ],
  },
  {
    slug: 'desenvolvimento-maquina',
    name: 'Desenvolvimento na máquina',
    equipment: 'máquina',
    muscle: 'Ombro',
    source: 'Leverage Shoulder Press',
    cue: 'Costela fechada.',
    steps: [
      'Ajuste o banco para a pegada ficar na altura do ombro.',
      'Empurre para cima sem travar o cotovelo.',
      'Desça até o cotovelo passar um pouco da linha do ombro.',
    ],
  },
  {
    slug: 'crucifixo-inverso',
    name: 'Crucifixo inverso',
    equipment: 'halteres',
    muscle: 'Deltoide posterior',
    source: 'Seated Bent-Over Rear Delt Raise',
    cue: 'Dois segundos na volta. É postura, não volume.',
    steps: [
      'Sentada na ponta do banco, tronco sobre a coxa, halteres embaixo.',
      'Abra os braços para o lado com o cotovelo levemente dobrado.',
      'Pare na linha do ombro e volte em dois segundos.',
    ],
  },
  {
    slug: 'crucifixo-inverso-maquina',
    name: 'Crucifixo inverso na máquina',
    equipment: 'máquina',
    muscle: 'Deltoide posterior',
    source: null, // O acervo só tem a versão na polia, que é outro aparelho.
    cue: 'É postura, não volume. Carga leve o bastante para não puxar com o trapézio.',
    steps: [
      'Peito no apoio, pegada na altura do ombro.',
      'Abra para trás até a linha do ombro, sem encolher o pescoço.',
      'Volte em dois segundos, sem deixar as placas baterem.',
    ],
  },
  {
    slug: 'elevacao-lateral',
    name: 'Elevação lateral',
    equipment: 'halteres',
    muscle: 'Deltoide lateral',
    source: 'Side Lateral Raise',
    cue: 'Dose de manutenção, de propósito. Não precisa crescer aqui.',
    steps: [
      'Em pé, halteres ao lado do corpo, cotovelo levemente dobrado.',
      'Suba pelo lado até a altura do ombro, sem encolher o trapézio.',
      'Desça em dois segundos.',
    ],
  },

  // ---------------------------------------------------------------------------
  // Braço
  // ---------------------------------------------------------------------------
  {
    slug: 'triceps-polia',
    name: 'Tríceps na polia',
    equipment: 'polia',
    muscle: 'Tríceps',
    source: 'Triceps Pushdown',
    cue: 'Cotovelo que sai do lugar transforma o exercício em remada.',
    steps: [
      'Barra na polia alta, cotovelo colado ao lado do corpo.',
      'Estenda até o fim sem mover o cotovelo do lugar.',
      'Volte até o antebraço passar da paralela.',
    ],
  },
  {
    slug: 'triceps-testa',
    name: 'Tríceps testa',
    equipment: 'halteres',
    muscle: 'Tríceps',
    source: 'EZ-Bar Skullcrusher',
    cue: 'Cotovelo abrindo para os lados tira o tríceps do movimento.',
    steps: [
      'Deitada no banco, braços na vertical, cotovelo apontado para o teto.',
      'Dobre só o cotovelo, levando o peso até perto da testa.',
      'Estenda sem deixar o cotovelo abrir para os lados.',
    ],
  },
  {
    slug: 'rosca-halteres',
    name: 'Rosca com halteres',
    equipment: 'halteres',
    muscle: 'Bíceps',
    source: 'Dumbbell Bicep Curl',
    cue: 'Sem balanço de tronco.',
    steps: [
      'Em pé, halteres ao lado do corpo, palma para a frente.',
      'Suba dobrando só o cotovelo, sem mover o ombro.',
      'Desça até estender o braço, em dois segundos.',
    ],
  },
  {
    slug: 'rosca-alternada',
    name: 'Rosca alternada',
    equipment: 'halteres',
    muscle: 'Bíceps',
    source: 'Dumbbell Alternate Bicep Curl',
    cue: 'Sem balanço de tronco.',
    steps: [
      'Em pé, um halter de cada lado, palma para a frente.',
      'Suba um braço por vez, mantendo o outro estendido.',
      'Desça controlando antes de começar o outro lado.',
    ],
  },
  {
    slug: 'rosca-maquina',
    name: 'Rosca na máquina',
    equipment: 'máquina',
    muscle: 'Bíceps',
    source: 'Machine Preacher Curls',
    cue: 'Descolar o braço do apoio é o jeito de tirar o bíceps e usar o ombro.',
    steps: [
      'Ajuste o banco para a axila encostar no alto do apoio.',
      'Suba dobrando o cotovelo, sem descolar o braço do apoio.',
      'Desça até quase estender, em dois segundos.',
    ],
  },

  // ---------------------------------------------------------------------------
  // Core
  // ---------------------------------------------------------------------------
  {
    slug: 'abdominal-solo',
    name: 'Abdominal no solo',
    equipment: 'peso do corpo',
    muscle: 'Core',
    source: 'Crunches',
    cue: 'Sem puxar o pescoço com as mãos.',
    steps: [
      'Deitada, joelho dobrado, mãos cruzadas no peito.',
      'Enrole a coluna tirando só a escápula do chão.',
      'Desça devagar até a escápula encostar.',
    ],
  },
  {
    slug: 'abdominal-maquina',
    name: 'Abdominal na máquina',
    equipment: 'máquina',
    muscle: 'Core',
    source: 'Ab Crunch Machine',
    cue: 'Movimento vem da coluna, não do quadril.',
    steps: [
      'Ajuste o apoio para ficar na altura do peito.',
      'Enrole a coluna à frente, sem puxar com o braço.',
      'Volte em dois segundos, sem deixar as placas baterem.',
    ],
  },
  {
    slug: 'prancha',
    name: 'Prancha',
    equipment: 'peso do corpo',
    muscle: 'Core',
    source: 'Plank',
    cue: 'Glúteo contraído, quadril na linha dos ombros.',
    steps: [
      'Cotovelo embaixo do ombro, antebraço no chão.',
      'Contraia glúteo e abdômen até o corpo virar uma linha reta.',
      'Respire normal e segure o tempo prescrito.',
    ],
  },
  {
    slug: 'dead-bug',
    name: 'Dead bug',
    equipment: 'peso do corpo',
    muscle: 'Core',
    source: 'Dead Bug',
    cue: 'Lombar colada no chão o tempo inteiro.',
    steps: [
      'Deitada, braço apontado para o teto, joelho e quadril a 90°.',
      'Estenda o braço e a perna opostos até quase o chão.',
      'Volte e troque, sem deixar a lombar descolar.',
    ],
  },
]
