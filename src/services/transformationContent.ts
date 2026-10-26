/* ============================================================
   Planly Life Transformation & Catholic Content Engine
   Complete Catholic daily liturgy (Full Gospel text, Saint of the Day,
   detailed 5 Mysteries of the Holy Rosary with contemplation),
   Exercise execution guides with video search,
   Daily high-impact challenges/goals, posture/skincare protocols,
   and 24h curated news & business opportunities.
   ============================================================ */

export interface GospelOfDay {
  reference: string;
  title: string;
  text: string;
  reflection: string;
  verseHighlight: string;
}

export interface RosaryMysteryItem {
  number: number;
  title: string;
  biblicalEvent: string;
  contemplation: string;
  spiritualFruit: string;
}

export interface RosaryDayDetail {
  mysteryName: string;
  days: string;
  intro: string;
  mysteries: RosaryMysteryItem[];
}

export interface CatholicSaintDay {
  name: string;
  feastDate: string;
  title: string;
  history: string;
  virtue: string;
  prayer: string;
  gospel: GospelOfDay;
  rosary: RosaryDayDetail;
  sermonRecommendation: {
    title: string;
    preacher: string;
    description: string;
    duration: string;
    topic: string;
    searchQuery: string;
  };
}

export interface DailyGoalChallenge {
  id: string;
  category: 'espiritual' | 'foco' | 'postura' | 'pele' | 'financeiro' | 'habilidade' | 'energia';
  title: string;
  description: string;
  benefit: string;
  xpPoints: number;
}

export interface ExerciseGuide {
  id: string;
  name: string;
  targetMuscles: string;
  instructions: string[];
  mistakesToAvoid: string[];
  breathingTip: string;
  videoQuery: string;
  defaultSetsReps: string;
}

export interface NewsBrief {
  id: string;
  category: string;
  headline: string;
  summary: string;
  impact: string;
  readTime: string;
  badge: string;
}

export interface DailyScheduleBlock {
  id: string;
  order: number;
  timeRange: string;
  period: 'manha' | 'tarde' | 'noite';
  title: string;
  subtitle: string;
  category: 'espiritual' | 'pele' | 'treino' | 'foco' | 'habilidade' | 'recuperacao' | 'energia';
  priorityBadge: 'Prioridade 1' | 'Prioridade 2' | 'Prioridade 3' | 'Hábito Chave' | 'Manutenção';
  actionItems: string[];
  goldenTip: string;
  whyItMatters: string;
}

export interface GoldenDayTip {
  id: string;
  title: string;
  category: 'pele' | 'energia' | 'foco' | 'postura';
  tip: string;
  quickAction: string;
}

export interface TransformationRoutineStep {
  id: string;
  category: 'posture' | 'skin' | 'strength' | 'mindset';
  title: string;
  subtitle: string;
  instructions: string[];
  duration: string;
  benefit: string;
}

export interface BusinessInvestmentIdea {
  id: string;
  title: string;
  potentialROI: string;
  initialCapital: string;
  description: string;
  actionSteps: string[];
  recommendedBook: {
    title: string;
    author: string;
    keyTakeaway: string;
  };
}

/**
 * Complete collection of Rosary Mysteries with all 5 mysteries explained
 */
export const allRosaryMysteries: Record<string, RosaryDayDetail> = {
  dolorosos: {
    mysteryName: 'Mistérios Dolorosos',
    days: 'Terças e Sextas-feiras',
    intro: 'Meditação sobre a Paixão redentora de Nosso Senhor Jesus Cristo e as dores da Virgem Maria.',
    mysteries: [
      {
        number: 1,
        title: '1º Mistério: A Agonia de Jesus no Horto das Oliveiras',
        biblicalEvent: 'No Getsêmani, Jesus suou sangue diante do peso dos nossos pecados e rezou: "Pai, se queres, afasta de mim este cálice; contudo, não seja feita a minha vontade, mas a tua".',
        contemplation: 'Medite sobre a conformidade de Jesus à vontade do Pai diante da dor extrema.',
        spiritualFruit: 'Fruto: A dor pelos nossos pecados e a aceitação da vontade de Deus.',
      },
      {
        number: 2,
        title: '2º Mistério: A Flagelação de Nosso Senhor',
        biblicalEvent: 'Pilatos ordenou que Jesus fosse amarrado à coluna e açoitado cruelmente pelos soldados romanos.',
        contemplation: 'Medite sobre a pureza de Jesus que sofre em Sua carne inocente para expiar os pecados de impureza e desregramento da humanidade.',
        spiritualFruit: 'Fruto: A mortificação dos sentidos e a pureza de corpo e alma.',
      },
      {
        number: 3,
        title: '3º Mistério: A Coroação de Espinhos',
        biblicalEvent: 'Os soldados teceram uma coroa de espinhos pontiagudos, cravaram-na em Sua cabeça, vestiram-No com um manto escarlate e zombaram: "Salve, Rei dos Judeus!".',
        contemplation: 'Medite sobre a paciência de Cristo diante das humilhações, da soberba humana e do escárnio público.',
        spiritualFruit: 'Fruto: A humildade de coração e o desprezo da glória mundana.',
      },
      {
        number: 4,
        title: '4º Mistério: Jesus Carrega a Pesada Cruz até o Calvário',
        biblicalEvent: 'Condenado à morte, Jesus tomou o madeiro da cruz sobre os ombros dilacerados e subiu a colina do Gólgota, caindo por terra três vezes.',
        contemplation: 'Medite sobre o encontro de Jesus com Sua Mãe Santíssima no caminho do Calvário e o auxílio de Simão de Cirene.',
        spiritualFruit: 'Fruto: A paciência nas dificuldades e a coragem para carregar nossa cruz diária.',
      },
      {
        number: 5,
        title: '5º Mistério: A Crucificação e Morte de Jesus na Cruz',
        biblicalEvent: 'Pregado na cruz entre dois ladrões, Jesus perdoou os carrascos, entregou João como filho a Maria, e exclamou: "Tudo está consumado!", inclinando a cabeça e expirando.',
        contemplation: 'Medite sobre o amor supremo do Redentor que deu Sua vida para nos salvar da morte eterna.',
        spiritualFruit: 'Fruto: O amor a Deus, a salvação das almas e o perdão sincero aos inimigos.',
      },
    ],
  },
  gozosos: {
    mysteryName: 'Mistérios Gozosos',
    days: 'Segundas e Sábados',
    intro: 'Meditação sobre a Encarnação do Verbo e a alegre infância de Jesus Cristo.',
    mysteries: [
      {
        number: 1,
        title: '1º Mistério: A Anunciação do Arcanjo Gabriel a Maria',
        biblicalEvent: 'O anjo Gabriel disse a Maria: "Alegra-te, cheia de graça! O Senhor é contigo". Ela respondeu: "Eis aqui a serva do Senhor; faça-se em mim segundo a tua palavra".',
        contemplation: 'Medite sobre o sim corajoso e obediente de Nossa Senhora que trouxe a salvação ao mundo.',
        spiritualFruit: 'Fruto: A virtude da humildade profunda diante de Deus.',
      },
      {
        number: 2,
        title: '2º Mistério: A Visitação de Maria a sua prima Santa Isabel',
        biblicalEvent: 'Maria subiu com pressa a Judeia para servir a idosa Isabel grávida de João Batista, e entoou o cântico do Magnificat.',
        contemplation: 'Medite sobre a caridade ativa que não se fecha em si mesma, mas corre para ajudar quem precisa.',
        spiritualFruit: 'Fruto: A caridade fraterna e a prontidão em servir ao próximo.',
      },
      {
        number: 3,
        title: '3º Mistério: O Nascimento de Jesus na Gruta de Belém',
        biblicalEvent: 'O Rei do Universo nasceu numa humilde manjedoura entre animais, envolto em panos simples, visitado por pastores e anjos.',
        contemplation: 'Medite sobre o desapego das riquezas e a grandeza da simplicidade diante de Deus.',
        spiritualFruit: 'Fruto: O desapego dos bens materiais e o amor aos pobres.',
      },
      {
        number: 4,
        title: '4º Mistério: A Apresentação do Menino Jesus no Templo',
        biblicalEvent: 'Maria e José levaram o Menino a Jerusalém para apresentá-Lo ao Senhor, onde o idoso Simeão profetizou que uma espada transpassaria a alma de Maria.',
        contemplation: 'Medite sobre a obediência e o respeito absoluto às leis e mandamentos divinos.',
        spiritualFruit: 'Fruto: A pureza e o espírito de obediência aos mandamentos.',
      },
      {
        number: 5,
        title: '5º Mistério: O Encontro do Menino Jesus no Templo entre os Doutores',
        biblicalEvent: 'Aos 12 anos, Jesus permaneceu no Templo ouvindo e interrogando os doutores da Lei. Maria O encontrou após três dias de aflição.',
        contemplation: 'Medite sobre a primazia de fazer a vontade do Pai celeste acima de todas as coisas.',
        spiritualFruit: 'Fruto: A busca zelosa pela sabedoria divina e fidelidade à fé.',
      },
    ],
  },
  gloriosos: {
    mysteryName: 'Mistérios Gloriosos',
    days: 'Quartas e Domingos',
    intro: 'Meditação sobre a Ressurreição triunfal de Cristo, a descida do Espírito Santo e a glória do Céu.',
    mysteries: [
      {
        number: 1,
        title: '1º Mistério: A Ressurreição Triunfante de Nosso Senhor',
        biblicalEvent: 'No terceiro dia, o túmulo estava vazio! Jesus venceu a morte e o pecado, aparecendo aos discípulos com o corpo glorioso.',
        contemplation: 'Medite sobre a certeza inabalável de que o bem vence o mal e a vida eterna é a nossa pátria final.',
        spiritualFruit: 'Fruto: A virtude teologal da Fé viva.',
      },
      {
        number: 2,
        title: '2º Mistério: A Ascensão de Jesus ao Céu',
        biblicalEvent: 'Diante dos apóstolos no Monte das Oliveiras, Jesus ergueu as mãos, abençoou-os e subiu aos céus, sentando-Se à direita do Pai.',
        contemplation: 'Medite sobre o nosso destino supremo: não fomos criados apenas para esta terra passageira, mas para a eternidade.',
        spiritualFruit: 'Fruto: A virtude teologal da Esperança e o desejo do Céu.',
      },
      {
        number: 3,
        title: '3º Mistério: A Descida do Espírito Santo em Pentecostes',
        biblicalEvent: 'Estando reunidos no Cenáculo com Maria Santíssima, línguas de fogo pousaram sobre os discípulos, enchendo-os de coragem e dons.',
        contemplation: 'Medite sobre a presença do Espírito Santo em nosso coração guiando nossas palavras e escolhas.',
        spiritualFruit: 'Fruto: A virtude teologal da Caridade e o zelo apostólico.',
      },
      {
        number: 4,
        title: '4º Mistério: A Assunção de Nossa Senhora ao Céu',
        biblicalEvent: 'Ao término de sua vida terrena, a Virgem Imaculada foi elevada em corpo e alma à glória celestial pelos anjos.',
        contemplation: 'Medite sobre a recompensa da pureza e a intercessão materna de Maria por nós.',
        spiritualFruit: 'Fruto: A graça de uma santa morte e a devoção a Maria.',
      },
      {
        number: 5,
        title: '5º Mistério: A Coroação de Maria Santíssima como Rainha do Céu e da Terra',
        biblicalEvent: 'A Santíssima Trindade coroa a Virgem Maria acima de todos os anjos e santos como nossa Mãe e Rainha.',
        contemplation: 'Medite sobre o poder da oração confiante dirigida à nossa Mãe e Rainha.',
        spiritualFruit: 'Fruto: A perseverança final e a confiança filial na Mãe de Deus.',
      },
    ],
  },
  luminosos: {
    mysteryName: 'Mistérios Luminosos',
    days: 'Quintas-feiras',
    intro: 'Meditação sobre a vida pública e os ensinamentos luminosos de Jesus Cristo.',
    mysteries: [
      {
        number: 1,
        title: '1º Mistério: O Batismo de Jesus no Rio Jordão',
        biblicalEvent: 'São João Batista batizou Jesus; os céus se abriram, o Espírito Santo desceu como pomba e o Pai proclamou: "Este é meu Filho amado".',
        contemplation: 'Medite sobre a dignidade do nosso próprio batismo e a vocação à santidade.',
        spiritualFruit: 'Fruto: A fidelidade às promessas batismais.',
      },
      {
        number: 2,
        title: '2º Mistério: A Auto-revelação nas Bodas de Caná',
        biblicalEvent: 'Por intercessão de Maria — "Fazei tudo o que Ele vos disser" — Jesus transformou água em vinho fino, realizando Seu primeiro milagre.',
        contemplation: 'Medite sobre a obediência cega às instruções de Cristo.',
        spiritualFruit: 'Fruto: A fé nos milagres de Cristo e a confiança em Nossa Senhora.',
      },
      {
        number: 3,
        title: '3º Mistério: O Anúncio do Reino de Deus e o Convite à Conversão',
        biblicalEvent: 'Jesus percorreu aldeias curando e pregando: "O tempo se cumpriu e o Reino de Deus está próximo. Arrependei-vos e crede no Evangelho".',
        contemplation: 'Medite sobre a urgência de abandonar o pecado e buscar a confissão sacramental.',
        spiritualFruit: 'Fruto: O arrependimento sincero e o Sacramento da Reconciliação.',
      },
      {
        number: 4,
        title: '4º Mistério: A Transfiguração no Monte Tabor',
        biblicalEvent: 'Jesus subiu ao monte com Pedro, Tiago e João e Seu rosto brilhou como o sol e Suas vestes ficaram brancas como a luz.',
        contemplation: 'Medite sobre a beleza da oração íntima e o vislumbre da glória eterna.',
        spiritualFruit: 'Fruto: O espírito de recolhimento, adoração e oração profunda.',
      },
      {
        number: 5,
        title: '5º Mistério: A Instituição da Santíssima Eucaristia',
        biblicalEvent: 'Na Última Ceia, Jesus tomou o pão e o vinho: "Isto é o meu Corpo; este é o cálice do meu Sangue. Fazei isto em memória de mim".',
        contemplation: 'Medite sobre o dom inestimável da Santa Missa e a presença real de Jesus na hóstia consagrada.',
        spiritualFruit: 'Fruto: O amor apaixonado pela Eucaristia e a comunhão frequente.',
      },
    ],
  },
};

/**
 * Returns today's Catholic context: Saint, Full Gospel text & daily Rosary mysteries
 */
export function getDailyCatholicContext(date: Date = new Date()): CatholicSaintDay {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const dayOfWeek = date.getDay(); // 0 Dom, 1 Seg, 2 Ter, 3 Qua, 4 Qui, 5 Sex, 6 Sab

  // Select matching Rosary mysteries
  let currentRosary: RosaryDayDetail;
  if (dayOfWeek === 2 || dayOfWeek === 5) {
    currentRosary = allRosaryMysteries.dolorosos;
  } else if (dayOfWeek === 1 || dayOfWeek === 6) {
    currentRosary = allRosaryMysteries.gozosos;
  } else if (dayOfWeek === 4) {
    currentRosary = allRosaryMysteries.luminosos;
  } else {
    currentRosary = allRosaryMysteries.gloriosos;
  }

  // ── Saints Rotation by day of week ──
  const saintsByDayOfWeek: Record<number, Omit<CatholicSaintDay, 'gospel' | 'rosary'>> = {
    0: { // Domingo
      name: 'Santíssima Trindade — Dia do Senhor',
      feastDate: 'Todo Domingo',
      title: 'Celebração da Ressurreição de Cristo',
      history: 'O domingo é o dia principal de celebração para os cristãos, pois nele Jesus Cristo ressuscitou dos mortos. Desde os primórdios da Igreja, os fiéis se reúnem para a Santa Missa dominical, que é obrigatória para todo católico que não esteja impedido por grave motivo. É o dia de descanso sagrado, dedicado a Deus, à família e à caridade.',
      virtue: 'Piedade, descanso em Deus e alegria pascal',
      prayer: 'Senhor Jesus Cristo, que ressuscitastes glorioso no terceiro dia, concedei-nos celebrar com fervor este dia santo, participando dignamente da Santa Missa e renovando nosso compromisso batismal de viver como filhos da luz. Amém.',
      sermonRecommendation: {
        title: 'A Importância da Missa Dominical e a Presença Real de Cristo',
        preacher: 'Padre Paulo Ricardo',
        description: 'Entenda por que a Santa Missa é o ato de adoração mais perfeito e como a presença real de Jesus na Eucaristia transforma a nossa semana inteira.',
        duration: '32 min',
        topic: 'Eucaristia & Domingo',
        searchQuery: 'Padre Paulo Ricardo importância missa dominical presença real eucaristia',
      },
    },
    1: { // Segunda
      name: 'São José Operário',
      feastDate: '1º de Maio (memória)',
      title: 'Padroeiro dos Trabalhadores e Pai Adotivo de Jesus',
      history: 'São José, o carpinteiro de Nazaré, é o modelo supremo de pai, trabalhador e homem de fé silenciosa. Protegeu Jesus e Maria com seu trabalho árduo e humilde, sem jamais uma palavra de queixa registrada nos Evangelhos. É padroeiro da Igreja Universal e dos trabalhadores.',
      virtue: 'Trabalho honrado, paternidade responsável e silêncio contemplativo',
      prayer: 'Glorioso São José, esposo puríssimo de Maria e pai adotivo de Jesus, protegei meu trabalho nesta semana. Dai-me a graça de santificar cada tarefa pelo amor, de ser justo nos negócios e generoso com os mais necessitados. Amém.',
      sermonRecommendation: {
        title: 'São José: O Homem Justo e o Poder do Silêncio',
        preacher: 'Padre Fábio de Melo',
        description: 'Uma reflexão sobre como a figura de São José nos ensina a ser homens e mulheres de ação silenciosa, obedientes à vontade de Deus mesmo quando não compreendemos Seus planos.',
        duration: '28 min',
        topic: 'Vocação & Trabalho',
        searchQuery: 'Padre Fábio de Melo São José silêncio homem justo vocação',
      },
    },
    2: { // Terça
      name: 'São Miguel Arcanjo',
      feastDate: '29 de Setembro',
      title: 'Príncipe dos Exércitos Celestiais e Protetor da Igreja',
      history: 'São Miguel Arcanjo é o grande guerreiro celeste que derrotou Lúcifer e seus anjos rebeldes. Seu nome significa "Quem é como Deus?" — grito de combate contra o orgulho diabólico. É invocado contra as ciladas e tentações do demônio, protetor dos soldados, policiais e de todos que enfrentam o mal.',
      virtue: 'Coragem espiritual, combate ao pecado e fidelidade absoluta a Deus',
      prayer: 'São Miguel Arcanjo, defendei-nos no combate, sede nosso refúgio contra a maldade e as ciladas do demônio. Ordene-lhe Deus, instantemente o pedimos, e vós, príncipe da milícia celeste, pelo divino poder, precipitai no inferno a Satanás e a todos os espíritos malignos que vagueiam pelo mundo para a perdição das almas. Amém.',
      sermonRecommendation: {
        title: 'O Combate Espiritual: Armas que Vencem o Inimigo',
        preacher: 'Padre Paulo Ricardo',
        description: 'Como identificar os ataques espirituais no dia a dia e usar as armas da oração, do jejum e dos sacramentos para vencer toda tentação.',
        duration: '34 min',
        topic: 'Combate Espiritual',
        searchQuery: 'Padre Paulo Ricardo combate espiritual São Miguel armas oração jejum',
      },
    },
    3: { // Quarta
      name: 'Santo Antônio de Pádua',
      feastDate: '13 de Junho',
      title: 'Doutor da Igreja e Padroeiro das Coisas Perdidas',
      history: 'Doutor da Igreja, pregador poderosíssimo e taumaturgo (fazedor de milagres) português que se tornou franciscano e viveu na Itália. Conhecido pelo dom da eloquência que convertia multidões e pela devoção ao Menino Jesus. Patrono das coisas perdidas e dos pobres.',
      virtue: 'Sabedoria na fé, generosidade com os pobres e poder da pregação',
      prayer: 'Glorioso Santo Antônio, vós que recebestes o Menino Jesus em vossos braços, alcançai-me a graça de encontrar o que está perdido na minha vida: a paz interior, a direção certa, e o fervor da fé. Ajudai-me a ser instrumento de caridade para os necessitados. Amém.',
      sermonRecommendation: {
        title: 'A Vida dos Santos: Como os Santos Enfrentaram os Mesmos Problemas que Nós',
        preacher: 'Padre Reginaldo Manzotti',
        description: 'Descubra como os grandes santos da Igreja enfrentaram depressão, dúvida, tentações e fracassos — e como venceram pela perseverança na oração.',
        duration: '25 min',
        topic: 'Santidade & Perseverança',
        searchQuery: 'Padre Reginaldo Manzotti vida dos santos perseverança santidade',
      },
    },
    4: { // Quinta — Dia da Eucaristia
      name: 'São Tomás de Aquino',
      feastDate: '28 de Janeiro',
      title: 'Doutor Angélico e Padroeiro dos Estudantes',
      history: 'O maior teólogo e filósofo da história da Igreja Católica. Escreveu a Suma Teológica, obra monumental que harmoniza fé e razão. Dominicano humilde que dedicava horas à oração diante do Santíssimo Sacramento antes de cada trabalho intelectual. Padroeiro de todos os estudantes e universidades.',
      virtue: 'Estudo disciplinado, humildade intelectual e adoração eucarística',
      prayer: 'Angélico Doutor São Tomás, vós que iluminastes a Igreja com vossa sabedoria e santidade, concedei-me disciplina nos estudos, clareza de raciocínio e sobretudo a humildade de reconhecer que toda verdade vem de Deus. Ajudai-me a ser estudioso e santo. Amém.',
      sermonRecommendation: {
        title: 'A Adoração Eucarística: O Maior Segredo dos Santos',
        preacher: 'Padre Paulo Ricardo',
        description: 'Entenda por que a Adoração ao Santíssimo Sacramento é a fonte de toda graça e como praticar a visita diária a Jesus Sacramentado pode transformar sua vida radicalmente.',
        duration: '30 min',
        topic: 'Eucaristia & Adoração',
        searchQuery: 'Padre Paulo Ricardo adoração eucarística santíssimo sacramento segredo santos',
      },
    },
    5: { // Sexta — Dia da Paixão
      name: 'São Padre Pio de Pietrelcina',
      feastDate: '23 de Setembro',
      title: 'Frade Capuchinho Estigmatizado e Confessor',
      history: 'Padre Pio recebeu os estigmas de Cristo (as chagas da crucificação) em seu corpo e conviveu com eles por 50 anos. Passava até 16 horas por dia no confessionário, tinha o dom de ler as almas e realizar curas milagrosas. Fundou a Casa Alívio do Sofrimento, hospital que atende milhares.',
      virtue: 'Penitência, confissão frequente e amor à Cruz de Cristo',
      prayer: 'São Padre Pio, vós que carregastes as chagas de Cristo em vosso corpo, ensinai-me a abraçar minha cruz diária com amor e paciência. Intercedei por mim para que eu tenha a coragem de me confessar com frequência e a humildade de reconhecer meus pecados. Amém.',
      sermonRecommendation: {
        title: 'A Confissão: O Sacramento Mais Poderoso que Você Está Ignorando',
        preacher: 'Padre Paulo Ricardo',
        description: 'Por que a confissão frequente é o caminho mais rápido para a santidade e como fazer uma boa confissão que realmente transforma a vida.',
        duration: '27 min',
        topic: 'Confissão & Penitência',
        searchQuery: 'Padre Paulo Ricardo confissão sacramento poderoso como se confessar bem',
      },
    },
    6: { // Sábado — Dia de Nossa Senhora
      name: 'Nossa Senhora de Fátima',
      feastDate: '13 de Maio',
      title: 'Mãe de Deus e Rainha do Santo Rosário',
      history: 'Em 1917, a Virgem Maria apareceu a três pastorinhos em Fátima, Portugal, pedindo oração do terço diário, penitência e consagração à Rússia. Revelou os três segredos e prometeu: "Por fim, o meu Imaculado Coração triunfará". O milagre do sol em 13 de outubro de 1917 foi testemunhado por 70 mil pessoas.',
      virtue: 'Devoção mariana, oração do terço diário e reparação pelos pecadores',
      prayer: 'Ó Minha Senhora e Minha Mãe, eu me ofereço todo a Vós. E em prova de minha devoção filial vos consagro neste dia e para sempre meus olhos, meus ouvidos, minha boca, meu coração e todo o meu ser. Já que sou vosso, ó Mãe incomparável, guardai-me e defendei-me como coisa e propriedade vossa. Amém.',
      sermonRecommendation: {
        title: 'A Consagração a Nossa Senhora e o Poder do Santo Terço',
        preacher: 'Padre Reginaldo Manzotti',
        description: 'Entenda o método de consagração mariana de São Luís de Montfort e como o terço diário é a arma mais poderosa contra o mal no mundo moderno.',
        duration: '29 min',
        topic: 'Devoção Mariana & Terço',
        searchQuery: 'Padre Reginaldo Manzotti consagração Nossa Senhora terço poder oração',
      },
    },
  };

  // ── Gospels Rotation by day of week ──
  const gospelsByDayOfWeek: Record<number, GospelOfDay> = {
    0: { // Domingo
      reference: 'Evangelho segundo São João 15, 1-11',
      title: 'A Videira Verdadeira: Permanecer em Cristo para dar fruto',
      text: `Naquele tempo, disse Jesus aos seus discípulos: "Eu sou a videira verdadeira, e meu Pai é o agricultor. Todo ramo que em mim não dá fruto, ele o corta; e todo ramo que dá fruto, ele o limpa, para que dê mais fruto ainda. Vós já estais limpos, por causa da palavra que vos tenho anunciado. Permanecei em mim, e eu permanecerei em vós. Como o ramo não pode dar fruto por si mesmo, se não permanecer na videira, assim também vós, se não permanecerdes em mim. Eu sou a videira; vós, os ramos. Quem permanece em mim e eu nele, esse dá muito fruto; porque sem mim nada podeis fazer. Quem não permanece em mim é lançado fora, como o ramo, e seca; tais ramos são recolhidos, lançados ao fogo e queimados. Se permanecerdes em mim e as minhas palavras permanecerem em vós, pedireis o que quiserdes e vos será concedido. Nisto é glorificado meu Pai: que deis muito fruto e vos torneis meus discípulos. Como o Pai me amou, assim também eu vos amei. Permanecei no meu amor. Se guardardes os meus mandamentos, permanecereis no meu amor, assim como eu guardei os mandamentos de meu Pai e permaneço no seu amor. Disse-vos essas coisas para que a minha alegria esteja em vós e a vossa alegria seja completa".`,
      reflection: 'Jesus nos revela que Ele é a fonte de toda vitalidade espiritual. Sem a conexão com Ele pela oração, sacramentos e mandamentos, secamos como galhos cortados. Permanecer em Cristo significa orar todos os dias, comungar frequentemente e obedecer Seus mandamentos — e o fruto é a alegria plena e verdadeira.',
      verseHighlight: '"Permanecei em mim, e eu permanecerei em vós. Sem mim nada podeis fazer." (Jo 15, 4-5)',
    },
    1: { // Segunda
      reference: 'Evangelho segundo São Mateus 6, 25-34',
      title: 'Não vos preocupeis com o dia de amanhã: Buscai primeiro o Reino',
      text: `Naquele tempo, disse Jesus: "Não vos preocupeis com a vossa vida, com o que haveis de comer ou beber; nem com o vosso corpo, com o que haveis de vestir. Não é a vida mais do que o alimento, e o corpo mais do que o vestuário? Olhai as aves do céu: não semeiam, não colhem nem ajuntam em celeiros; e, contudo, o vosso Pai celeste as alimenta. Ora, não valeis vós muito mais do que elas? Quem de vós, por mais que se preocupe, pode acrescentar um só côvado à duração de sua vida? E por que vos preocupais com o vestuário? Considerai como crescem os lírios do campo: não trabalham nem fiam. Eu vos digo que nem Salomão, em toda a sua glória, se vestiu como um deles. Se Deus veste assim a erva do campo, que hoje existe e amanhã será lançada ao forno, não fará muito mais por vós, homens de pouca fé? Portanto, não vos preocupeis, dizendo: 'Que comeremos? Que beberemos? Com que nos vestiremos?' São os pagãos que buscam todas essas coisas. O vosso Pai celeste sabe que tendes necessidade de todas elas. Buscai, pois, em primeiro lugar, o Reino de Deus e a sua justiça, e todas essas coisas vos serão dadas por acréscimo. Portanto, não vos preocupeis com o dia de amanhã, pois o dia de amanhã terá as suas próprias preocupações. A cada dia basta o seu fardo".`,
      reflection: 'A ansiedade é o pecado silencioso que consome a alma moderna. Jesus nos ensina que a melhor forma de construir o futuro é trabalhar com fidelidade no presente, confiando na providência divina. Busque primeiro o Reino (oração, sacramentos, caridade) e o restante virá como acréscimo.',
      verseHighlight: '"Buscai primeiro o Reino de Deus e a sua justiça, e todas essas coisas vos serão dadas por acréscimo." (Mt 6, 33)',
    },
    2: { // Terça
      reference: 'Evangelho segundo São Lucas 12, 54-59',
      title: 'Discernir os sinais dos tempos e reconciliar-se sem demora',
      text: `Naquele tempo, dizia Jesus ao povo: "Quando vedes uma nuvem levantar-se no poente, logo dizeis: 'Vem chuva'. E assim acontece. E quando sentis soprar o vento do sul, dizeis: 'Vai fazer calor'. E assim acontece. Hipócritas! Sabeis discernir o aspecto da terra e do céu; como é que não sabeis discernir o tempo presente? E por que não julgais por vós mesmos o que é justo? Quando fores com o teu adversário ao magistrado, faze o possível para entrar em acordo com ele pelo caminho, a fim de que ele não te arraste perante o juiz, e o juiz te entregue ao oficial de justiça, e o oficial de justiça te meta na prisão. Digo-te: não sairás dali enquanto não pagares até o último centavo".`,
      reflection: 'Jesus nos exorta a não viver na superficialidade. Sabemos prever o clima, estudar mercados e olhar as redes sociais, mas muitas vezes ignoramos o estado da nossa alma diante de Deus. O Senhor nos pede reconciliação imediata: perdoar quem nos ofendeu, pedir perdão e nos confessar sem adiar.',
      verseHighlight: '"Sabeis discernir o aspecto da terra e do céu; como é que não sabeis discernir o tempo presente?" (Lc 12, 56)',
    },
    3: { // Quarta
      reference: 'Evangelho segundo São Marcos 10, 17-27',
      title: 'O Jovem Rico: O preço da vida eterna e o perigo das riquezas',
      text: `Naquele tempo, quando Jesus saía para se pôr em caminho, veio alguém correndo, ajoelhou-se diante dele e perguntou: "Bom Mestre, que devo fazer para herdar a vida eterna?" Jesus respondeu: "Por que me chamas bom? Ninguém é bom senão um só, que é Deus. Tu conheces os mandamentos: não mates; não cometas adultério; não furtes; não dês falso testemunho; não defraudes ninguém; honra teu pai e tua mãe". Ele respondeu: "Mestre, tudo isso tenho observado desde a minha juventude". Então Jesus olhou para ele com amor e disse: "Só uma coisa te falta: vai, vende tudo o que tens e dá aos pobres e terás um tesouro no céu. Depois vem e segue-me". Ao ouvir isso, ele ficou abatido e foi embora triste, pois tinha muitos bens. Jesus, olhando em redor, disse a seus discípulos: "Como é difícil para os que têm riquezas entrar no Reino de Deus!" Os discípulos ficaram admirados com essas palavras. Jesus insistiu: "Filhos, como é difícil entrar no Reino de Deus! É mais fácil um camelo passar pelo buraco de uma agulha do que um rico entrar no Reino de Deus". Eles ficaram muito espantados e perguntavam-se uns aos outros: "Então, quem pode salvar-se?" Jesus olhou para eles e disse: "Para os homens é impossível, mas não para Deus. Porque para Deus tudo é possível".`,
      reflection: 'Jesus não condena a riqueza em si, mas o apego que escraviza o coração. O jovem era obediente aos mandamentos, mas não estava disposto a abrir mão do controle. Deus nos pede desapego interior: usar os bens como instrumentos de caridade, não como ídolos. A generosidade liberta a alma e gera tesouros eternos.',
      verseHighlight: '"Só uma coisa te falta: vai, vende tudo o que tens e dá aos pobres e terás um tesouro no céu." (Mc 10, 21)',
    },
    4: { // Quinta
      reference: 'Evangelho segundo São João 6, 51-58',
      title: 'O Pão da Vida: A Eucaristia como alimento da alma',
      text: `Naquele tempo, disse Jesus às multidões: "Eu sou o pão vivo que desceu do céu. Quem comer deste pão viverá eternamente. E o pão que eu darei é a minha carne dada pela vida do mundo". Os judeus discutiam entre si, dizendo: "Como pode este homem dar-nos a comer a sua carne?" Jesus disse-lhes: "Em verdade, em verdade vos digo: se não comerdes a carne do Filho do Homem e não beberdes o seu sangue, não tereis a vida em vós. Quem come a minha carne e bebe o meu sangue tem a vida eterna, e eu o ressuscitarei no último dia. Pois a minha carne é verdadeira comida e o meu sangue é verdadeira bebida. Quem come a minha carne e bebe o meu sangue permanece em mim e eu nele. Assim como o Pai, que vive, me enviou e eu vivo pelo Pai, também aquele que comer de mim viverá por mim. Este é o pão que desceu do céu. Não é como o que os vossos pais comeram e morreram. Quem come este pão viverá eternamente".`,
      reflection: 'Jesus é absolutamente claro: a Eucaristia não é um símbolo, é Ele mesmo — Corpo, Sangue, Alma e Divindade. A comunhão frequente (com a alma em estado de graça) é o alimento supremo da vida espiritual. Participar da Missa e comungar com reverência é o ato mais poderoso que podemos fazer em cada dia.',
      verseHighlight: '"Quem come a minha carne e bebe o meu sangue tem a vida eterna, e eu o ressuscitarei no último dia." (Jo 6, 54)',
    },
    5: { // Sexta
      reference: 'Evangelho segundo São Lucas 23, 33-46',
      title: 'A Paixão e Morte de Nosso Senhor: O amor até o fim',
      text: `Quando chegaram ao lugar chamado Calvário, ali o crucificaram, e também os criminosos, um à direita e outro à esquerda. Jesus dizia: "Pai, perdoa-lhes, porque não sabem o que fazem". Repartindo as suas vestes, lançaram sorte. O povo estava ali, olhando. Os chefes, porém, zombavam dele, dizendo: "Salvou os outros, salve-se a si mesmo, se é o Cristo de Deus, o Escolhido!" Os soldados também zombavam dele, oferecendo-lhe vinagre e dizendo: "Se és o Rei dos Judeus, salva-te a ti mesmo!" Um dos criminosos crucificados o insultava: "Não és tu o Cristo? Salva-te a ti mesmo e a nós!" Mas o outro o repreendeu: "Nem sequer temes a Deus, tu que estás na mesma condenação? Para nós, é justo, porque recebemos o castigo que merecemos; mas ele nada fez de mal". E acrescentou: "Jesus, lembra-te de mim quando entrares no teu Reino". Jesus respondeu: "Em verdade te digo: hoje estarás comigo no Paraíso". Era já por volta do meio-dia e houve trevas sobre toda a terra, até as três horas da tarde. O sol escureceu-se e o véu do Templo rasgou-se pelo meio. Então Jesus deu um grande brado: "Pai, nas tuas mãos entrego o meu espírito". E, dizendo isso, expirou.`,
      reflection: 'A sexta-feira nos recorda o preço da nossa salvação. Jesus sofreu por amor a nós quando poderia ter chamado legiões de anjos. O Bom Ladrão nos mostra que nunca é tarde para se converter — basta um ato de fé sincera. Ofereça suas dificuldades de hoje unindo-as à Cruz de Cristo.',
      verseHighlight: '"Pai, perdoa-lhes, porque não sabem o que fazem." (Lc 23, 34)',
    },
    6: { // Sábado
      reference: 'Evangelho segundo São Lucas 1, 46-55',
      title: 'O Magnificat: O Cântico de Maria que Transforma a História',
      text: `Maria disse: "A minha alma engrandece o Senhor, e o meu espírito exulta em Deus, meu Salvador, porque olhou para a humildade de sua serva. Doravante todas as gerações me chamarão bem-aventurada, pois o Todo-Poderoso fez grandes coisas em meu favor. Seu nome é Santo, e sua misericórdia se estende de geração em geração sobre aqueles que o temem. Ele mostrou a força do seu braço: dispersou os orgulhosos de coração. Derrubou os poderosos de seus tronos e exaltou os humildes. Encheu de bens os famintos e despediu os ricos de mãos vazias. Socorreu Israel, seu servo, lembrado de sua misericórdia, conforme prometera a nossos pais, em favor de Abraão e de sua descendência, para sempre".`,
      reflection: 'O Magnificat é o hino revolucionário da humildade. Maria louva a Deus que inverte a lógica do mundo: derruba os soberbos, exalta os humildes, enche de bens os famintos. No sábado, dia de Nossa Senhora, peça a Maria que interceda por você e ensine você a dizer "sim" aos planos de Deus, mesmo quando não compreender tudo.',
      verseHighlight: '"O Todo-Poderoso fez grandes coisas em meu favor. Seu nome é Santo." (Lc 1, 49)',
    },
  };

  // Also allow date-specific gospel overrides (for precise liturgical dates)
  const key = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
  const dateSpecificGospels: Record<string, GospelOfDay> = {
    '25/12': {
      reference: 'Evangelho segundo São João 1, 1-14',
      title: 'Natal do Senhor: O Verbo se fez carne e habitou entre nós',
      text: `No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus. Ele estava no princípio com Deus. Todas as coisas foram feitas por meio dele, e sem ele nada do que foi feito se fez. Nele estava a vida, e a vida era a luz dos homens. A luz brilha nas trevas, e as trevas não a compreenderam. E o Verbo se fez carne e habitou entre nós, e vimos a sua glória, glória como do Unigênito do Pai, cheio de graça e de verdade.`,
      reflection: 'O Natal é o mistério mais comovente da fé: Deus Infinito se fez criança frágil numa manjedoura por amor a nós. Celebre o Natal não com consumismo, mas com adoração, gratidão e caridade com os mais pobres.',
      verseHighlight: '"E o Verbo se fez carne e habitou entre nós." (Jo 1, 14)',
    },
  };

  const todayGospel = dateSpecificGospels[key] || gospelsByDayOfWeek[dayOfWeek] || gospelsByDayOfWeek[0];
  const todaySaint = saintsByDayOfWeek[dayOfWeek] || saintsByDayOfWeek[0];

  return {
    ...todaySaint,
    feastDate: todaySaint.feastDate,
    gospel: todayGospel,
    rosary: currentRosary,
  };
}

/**
 * Exercise execution guide with step-by-step form and direct video search
 */
export const exerciseExecutionGuides: ExerciseGuide[] = [
  {
    id: 'bench-press',
    name: 'Supino Reto com Barra',
    targetMuscles: 'Peitoral Maior, Tríceps Braquial e Deltóide Anterior',
    instructions: [
      '1. Deite no banco mantendo 5 pontos de apoio firmes: cabeça, ombros, glúteos e os dois pés completamente apoiados no chão.',
      '2. Retraia e deprima as escápulas ("trave os ombros para trás e para baixo") para proteger a articulação dos ombros.',
      '3. Pegue a barra um pouco mais largo que a largura dos ombros com pegada firme.',
      '4. Desça a barra de forma controlada (2-3 segundos) até tocar suavemente na linha média/inferior do peito.',
      '5. Empurre a barra com força explosiva sem descolar as escápulas do banco.',
    ],
    mistakesToAvoid: [
      'Abrir os cotovelos em ângulo de 90° com o tronco (mantenha os cotovelos em torno de 45° a 70°).',
      'Tirar os pés do chão ou descolar o glúteo do banco.',
      'Bater a barra no peito usando o impulso das costelas.',
    ],
    breathingTip: 'Puxe o ar (inspire) durante a descida e solte o ar (expire) com força no ponto mais pesado da subida.',
    videoQuery: 'como fazer supino reto execucao correta tutorial',
    defaultSetsReps: '4 séries de 8 a 10 repetições',
  },
  {
    id: 'lat-pulldown',
    name: 'Puxada Alta Frontal no Pulley',
    targetMuscles: 'Grande Dorsal (Costas), Bíceps e Redondo Maior',
    instructions: [
      '1. Ajuste a almofada das pernas para travar firmemente as coxas.',
      '2. Segure a barra pegada pronada (palmas para frente) um pouco além da largura dos ombros.',
      '3. Sente-se ereto, peito estufado, e inicie o movimento puxando as escápulas para baixo antes de dobrar os braços.',
      '4. Puxe a barra em direção à parte superior do peito (clavícula), focando em levar os cotovelos para baixo e para trás.',
      '5. Suba controlando o peso, permitindo que a dorsal alongue completamente no topo.',
    ],
    mistakesToAvoid: [
      'Inclinar o tronco excessivamente para trás usando o peso do corpo.',
      'Puxar a barra atrás da nuca (sobrecarrega a coluna cervical).',
      'Puxar com a força dos antebraços em vez de focar nos cotovelos e costas.',
    ],
    breathingTip: 'Expire ao puxar a barra até o peito e inspire suavemente durante a subida controlada.',
    videoQuery: 'como fazer puxada alta frontal costas execucao correta',
    defaultSetsReps: '4 séries de 10 a 12 repetições',
  },
  {
    id: 'squat',
    name: 'Agachamento Livre com Barra',
    targetMuscles: 'Quadríceps, Glúteos, Posteriores de Coxa e Core',
    instructions: [
      '1. Apoie a barra sobre a musculatura do trapézio (não apoie no osso do pescoço).',
      '2. Pés na largura dos ombros, pontas dos pés levemente apontadas para fora (15° a 30°).',
      '3. Mantenha o peito aberto, abdômen contraído (como se fosse levar um soco) e coluna neutra.',
      '4. Inicie o movimento projetando o quadril para trás e dobrando os joelhos, mantendo o peso no centro dos pés.',
      '5. Desça até pelo menos 90° (coxas paralelas ao chão) e suba empurrando o chão com os calcanhares.',
    ],
    mistakesToAvoid: [
      'Valgo dinâmico: deixar os joelhos caírem para dentro durante a subida (mantenha os joelhos na linha das pontas dos pés).',
      'Curvar a lombar (efeito "butt wink").',
      'Tirar os calcanhares do chão.',
    ],
    breathingTip: 'Puxe o ar fundo antes de descer, segure a pressão no abdômen (manobra de Valsalva) e expire ao finalizar a subida.',
    videoQuery: 'agachamento livre com barra execucao correta postura',
    defaultSetsReps: '4 séries de 8 a 10 repetições',
  },
  {
    id: 'shoulder-press',
    name: 'Desenvolvimento Militar com Halteres',
    targetMuscles: 'Deltóide Anterior e Lateral, Tríceps e Trapézio Superior',
    instructions: [
      '1. Sente-se no banco com encosto em 80° ou 90°, pés bem firmes no chão.',
      '2. Levante os halteres até a altura dos ombros, com as palmas das mãos voltadas para a frente.',
      '3. Empurre os halteres para cima em linha vertical até quase esticar os braços (sem travar bruscamente os cotovelos).',
      '4. Desça os halteres de forma controlada até que fiquem alinhados com a altura das orelhas.',
    ],
    mistakesToAvoid: [
      'Arquear excessivamente a lombar para compensar carga pesada.',
      'Bater os halteres no topo.',
      'Descer muito pouco (faça amplitude completa até a linha do queixo/orelha).',
    ],
    breathingTip: 'Expire durante o movimento de empurrar para cima e inspire na descida controlada.',
    videoQuery: 'desenvolvimento com halteres ombro execucao correta',
    defaultSetsReps: '4 séries de 10 a 12 repetições',
  },
  {
    id: 'lateral-raise',
    name: 'Elevação Lateral com Halteres',
    targetMuscles: 'Deltóide Lateral (ombros largos e formato em V)',
    instructions: [
      '1. Fique em pé ou sentado com coluna ereta e peito aberto.',
      '2. Inicie com os halteres na lateral do corpo, cotovelos levemente flexionados.',
      '3. Eleve os braços lateralmente até a altura dos ombros, focando em liderar o movimento pelos cotovelos e não pelas mãos.',
      '4. Desça de forma controlada em 2 segundos sem deixar o peso despencar.',
    ],
    mistakesToAvoid: [
      'Usar impulso das pernas ou balançar o tronco (trapacear o movimento).',
      'Elevar as mãos mais alto do que os cotovelos.',
      'Encolher os ombros ativando o trapézio em vez do deltóide lateral.',
    ],
    breathingTip: 'Solte o ar na subida e inspire enquanto segura a descida do halter.',
    videoQuery: 'elevacao lateral com halteres execucao correta ombros',
    defaultSetsReps: '4 séries de 12 a 15 repetições',
  },
  {
    id: 'biceps-curl',
    name: 'Rosca Direta com Barra ou Halteres',
    targetMuscles: 'Bíceps Braquial e Braquiorradial',
    instructions: [
      '1. Fique em pé com os pés na largura dos ombros e joelhos levemente destravados.',
      '2. Mantenha os cotovelos colados ao lado das costelas durante todo o trajeto.',
      '3. Flexione os braços levando a barra até o topo do movimento, contraindo forte o bíceps por 1 segundo.',
      '4. Desça o peso controladamente até a extensão quase total dos braços.',
    ],
    mistakesToAvoid: [
      'Jogar os cotovelos para frente no topo do movimento (alivia a tensão do bíceps).',
      'Balançar o tronco para trás no início da subida.',
      'Não descer até o final (fazer meia repetição).',
    ],
    breathingTip: 'Expire ao subir a barra e inspire ao descer.',
    videoQuery: 'rosca direta barra execucao correta biceps',
    defaultSetsReps: '4 séries de 10 a 12 repetições',
  },
  {
    id: 'triceps-pushdown',
    name: 'Tríceps Pulley / Corda',
    targetMuscles: 'Tríceps Braquial (Cabeça Lateral, Medial e Longa)',
    instructions: [
      '1. Posicione-se em frente à polia alta, inclinando o tronco levemente para a frente (10° a 15°).',
      '2. Trave os cotovelos firmemente colados ao lado do corpo.',
      '3. Empurre a corda ou barra para baixo até estender totalmente os braços, abrindo a corda no final.',
      '4. Deixe o antebraço subir até formar um ângulo de 90° com o braço, sentindo o tríceps alongar.',
    ],
    mistakesToAvoid: [
      'Mover os cotovelos para frente e para trás durante as repetições.',
      'Usar o peso do corpo para empurrar o cabo para baixo.',
    ],
    breathingTip: 'Expire ao empurrar o cabo para baixo e inspire ao retornar.',
    videoQuery: 'triceps corda pulley execucao correta',
    defaultSetsReps: '4 séries de 12 repetições',
  },
  {
    id: 'leg-press',
    name: 'Leg Press 45°',
    targetMuscles: 'Quadríceps, Glúteos e Posteriores de Coxa',
    instructions: [
      '1. Apoie totalmente as costas e a lombar no encosto do banco, sem descolar o quadril.',
      '2. Posicione os pés na plataforma na largura dos ombros, pontas ligeiramente voltadas para fora.',
      '3. Destrave a máquina e desça a plataforma controladamente até que as coxas formem pelo menos 90° com as pernas.',
      '4. Empurre a plataforma com os calcanhares e meio do pé até estender, sem travar bruscamente os joelhos no topo.',
    ],
    mistakesToAvoid: [
      'Retropulsão pélvica: deixar a lombar/bunda descolar do banco no ponto mais fundo da descida.',
      'Hiperestender ou travar os joelhos com força no topo (risco sério de lesão articular).',
      'Deixar os joelhos fecharem para dentro durante a subida.',
    ],
    breathingTip: 'Inspire na descida do peso e expire com força ao empurrar a plataforma.',
    videoQuery: 'leg press 45 execucao correta postura joelhos',
    defaultSetsReps: '4 séries de 10 a 12 repetições',
  },
  {
    id: 'deadlift',
    name: 'Levantamento Terra (Deadlift)',
    targetMuscles: 'Posteriores de Coxa, Glúteos, Eretores da Espinha, Trapézio e Antebraço',
    instructions: [
      '1. Posicione os pés na largura do quadril, com a barra sobre o meio dos pés (acima dos cadarços).',
      '2. Dobre os joelhos até alcançar a barra com as mãos na largura dos ombros, mantendo a coluna neutra.',
      '3. Empurre o chão com os pés, estendendo joelhos e quadril simultaneamente, mantendo a barra rente ao corpo.',
      '4. No topo, contraia glúteos e trapézio. Desça controlando, empurrando o quadril para trás primeiro.',
    ],
    mistakesToAvoid: [
      'Arredondar a coluna lombar (a causa nº 1 de lesão no terra).',
      'Afastar a barra do corpo durante a subida.',
      'Hiperestender a lombar no topo jogando o quadril para frente demais.',
    ],
    breathingTip: 'Inspire profundamente antes de iniciar a subida, segure a pressão e expire no topo.',
    videoQuery: 'levantamento terra deadlift execucao correta coluna postura',
    defaultSetsReps: '3 séries de 5 a 8 repetições (foco em força)',
  },
  {
    id: 'pull-up',
    name: 'Barra Fixa (Pull-up)',
    targetMuscles: 'Grande Dorsal, Bíceps, Rombóides e Antebraço',
    instructions: [
      '1. Segure a barra com pegada pronada (palmas para frente) um pouco além da largura dos ombros.',
      '2. Parta da posição morta (braços estendidos), ative as escápulas puxando-as para baixo.',
      '3. Puxe o corpo para cima liderando com o peito (não com o queixo), até o queixo ultrapassar a barra.',
      '4. Desça controladamente em 2-3 segundos até a posição inicial com braços totalmente estendidos.',
    ],
    mistakesToAvoid: [
      'Usar balanço do corpo (kipping) para subir — isso é crossfit, não musculação.',
      'Não descer até a extensão total (meia repetição).',
      'Elevar o queixo para frente forçando o pescoço em vez de subir com o peito.',
    ],
    breathingTip: 'Expire ao puxar o corpo para cima e inspire durante a descida controlada.',
    videoQuery: 'barra fixa pull up como fazer execucao correta costas',
    defaultSetsReps: '4 séries de 6 a 10 repetições',
  },
];

/**
 * Finds an exercise execution guide or builds a targeted dynamic guide with YouTube video search
 */
export function findExerciseGuide(exerciseName: string): ExerciseGuide {
  const normalized = exerciseName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const found = exerciseExecutionGuides.find(guide => {
    const guideNorm = guide.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return guideNorm.includes(normalized) || normalized.includes(guideNorm) ||
      (normalized.includes('supino') && guideNorm.includes('supino')) ||
      (normalized.includes('agacha') && guideNorm.includes('agachamento')) ||
      (normalized.includes('puxada') && guideNorm.includes('puxada')) ||
      (normalized.includes('militar') && guideNorm.includes('militar')) ||
      (normalized.includes('desenvolv') && guideNorm.includes('desenvolvimento')) ||
      (normalized.includes('lateral') && guideNorm.includes('lateral')) ||
      (normalized.includes('rosca') && guideNorm.includes('rosca')) ||
      (normalized.includes('triceps') && guideNorm.includes('triceps')) ||
      (normalized.includes('leg') && guideNorm.includes('leg')) ||
      (normalized.includes('terra') && guideNorm.includes('terra')) ||
      (normalized.includes('deadlift') && guideNorm.includes('deadlift')) ||
      (normalized.includes('barra fixa') && guideNorm.includes('barra fixa')) ||
      (normalized.includes('pull') && guideNorm.includes('pull'));
  });

  if (found) return found;

  return {
    id: `custom-${Date.now()}`,
    name: exerciseName,
    targetMuscles: 'Músculo principal do movimento',
    instructions: [
      '1. Posicionamento Firme: Mantenha a coluna ereta, abdômen ativado e pés ou apoios devidamente travados.',
      '2. Execução Controlada: Realize a fase concêntrica (força máxima) com controle e segure a descida por 2 a 3 segundos.',
      '3. Amplitude Segura: Priorize movimento completo sem compensar peso com a lombar ou articulações.',
    ],
    mistakesToAvoid: [
      'Usar carga exagerada que deforma a postura e sobrecarrega tendões.',
      'Usar embalo ou balançar o corpo para mover a carga.',
    ],
    breathingTip: 'Inspire na fase excêntrica (ao descer) e solte o ar na fase concêntrica de esforço.',
    videoQuery: `como fazer ${exerciseName} execucao correta postura musculacao tutorial`,
    defaultSetsReps: '3 a 4 séries de 10 a 12 repetições',
  };
}

/**
 * Daily High-Impact Growth Challenges (10 Metas Diferentes para o Dia)
 * Rotate based on day to give variety
 */
export function getDailyGoals(date: Date = new Date()): DailyGoalChallenge[] {
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();

  const allGoals: DailyGoalChallenge[] = [
    {
      id: 'goal-spiritual',
      category: 'espiritual',
      title: 'Ato de Caridade Oculta & Oração por um Inimigo',
      description: 'Faça uma boa ação hoje sem que ninguém descubra, e reze 1 Pai-Nosso e 1 Ave-Maria pela pessoa que você tem mais dificuldade de conviver.',
      benefit: 'Destrói o orgulho e purifica as intenções da alma.',
      xpPoints: 50,
    },
    {
      id: 'goal-focus',
      category: 'foco',
      title: 'Bloco Sagrado de Foco Profundo (90 min)',
      description: 'Coloque o celular no modo avião em outro cômodo e trabalhe/estude sem interrupção por 90 minutos em sua tarefa mais difícil.',
      benefit: 'Gera 80% do resultado do seu dia e treina a disciplina de elite.',
      xpPoints: 40,
    },
    {
      id: 'goal-posture',
      category: 'postura',
      title: 'Desafio Postura Inabalável & 100 Flexões/Agachamentos',
      description: 'Ao longo do dia (distribuído em séries de 20), complete 100 repetições de flexão ou agachamento com postura perfeita.',
      benefit: 'Ativa a circulação, melhora o tônus muscular e oxigena o cérebro.',
      xpPoints: 45,
    },
    {
      id: 'goal-finance',
      category: 'financeiro',
      title: 'Dia Zero Desperdício & Aporte Inteligente',
      description: 'Zero gastos supérfluos hoje (nada de lanches de rua ou compras por impulso). Guarde e anote R$ 20 para o seu aporte semanal no Planly.',
      benefit: 'Cria o hábito de poupar antes de gastar e constrói patrimônio real.',
      xpPoints: 35,
    },
    {
      id: 'goal-skill',
      category: 'habilidade',
      title: 'Habilidade Mestre: 20 min de Violão ou Inglês',
      description: 'Dedique 20 minutos focados: aprenda 5 novas palavras em inglês ou pratique o dedilhado Travis Picking no violão.',
      benefit: 'Evolução de 1% ao dia que resulta em maestria no final de 12 meses.',
      xpPoints: 30,
    },
    {
      id: 'goal-gratitude',
      category: 'espiritual',
      title: 'Diário de Gratidão: Escreva 3 Bênçãos',
      description: 'Antes de dormir, escreva 3 coisas pelas quais você é grato hoje. Encerre o dia agradecendo a Deus de coração.',
      benefit: 'Reprograma o cérebro para enxergar o positivo, reduz ansiedade e melhora o sono.',
      xpPoints: 25,
    },
    {
      id: 'goal-cold',
      category: 'postura',
      title: 'Banho Frio de 60 Segundos ao Final do Banho',
      description: 'Nos últimos 60 segundos do banho, vire a água para o frio total. Respire calmamente e mantenha a postura ereta.',
      benefit: 'Aumenta a dopamina em 250%, melhora a circulação e fortalece a disciplina mental.',
      xpPoints: 40,
    },
    {
      id: 'goal-reading',
      category: 'habilidade',
      title: 'Leitura Profunda: 15 Páginas de um Livro Edificante',
      description: 'Leia pelo menos 15 páginas de um livro que melhore sua vida (veja as recomendações no Planly). Anote 1 insight.',
      benefit: 'Ler 15 páginas/dia = 25+ livros por ano. Cada livro é um mentor silencioso.',
      xpPoints: 30,
    },
    {
      id: 'goal-walk',
      category: 'postura',
      title: 'Caminhada de 20 Minutos ao Ar Livre (Sem Celular)',
      description: 'Saia para uma caminhada rápida sem fones e sem celular. Observe a natureza, ore ou simplesmente respire fundo.',
      benefit: 'Reduz cortisol, melhora a criatividade e oferece tempo de reflexão e oração.',
      xpPoints: 25,
    },
    {
      id: 'goal-network',
      category: 'financeiro',
      title: 'Contato de Valor: Mande 1 Mensagem Estratégica',
      description: 'Envie uma mensagem genuína para alguém que você admira profissionalmente — elogie o trabalho dele, ofereça ajuda ou peça um conselho.',
      benefit: 'Networking real gera oportunidades que nenhum currículo ou diploma consegue.',
      xpPoints: 35,
    },
    {
      id: 'goal-skin-morning',
      category: 'pele',
      title: 'Skincare Matinal Blindado (Protetor Solar + Sabonete Neutro)',
      description: 'Lave o rosto com sabonete neutro específico e aplique protetor solar FPS 30+ toque seco, mesmo se for ficar em casa com telas.',
      benefit: 'Previne 90% do envelhecimento precoce, manchas, oleosidade e câncer de pele.',
      xpPoints: 30,
    },
    {
      id: 'goal-hydration-3l',
      category: 'pele',
      title: 'Meta 3 Litros de Água Pura (Pele Limpa & Foco Mental)',
      description: 'Beba 3 litros de água pura distribuídos ao longo do dia (mantenha uma garrafa de 1L sempre à vista e encha 3 vezes).',
      benefit: 'Hidrata a derme de dentro para fora, elimina toxinas e combate cravos e espinhas.',
      xpPoints: 35,
    },
    {
      id: 'goal-skin-habits',
      category: 'pele',
      title: 'Regra de Ouro: Zero Mãos no Rosto & Fronha Limpa',
      description: 'Evite apoiar as mãos no rosto (que transportam bactérias para os poros) e confirme se sua fronha de travesseiro foi trocada esta semana.',
      benefit: 'Reduz espinhas bacterianas e inflamações na pele em até 70%.',
      xpPoints: 25,
    },
    {
      id: 'goal-priority-trio',
      category: 'foco',
      title: 'Regra de Ouro: As 3 Prioridades do Dia (Coma o Sapo Primeiro)',
      description: 'Anote as 3 únicas tarefas essenciais do seu dia e ataque a mais desafiadora logo no primeiro bloco da manhã.',
      benefit: 'Gera 80% do resultado do seu dia e acaba com a fadiga de decisão e a procrastinação.',
      xpPoints: 40,
    },
    {
      id: 'goal-skin-night',
      category: 'pele',
      title: 'Skincare Noturno Reparador (Limpeza + Hidratação Leve)',
      description: 'Antes de dormir, lave o rosto para remover suor e poluição acumulada e aplique hidratante leve com ácido hialurônico ou niacinamida.',
      benefit: 'Potencializa a regeneração celular da derme durante o sono anabólico.',
      xpPoints: 30,
    },
  ];

  // Select 6 goals rotating based on day
  const startIndex = (dayOfWeek + dayOfMonth) % allGoals.length;
  const selected: DailyGoalChallenge[] = [];
  for (let i = 0; i < 6; i++) {
    selected.push(allGoals[(startIndex + i * 2) % allGoals.length]);
  }
  return selected;
}

// Keep the static export for backward compatibility
export const dailyHighImpactGoals = getDailyGoals();

/**
 * 24h Curated News and Major Trends in Brazil & Global Economy
 */
export const curatedNews24h: NewsBrief[] = [
  {
    id: 'news-brazil-selic',
    category: 'Brasil & Economia',
    headline: 'Cenário Macroeconômico no Brasil: Selic e Dólar favorecem aportes em Renda Fixa',
    summary: 'Com a taxa básica de juros (Selic) em patamar atrativo e volatilidade cambial, títulos públicos como Tesouro Selic e Tesouro IPCA+ oferecem juro real robusto. Analistas recomendam manter reserva de emergência 100%+ CDI e compras fracionadas de ativos geradores de renda.',
    impact: 'Acelere sua taxa de poupança no módulo Finanças do Planly para aproveitar o poder dos juros compostos em alta.',
    readTime: '1.5 min',
    badge: 'Brasil & Mercado',
  },
  {
    id: 'news-brazil-business',
    category: 'Negócios & Mercado',
    headline: 'PMEs e Serviços Especializados crescem em ritmo acelerado no Brasil',
    summary: 'Prestadores de serviço de alto valor (consultoria, engenharia, saúde, automação e marketing para negócios locais) lideram abertura de empresas enxutas com margens líquidas superiores a 30%, aproveitando a digitalização do país.',
    impact: 'Desenvolva habilidades práticas de alta demanda para aumentar sua renda ativa ainda este ano.',
    readTime: '2 min',
    badge: 'Tendência Nacional',
  },
  {
    id: 'news-brazil-agro',
    category: 'Agro & Infraestrutura',
    headline: 'Agronegócio e Logística Portuária consolidam superávit da balança comercial',
    summary: 'A força da produção agrícola brasileira aliada a concessões de ferrovias e portos assegura entrada consistente de divisas no país, atraindo fundos de investimento em infraestrutura e sustentabilidade.',
    impact: 'A estabilidade dos setores de base garante fundamentos sólidos para o mercado produtivo nacional.',
    readTime: '1.5 min',
    badge: 'Economia Real',
  },
  {
    id: 'news-brazil-health',
    category: 'Saúde & Longevidade',
    headline: 'A Ciência da Longevidade: Musculação e sono reparador superam remédios',
    summary: 'Pesquisas clínicas recentes comprovam que a sobrecarga progressiva no treino de força e 7 a 8 horas de sono contínuo regulam os níveis de testosterona, diminuem a resistência à insulina e rejuvenescem a pele.',
    impact: 'O treino não é opcional: é o seu principal plano de saúde preventiva e vigor físico.',
    readTime: '1.5 min',
    badge: 'Longevidade',
  },
  {
    id: 'news-brazil-productivity',
    category: 'Produtividade & Foco',
    headline: 'Movimento "Slow Productivity": O fim da multitarefa e o resgate da atenção profunda',
    summary: 'Cada vez mais profissionais brasileiros de alta performance estão eliminando notificações no expediente e trabalhando em 2 a 3 blocos de foco de 90 minutos, gerando o dobro de resultado com menos cansaço mental.',
    impact: 'Use o cronograma de horários sugeridos do Planly para blindar suas manhãs contra redes sociais.',
    readTime: '1.5 min',
    badge: 'Alta Performance',
  },
  {
    id: 'news-brazil-tech',
    category: 'Tecnologia & Inovação',
    headline: 'Inteligência Artificial vira aliada prática na gestão do tempo e finanças no Brasil',
    summary: 'A adoção de assistentes inteligentes para automatizar planilhas, organizar rotinas diárias e analisar dados complexos tornou-se a ferramenta definitiva para quem quer produzir mais sem estresse.',
    impact: 'Utilize o Copilot do Planly para receber diagnósticos do seu dia e insights financeiros em tempo real.',
    readTime: '1 min',
    badge: 'Inovação Prática',
  },
];

/**
 * Complete Daily Schedule Routine Blueprint (O que fazer primeiro & Horários sugeridos)
 */
export const dailyScheduleRoutine: DailyScheduleBlock[] = [
  {
    id: 'block-1',
    order: 1,
    timeRange: '06:00 - 06:30',
    period: 'manha',
    title: 'Despertar Vitorioso & Ativação Biológica',
    subtitle: 'Comece ganhando a primeira batalha do dia: corpo hidratado e relógio circadiano ativado',
    category: 'energia',
    priorityBadge: 'Hábito Chave',
    actionItems: [
      'Beba 500ml de água logo ao levantar (com gotas de limão ou pitada de sal integral).',
      'Exponha os olhos à luz solar natural por 10 a 15 minutos (sem óculos escuros).',
      'Zero redes sociais ou notificações nos primeiros 30 minutos.',
    ],
    goldenTip: 'A luz solar matinal acorda o cérebro, suprime a melatonina e calibra o cortisol saudável para energia o dia todo.',
    whyItMatters: 'Vencer a manhã é vencer o dia. A hidratação restaura o sangue e prepara os órgãos após 8h de jejum hídrico.',
  },
  {
    id: 'block-2',
    order: 2,
    timeRange: '06:30 - 07:15',
    period: 'manha',
    title: 'Oração Matinal, Evangelho do Dia & Definição das 3 Prioridades',
    subtitle: 'Alinhe a alma com Deus antes de qualquer demanda do mundo exterior',
    category: 'espiritual',
    priorityBadge: 'Prioridade 1',
    actionItems: [
      'Ajoelhe-se e faça a Oração da Manhã oferecendo todas as ações do dia a Deus.',
      'Leia o Evangelho do Dia completo e a história do Santo no módulo Meu Dia.',
      'Reze 1 dezena do Santo Terço (ou o terço completo dos mistérios do dia).',
      'Defina em um papel as suas 3 prioridades inegociáveis do dia (regra das 3 prioridades).',
    ],
    goldenTip: 'Quem busca primeiro o Reino de Deus não se desespera com as tribulações do cotidiano.',
    whyItMatters: 'Sem âncora espiritual, o homem é jogado de um lado para o outro pelas opiniões e urgências alheias.',
  },
  {
    id: 'block-3',
    order: 3,
    timeRange: '07:15 - 08:30',
    period: 'manha',
    title: 'Treino de Força & Hipertrofia (Construção do Templo)',
    subtitle: 'Exercício intenso com sobrecarga progressiva e foco em postura inabalável',
    category: 'treino',
    priorityBadge: 'Prioridade 2',
    actionItems: [
      'Aquecimento articular + 5 minutos de correção postural (chin tuck e abertura de peitoral).',
      'Execute os exercícios base com execução perfeita (consulte os vídeos integrados no Planly).',
      'Aplique a sobrecarga progressiva: tente 1 repetição a mais ou carga adicional em relação à semana passada.',
      'Beba 700ml de água durante o treino.',
    ],
    goldenTip: 'Musculação pesada e bem feita é o mais potente tratamento anti-ansiedade e construtor de autoconfiança.',
    whyItMatters: 'O corpo é o templo do Espírito Santo. Ter um corpo forte dá sustentação para a mente e para o espírito servirem aos outros.',
  },
  {
    id: 'block-4',
    order: 4,
    timeRange: '08:30 - 09:00',
    period: 'manha',
    title: 'Banho Restaurador, Skincare Matinal & Nutrição Limpa',
    subtitle: 'Pele protegida, corpo limpo e primeira recarga nutricional proteica',
    category: 'pele',
    priorityBadge: 'Hábito Chave',
    actionItems: [
      'Banho morno (nunca fervendo) com últimos 60 segundos de água fria para ativar a circulação.',
      'Lave o rosto com sabonete facial neutro (sem sabonete corporal em barra).',
      'Aplique hidratante facial leve + protetor solar facial FPS 30+ toque seco.',
      'Refeição pós-treino rica em proteínas (ovos mexidos, aveia, frango ou suplemento).',
    ],
    goldenTip: 'O protetor solar diário é o produto número 1 mais eficaz contra rugas, manchas e flacidez da pele.',
    whyItMatters: 'Cuidar da aparência é respeito próprio e reflete a ordem interior na sua imagem exterior.',
  },
  {
    id: 'block-5',
    order: 5,
    timeRange: '09:00 - 12:30',
    period: 'manha',
    title: 'Bloco Sagrado de Foco Profundo (Coma o Sapo Primeiro)',
    subtitle: 'Ataque frontal à sua tarefa mais importante e complexa do dia',
    category: 'foco',
    priorityBadge: 'Prioridade 1',
    actionItems: [
      'Celular no modo avião em outro cômodo ou gaveta fechada.',
      'Abra apenas as ferramentas necessárias para a tarefa número 1.',
      'Trabalhe em 2 blocos de 90 minutos com 10 minutos de intervalo para esticar as pernas.',
      'Zero checagem de e-mails aleatórios ou redes sociais antes de concluir a prioridade.',
    ],
    goldenTip: 'Se você fizer sua tarefa mais difícil de manhã, o restante do dia parecerá leve e você terá a sensação de vitória garantida.',
    whyItMatters: 'A força de vontade humana é finita e está no pico máximo pela manhã. Não a desperdice com tarefas triviais.',
  },
  {
    id: 'block-6',
    order: 6,
    timeRange: '12:30 - 14:00',
    period: 'tarde',
    title: 'Almoço Nutritivo, Caminhada Digestiva & Finanças',
    subtitle: 'Nutrição anti-inflamatória, clareza mental e controle do dinheiro',
    category: 'recuperacao',
    priorityBadge: 'Manutenção',
    actionItems: [
      'Almoço limpo com 1 fonte de proteína magra + vegetais variados + carboidrato complexo.',
      'Caminhada leve de 10 a 15 minutos ao ar livre para estabilizar a glicose pós-prandial.',
      'Abra o módulo Finanças do Planly e registre qualquer gasto ou entrada da manhã.',
    ],
    goldenTip: 'Caminhar 10 minutos após comer reduz os picos de insulina no sangue em 30% e impede o "sono pesado" das 14h.',
    whyItMatters: 'O corpo digere melhor em movimento suave e o hábito de anotar gastos diários constrói disciplina financeira inabalável.',
  },
  {
    id: 'block-7',
    order: 7,
    timeRange: '14:00 - 17:30',
    period: 'tarde',
    title: 'Bloco 2 de Execução, Reuniões & Habilidades Mestres',
    subtitle: 'Tarefas operacionais, comunicação e 20 minutos de evolução em Violão ou Inglês',
    category: 'habilidade',
    priorityBadge: 'Prioridade 3',
    actionItems: [
      'Responda e-mails, mensagens e pendências de comunicação.',
      'Conclua a 2ª e a 3ª prioridade do seu dia.',
      'Dedique 20 minutos focados no módulo Inglês (novas palavras / músicas) ou Violão (dedilhado e solos).',
      'Mantenha a garrafa de água cheia e beba mais 1 litro durante a tarde.',
    ],
    goldenTip: '20 minutos diários de estudo com consistência superam 3 horas desordenadas no fim de semana.',
    whyItMatters: 'A maestria em idiomas e instrumentos musicais expande a neuroplasticidade e abre portas para oportunidades globais.',
  },
  {
    id: 'block-8',
    order: 8,
    timeRange: '18:30 - 20:30',
    period: 'noite',
    title: 'Descompressão, Conexão Familiar & Jantar Leve',
    subtitle: 'Desligamento do modo trabalho, presença com os seus e desaceleração do sistema nervoso',
    category: 'recuperacao',
    priorityBadge: 'Hábito Chave',
    actionItems: [
      'Jantar leve (idealmente encerrado até as 20h para não sobrecarregar a digestão no sono).',
      'Tempo de qualidade sem telas com a família, amigos ou oração.',
      'Desative notificações de trabalho no celular.',
    ],
    goldenTip: 'Comer perto da hora de dormir eleva a temperatura corporal e arruína a fase REM do sono.',
    whyItMatters: 'O sucesso no trabalho não tem sentido se o lar e as relações mais preciosas forem negligenciados.',
  },
  {
    id: 'block-9',
    order: 9,
    timeRange: '20:30 - 21:45',
    period: 'noite',
    title: 'Alimento da Alma: Leitura Edificante & Santo Terço',
    subtitle: 'Nutrição intelectual de alto nível e contemplação dos mistérios divinos',
    category: 'espiritual',
    priorityBadge: 'Prioridade 1',
    actionItems: [
      'Reduza as luzes da casa (apague luzes brancas de teto e acenda abajures ou luzes quentes).',
      'Reze o Santo Rosário com fé e atenção aos frutos de cada mistério.',
      'Leia 15 a 20 páginas de um livro edificante (Imitação de Cristo, Hábitos Atômicos, etc.).',
    ],
    goldenTip: 'A mente processa durante a noite os pensamentos dos últimos 60 minutos antes de dormir. Alimente-a com sabedoria, não com futilidade.',
    whyItMatters: 'A oração da noite pacifica o coração, afasta as ansiedades mundanas e conecta o homem com a eternidade.',
  },
  {
    id: 'block-10',
    order: 10,
    timeRange: '21:45 - 22:30',
    period: 'noite',
    title: 'Skincare Noturno, Exame de Consciência & Sono Reparador',
    subtitle: 'Pele em regeneração profunda, alma em paz e 8h de sono anabólico',
    category: 'pele',
    priorityBadge: 'Hábito Chave',
    actionItems: [
      'Lave o rosto suavemente para retirar poluição e aplique hidratante noturno (niacinamida).',
      'Exame de consciência de 3 minutos: Onde acertei? Onde falhei? Peça perdão a Deus e trace o propósito de amanhã.',
      'Quarto 100% escuro, silencioso e fresco (19°C-21°C).',
      'Apague as luzes às 22h30 para garantir 7 a 8 horas de sono contínuo.',
    ],
    goldenTip: 'A renovação das células da pele e a liberação máxima do hormônio do crescimento (GH) ocorrem entre as 23h e as 02h em sono profundo.',
    whyItMatters: 'Dormir bem é a base biológica de tudo: humor, força, postura, pele jovem e imunidade.',
  },
];

/**
 * Daily Golden Hacks & Tips for Skin, Energy, Posture & Productivity
 */
export const dailyGoldenTips: GoldenDayTip[] = [
  {
    id: 'tip-skin-1',
    title: 'A Regra dos 30ml de Água por Kg para Pele de Vidro',
    category: 'pele',
    tip: 'Pele seca e sem brilho é 90% reflexo de desidratação celular. Beba 35ml de água limpa por kg de peso corporal por dia (ex: 75kg = 2.6L a 3L de água).',
    quickAction: 'Encha uma garrafa de 1L agora mesmo e coloque na sua mesa de trabalho.',
  },
  {
    id: 'tip-skin-2',
    title: 'O Perigo da Fronha de Travesseiro e Mãos no Rosto',
    category: 'pele',
    tip: 'A fronha do travesseiro acumula bactérias, oleosidade do cabelo e poeira. Troque a fronha a cada 4 a 7 dias e nunca apoie as mãos sujas nas bochechas ou queixo.',
    quickAction: 'Coloque um alarme semanal no Planly para trocar as fronhas de travesseiro aos sábados.',
  },
  {
    id: 'tip-skin-3',
    title: 'Água Muito Quente no Banho Destrói a Barreira Cutânea',
    category: 'pele',
    tip: 'A água pelando no chuveiro derrete a camada lipídica natural de proteção da pele, gerando o "efeito rebote": a pele produz o dobro de sebo para se defender, causando acne.',
    quickAction: 'Tome banho com água morna e finalize sempre com 30 a 60 segundos de água fria no rosto.',
  },
  {
    id: 'tip-energy-1',
    title: 'A Luz Solar Matinal: Seu Café Natural sem Efeitos Colaterais',
    category: 'energia',
    tip: 'Os fótons da luz solar da manhã penetram os fotorreceptores da retina e ativam o núcleo supraquiasmático do cérebro, elevando o cortisol bom e preparando o sono perfeito 14 horas depois.',
    quickAction: 'Dê 10 passos para a varanda ou quintal logo após acordar e olhe na direção do céu matinal.',
  },
  {
    id: 'tip-posture-1',
    title: 'Chin Tuck: O Exercício que Elimina o Pescoço de Tartaruga',
    category: 'postura',
    tip: 'A cada 1 hora sentado no computador, faça 10 repetições de recolhimento de queixo (chin tuck): puxe a cabeça para trás criando um "queixo duplo" por 3 segundos.',
    quickAction: 'Faça 5 repetições agora mesmo sentado na sua cadeira.',
  },
  {
    id: 'tip-foco-1',
    title: 'A Regra das 3 Prioridades: Clareza Vence a Pressa',
    category: 'foco',
    tip: 'Quem tenta fazer 20 tarefas por dia não faz nenhuma com maestria. Escolha 3 e apenas 3 metas fundamentais. Ao concluir as 3, o dia é considerado 100% vitorioso.',
    quickAction: 'Abra as Metas do Dia no Planly e selecione suas 3 prioridades.',
  },
];

/**
 * Actionable Posture, Skincare, Strength & Mindset Protocols
 */
export const transformationProtocols: TransformationRoutineStep[] = [
  {
    id: 'posture-1',
    category: 'posture',
    title: 'Correção de Postura e Alinhamento Cervical',
    subtitle: 'Elimine os ombros caídos e o "pescoço de texto" em 5 minutos diários',
    instructions: [
      'Chin Tuck (Recolhimento de queixo): Puxe a cabeça para trás como se quisesse encostar a nuca numa parede invisível. Segure 5s e repita 10x.',
      'Abertura de Peitoral na Porta: Apoie os antebraços no batente da porta e dê um passo à frente, abrindo o tórax por 30 segundos.',
      'Retração Escapular (Face Pull ou com toalha): Junte as omoplatas como se segurasse uma caneta no meio das costas por 3 séries de 12 repetições.',
    ],
    duration: '5 min ao acordar e após o almoço',
    benefit: 'Aumenta a presença visual, alivia dores nas costas e melhora a respiração.',
  },
  {
    id: 'skin-1',
    category: 'skin',
    title: 'Rotina de Skincare Masculino de Alto Impacto',
    subtitle: 'Pele limpa, sem oleosidade excessiva e protegida contra o envelhecimento precoce',
    instructions: [
      'Manhã (3 min): Lave o rosto com sabonete facial neutro (não use sabonete comum em barra) + aplique protetor solar FPS 30+ com toque seco.',
      'Hidratação Interna: Tome 500ml de água logo ao acordar com algumas gotas de limão para ativar a digestão.',
      'Noite (2 min): Lave novamente o rosto para tirar a poluição acumulada e passe um hidratante facial leve (com niacinamida ou ácido hialurônico).',
    ],
    duration: '5 min totais por dia',
    benefit: 'Elimina cravos, reduz olheiras e deixa o rosto com aspecto descansado e jovem.',
  },
  {
    id: 'strength-1',
    category: 'strength',
    title: 'Princípio da Sobrecarga Progressiva e Força',
    subtitle: 'Como ficar mais forte e com densidade muscular visível ainda este ano',
    instructions: [
      'Sobrecarga Progressiva: Toda semana, tente colocar 1 repetição a mais ou 1kg a mais nos exercícios base (Supino, Agachamento, Puxada).',
      'Meta de Proteína: Coma 1,6g a 2g de proteína por kg de peso (ex: se pesa 75kg, meta de 120-150g de proteína: ovos, frango, peixe, carne).',
      'Descanso Real: Durma 7 a 8 horas por noite em quarto escuro e fresco — é durante o sono profundo que o hormônio do crescimento (GH) repara as fibras musculares.',
    ],
    duration: 'Constância semanal nos treinos',
    benefit: 'Aumento de testosterona natural, queima de gordura e postura física imponente.',
  },
  {
    id: 'mindset-1',
    category: 'mindset',
    title: 'Protocolo de Mentalidade Vencedora e Foco Inabalável',
    subtitle: 'Reprograme sua mente para pensar como 1% das pessoas mais produtivas',
    instructions: [
      'Ritual Matinal (10 min): Ao acordar, antes de tocar no celular, faça 2 minutos de oração/gratidão + 3 minutos revendo suas 3 metas do dia + 5 minutos de leitura edificante.',
      'Regra das 2 Tarefas: Identifique as 2 tarefas que, se concluídas, farão do seu dia um sucesso. Execute-as primeiro, antes de qualquer distração.',
      'Reflexão Noturna (5 min): Antes de dormir, responda: "O que fiz bem hoje? O que posso melhorar amanhã? Agradeci a Deus?" Anote em 2 linhas.',
    ],
    duration: '15 min totais (manhã + noite)',
    benefit: 'Clareza mental, eliminação da procrastinação e sensação de progresso real todos os dias.',
  },
];

/**
 * Business & Wealth Creation Opportunities
 */
export const businessIdeasCatalog: BusinessInvestmentIdea[] = [
  {
    id: 'biz-1',
    title: 'Agência de Automações e Agentes de IA para Negócios Locais',
    potentialROI: 'Alto (R$ 3.000 a R$ 12.000/mês recorrente)',
    initialCapital: 'R$ 0 a R$ 200 (Apenas computador e internet)',
    description: 'Médicos, advogados, academias e imobiliárias perdem 40% das vendas por demorar a responder clientes no WhatsApp. Você implementa agentes de resposta rápida, agendamento de consultas e automação.',
    actionSteps: [
      '1. Escolha um nicho local da sua cidade (ex: clínicas odontológicas ou imobiliárias).',
      '2. Mapeie como eles atendem hoje no WhatsApp e mostre a perda de tempo.',
      '3. Crie uma demonstração funcional de agente de agendamento.',
      '4. Cobre uma taxa de implantação (R$ 1.500) + mensalidade de manutenção (R$ 500/mês).',
    ],
    recommendedBook: {
      title: 'Hábitos Atômicos',
      author: 'James Clear',
      keyTakeaway: 'Pequenas melhorias de 1% todos os dias geram resultados exponenciais ao longo de 1 ano.',
    }
  },
  {
    id: 'biz-2',
    title: 'Estratégia dos 3 Baldes de Investimento e Liberdade Financeira',
    potentialROI: 'Crescimento composto de patrimônio (10-14% ao ano)',
    initialCapital: 'Qualquer valor a partir de R$ 50/mês',
    description: 'Organize suas finanças no Planly com a regra dos 3 baldes: 1) Balde de Segurança (6 meses de custo fixo em Tesouro Selic/CDB), 2) Balde de Renda (Fundos Imobiliários e Ações de dividendos), 3) Balde de Crescimento (Negócio próprio e educação).',
    actionSteps: [
      '1. Registre todos os seus gastos do dia no módulo Finanças do Planly.',
      '2. Separe o dinheiro do aporte no mesmo dia em que o salário/receita cai (pague-se primeiro).',
      '3. Complete primeiro a Reserva de Emergência antes de arriscar em qualquer investimento volátil.',
    ],
    recommendedBook: {
      title: 'A Psicologia Financeira',
      author: 'Morgan Housel',
      keyTakeaway: 'O sucesso financeiro tem menos a ver com inteligência matemática e mais a ver com seu comportamento e autocontrole.',
    }
  },
  {
    id: 'biz-3',
    title: 'Freelance de Design, Edição ou Marketing Digital',
    potentialROI: 'R$ 2.000 a R$ 8.000/mês extra',
    initialCapital: 'R$ 0 (apenas internet e habilidades)',
    description: 'Empresas locais e digitais precisam de posts para redes sociais, edição de vídeo (Reels/Shorts), sites simples e gestão de tráfego pago. Comece oferecendo gratuitamente para 2-3 clientes, construa portfólio e escale.',
    actionSteps: [
      '1. Escolha uma habilidade digital: Canva/Figma para design ou CapCut para edição.',
      '2. Crie 5 peças de portfólio gratuitas para negócios locais.',
      '3. Publique no Instagram e ofereça seus serviços em grupos de empreendedores.',
      '4. Cobre pacotes mensais (R$ 800-2.000) para manutenção de redes sociais.',
    ],
    recommendedBook: {
      title: 'O Mito do Empreendedor',
      author: 'Michael E. Gerber',
      keyTakeaway: 'Trabalhe NO seu negócio (estratégia) e não apenas EM seu negócio (operacional).',
    }
  },
];

/**
 * Recommended Reading Library for Personal Growth
 */
export interface RecommendedBook {
  id: string;
  title: string;
  author: string;
  category: 'espiritual' | 'mentalidade' | 'financeiro' | 'produtividade' | 'saúde';
  description: string;
  keyInsight: string;
  searchQuery: string;
}

export const recommendedReadings: RecommendedBook[] = [
  {
    id: 'book-1',
    title: 'Introdução à Vida Devota',
    author: 'São Francisco de Sales',
    category: 'espiritual',
    description: 'O guia clássico de espiritualidade católica para leigos que vivem no mundo. Ensina como santificar o trabalho, os estudos e o convívio diário.',
    keyInsight: 'A santidade não é apenas para monges e freiras — é possível e obrigatória para todo cristão no seu estado de vida.',
    searchQuery: 'Introdução à Vida Devota São Francisco de Sales resumo',
  },
  {
    id: 'book-2',
    title: 'Hábitos Atômicos',
    author: 'James Clear',
    category: 'produtividade',
    description: 'O sistema científico para construir bons hábitos e eliminar maus hábitos usando a regra dos 1% de melhoria diária.',
    keyInsight: 'Você não sobe ao nível de suas metas — você desce ao nível de seus sistemas.',
    searchQuery: 'Hábitos Atômicos James Clear resumo português',
  },
  {
    id: 'book-3',
    title: 'A Psicologia Financeira',
    author: 'Morgan Housel',
    category: 'financeiro',
    description: 'Por que o sucesso financeiro depende mais do comportamento do que da inteligência. Ensina a construir riqueza com paciência e autocontrole.',
    keyInsight: 'A maior vantagem financeira é não precisar impressionar ninguém. Riqueza é o que você não gasta.',
    searchQuery: 'Psicologia Financeira Morgan Housel resumo português',
  },
  {
    id: 'book-4',
    title: 'O Poder do Hábito',
    author: 'Charles Duhigg',
    category: 'mentalidade',
    description: 'Como os hábitos funcionam no cérebro (Deixa → Rotina → Recompensa) e como modificar padrões automáticos de comportamento.',
    keyInsight: 'Todo hábito pode ser mudado se você entender sua mecânica: identifique a deixa e a recompensa, depois mude a rotina.',
    searchQuery: 'O Poder do Hábito Charles Duhigg resumo',
  },
  {
    id: 'book-5',
    title: 'O Livro da Saúde do Corpo e da Mente',
    author: 'Dr. Andrew Huberman',
    category: 'saúde',
    description: 'Protocolos baseados em neurociência para melhorar sono, foco, exercício, exposição solar e saúde hormonal.',
    keyInsight: 'Luz solar nos primeiros 30 minutos do dia calibra o relógio circadiano e melhora o sono, humor e testosterona.',
    searchQuery: 'Andrew Huberman protocolos saúde sono foco português',
  },
  {
    id: 'book-6',
    title: 'Imitação de Cristo',
    author: 'Tomás de Kempis',
    category: 'espiritual',
    description: 'O livro devocional mais lido da história do cristianismo depois da Bíblia. Um manual de vida interior, humildade e santidade prática.',
    keyInsight: 'De que te serve discorrer profundamente sobre a Trindade, se te falta a humildade, sem a qual não agradas à Trindade?',
    searchQuery: 'Imitação de Cristo Tomás de Kempis resumo meditação',
  },
];
