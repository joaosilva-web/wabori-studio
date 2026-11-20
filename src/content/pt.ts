// Todo o texto do site num lugar só (pt-BR). Edite aqui.
// Marcadores entre colchetes, como [A PREENCHER] e [FOTO: …], ainda precisam de conteúdo real.
// Voz: firme e sem arrogância. Frases curtas, sem ponto de exclamação, sem gíria de estúdio.

import type { SectionId } from './sections'
import type { TitleFragment } from './types'

type NavSection = Exclude<SectionId, 'atelie' | 'iniciar'>

const instagram = 'wabori.tattoo'

export const pt = {
  site: {
    name: 'Wabori',
    nameJa: '和彫り',
    tagline: 'Tatuagem japonesa tradicional',
    city: 'Maringá',
    region: 'PR',
    place: 'Maringá — PR',
    instagramHandle: `@${instagram}`,
    instagramUrl: `https://www.instagram.com/${instagram}/`,
    appointmentOnly: 'Somente com hora marcada',
    privateStudio: 'Ateliê privado',
    domain: '[DOMÍNIO]',
    defaultTitle: 'Wabori — Tatuagem japonesa tradicional em Maringá',
    defaultDescription:
      'Ateliê de tatuagem japonesa tradicional em Maringá, PR. Projetos de grande escala: braço fechado, costas, perna e bodysuit. Somente com hora marcada.',
  },

  nav: {
    label: 'Navegação principal',
    home: 'Wabori, página inicial',
    items: [
      { section: 'projetos', label: 'Projetos' },
      { section: 'processo', label: 'Processo' },
      { section: 'sobre', label: 'Sobre' },
    ] as { section: NavSection; label: string }[],
    cta: 'Iniciar um projeto',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    skip: 'Pular para o conteúdo',
  },

  ui: {
    arrow: '→',
    external: '↗',
    sessions: (n: number) => (n === 1 ? '1 sessão' : `${n} sessões`),
    sessionsRange: (a: number, b: number) => `${a}–${b} sessões`,
    photoState: { fresca: 'Fresca', cicatrizada: 'Cicatrizada' },
    projectStatus: { concluido: 'Concluído', andamento: 'Em andamento' },
    framing: { corpo: 'Corpo inteiro', area: 'Área completa', detalhe: 'Detalhe' },
    photoCounter: (i: number, total: number) =>
      `${String(i).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
    sealLabel: 'Selo Wabori',
    symbolLabel: 'Símbolo Wabori',
    placeholderPhoto: '[FOTO]',
    exampleBadge: 'Exemplo',
    fileDrop: {
      cta: 'Escolher imagens',
      or: 'ou arraste para cá',
      limit: (max: number) => `Até ${max} imagens, JPG, PNG ou WebP.`,
      remove: (name: string) => `Remover ${name}`,
      tooMany: (max: number) => `Escolha no máximo ${max} imagens.`,
      notImage: (name: string) => `${name} não é uma imagem.`,
      tooBig: (name: string, mb: number) => `${name} passa de ${mb} MB.`,
      count: (n: number, max: number) => `${n} de ${max}`,
    },
    required: 'obrigatório',
    optional: 'opcional',
    yes: 'Sim',
    no: 'Não',
    /** Texto do cursor customizado (desktop com mouse). */
    cursor: { view: 'Ver', drag: 'Arrastar' },
  },

  /* ---------------------------------------------------------------
   * Home
   * ------------------------------------------------------------- */
  home: {
    seo: {
      title: 'Wabori — Tatuagem japonesa tradicional em Maringá',
      description:
        'O corpo inteiro como composição. Ateliê de tatuagem japonesa tradicional em Maringá, PR, com projetos de braço fechado, costas, perna e bodysuit.',
    },
    cover: {
      /** Etiqueta no topo da cena (não é um projeto de cliente: só o processo). */
      label: 'Processo',
      titleLabel: 'O corpo inteiro como composição.',
      /**
       * O título se monta: cada fragmento chega de um lugar (from) e sai pelo mesmo lado.
       * left · below · above · right (letra por letra) · stamp (o ponto, carimbo em shu).
       */
      title: [
        [
          { text: 'O corpo', from: 'left' },
          { text: 'inteiro', from: 'below' },
        ],
        [
          { text: 'como', from: 'above' },
          { text: 'composição', from: 'right' },
          { text: '.', from: 'stamp' },
        ],
      ] satisfies TitleFragment[][],
      /** Texto alternativo dos quadros (o vídeo é decorativo, os quadros carregam a descrição). */
      alt: {
        contorno: 'Costas e braços com a tatuagem japonesa só no contorno: carpa, guerreiro, ondas e folhas de bordo.',
        cor: 'As mesmas costas com sombra e cor entrando na composição.',
        costas: 'As costas com a composição completa, em sombra e cor.',
        final: 'De perfil, o braço fechado com a carpa completa.',
      },
      steps: [
        {
          label: 'Bokashi e cor',
          text: 'Depois do contorno, sessão após sessão, a sombra dá volume e a cor assenta.',
        },
        {
          label: 'Costas completas',
          text: 'De 15 a 25 sessões, cada uma de 4 a 6 horas, com semanas de intervalo.',
        },
        {
          label: 'Uma peça só',
          text: 'Costas e braços desenhados juntos, para a composição acompanhar o corpo.',
        },
      ],
      final: 'Tudo começa por uma linha.',
      primary: 'Iniciar um projeto',
      secondary: 'Ver projetos',
      ruler: {
        label: 'Etapas do processo na capa',
        marks: ['Contorno', 'Sombra', 'Cor', 'Costas', 'Braço'],
        goTo: (m: string) => `Ir para a etapa ${m}`,
      },
    },
    idea: {
      label: 'O ateliê',
      aside: 'Composição para o corpo',
      title: ['Uma tatuagem japonesa', 'não é uma peça solta.'],
      paragraph:
        'No estilo tradicional, a composição nasce do corpo: dos músculos, das articulações e do caminho que a pele faz quando se move. Contorno, fundo de vento e água e a borda onde tudo termina são pensados juntos, antes da primeira sessão. Por isso o Wabori trabalha só com projetos de grande escala.',
      pillars: [
        {
          title: 'Composição',
          text: 'O desenho é feito para a área inteira, respeitando a anatomia. Nada é encaixado depois.',
        },
        {
          title: 'Tempo',
          text: 'Um projeto grande leva meses. As sessões têm intervalos para a pele cicatrizar entre uma etapa e outra.',
        },
        {
          title: 'Compromisso',
          text: 'Antes de começar, você recebe a estimativa do projeto inteiro e reserva a data com um sinal.',
        },
      ],
    },
    marquee: {
      label: 'Áreas: braço fechado, costas, perna e bodysuit.',
      items: ['Braço fechado', 'Costas', 'Perna', 'Bodysuit'],
    },
    featured: {
      label: 'Projetos',
      aside: (n: number) => `${String(n).padStart(2, '0')} em destaque`,
      title: ['Composições inteiras,', 'sessão por sessão.'],
      scrollHint: 'Role',
      counterSr: (i: number, n: number) => `Projeto ${i} de ${n}`,
      all: 'Ver todos os projetos',
      allCard: ['Ver todos', 'os projetos'],
    },
    process: {
      label: 'Processo',
      aside: '5 etapas',
      title: ['Da conversa', 'à cicatrização.'],
      more: 'Ver o processo em detalhe',
    },
  },

  cta: {
    label: 'Iniciar um projeto',
    title: ['Um projeto grande', 'começa por uma conversa.'],
    text: 'Conte a área, a escala e a ideia. Respondemos com os próximos passos.',
    button: 'Iniciar um projeto',
  },

  /* ---------------------------------------------------------------
   * Processo (as 5 etapas aparecem na home e em /processo)
   * ------------------------------------------------------------- */
  process: {
    seo: {
      title: 'Processo — Wabori',
      description:
        'Como funciona um projeto no Wabori: conversa, desenho, estimativa e sinal, sessões e cicatrização. Dúvidas frequentes e cuidados pós-sessão.',
    },
    label: 'Processo',
    aside: '5 etapas',
    title: ['Da conversa', 'à cicatrização.'],
    lead:
      'Um projeto de grande escala é feito em etapas, ao longo de meses. Você sabe o que esperar de cada uma antes de começar.',
    /** Cena "Como uma composição nasce": o corpo-tela que se constrói por camadas. */
    canvas: {
      label: 'Como uma composição nasce',
      alt: 'A composição completa em sombra e cor, construída camada por camada.',
      progress: 'Etapa do processo',
    },
    steps: [
      {
        title: 'Conversa',
        short: 'Área, escala e ideia.',
        text: 'Você conta o que imagina pelo formulário. Conversamos sobre a área do corpo, a escala, as tatuagens que já existem ali e o tempo disponível para as sessões.',
      },
      {
        title: 'Desenho',
        short: 'A composição pensada para o corpo.',
        text: 'A composição é desenhada para a sua anatomia. Os elementos, o fundo e o mikiri, a borda onde a composição termina, são definidos antes da primeira sessão.',
      },
      {
        title: 'Estimativa e sinal',
        short: 'O projeto inteiro, antes de começar.',
        text: 'Cobramos por sessão. Antes de começar, você recebe uma estimativa do projeto inteiro: número de sessões e prazo. Para reservar a data, pedimos um sinal.',
      },
      {
        title: 'Sessões',
        short: 'De 4 a 6 horas, com intervalos.',
        text: 'Cada sessão dura de 4 a 6 horas, com intervalos de algumas semanas. Primeiro vem o sujibori, o contorno; depois o fundo e o bokashi, a gradação de sombra.',
      },
      {
        title: 'Cicatrização',
        short: 'O resultado aparece na pele curada.',
        text: 'Entre as sessões, a pele cicatriza. O projeto só está pronto quando a última etapa está curada, e é assim que ele é fotografado.',
      },
    ],
    durations: {
      label: 'Quanto tempo',
      items: [
        { title: 'Braço fechado', value: 'De 8 a 12 sessões', detail: 'ao longo de 6 a 12 meses' },
        { title: 'Costas completas', value: 'De 15 a 25 sessões', detail: 'com intervalos de algumas semanas' },
        { title: 'Cada sessão', value: 'De 4 a 6 horas', detail: 'com intervalos de algumas semanas' },
      ],
    },
    faq: {
      label: 'Dúvidas',
      title: 'Antes de começar.',
      items: [
        {
          q: 'Quanto custa um projeto?',
          a: 'Cada projeto é diferente. Cobramos por sessão e, antes de começar, você recebe uma estimativa do projeto inteiro. Para reservar a data, pedimos um sinal.',
        },
        {
          q: 'Quanto tempo leva?',
          a: 'Um braço fechado leva de 8 a 12 sessões, ao longo de 6 a 12 meses. Costas completas levam de 15 a 25 sessões. Cada sessão dura de 4 a 6 horas, com intervalos de algumas semanas.',
        },
        {
          q: 'Dói?',
          a: 'Dói, e algumas áreas doem mais. As sessões são planejadas para que o processo seja sustentável.',
        },
        {
          q: 'E se eu precisar parar no meio?',
          a: 'O projeto é planejado em etapas que ficam bem mesmo enquanto ele continua.',
        },
      ],
    },
    care: {
      label: 'Cuidados',
      title: 'Depois de cada sessão.',
      lead: '[A PREENCHER PELO CLIENTE: orientações de cuidado pós-sessão]',
      items: [
        { title: '[A PREENCHER PELO CLIENTE] Primeiras horas', text: '[A PREENCHER PELO CLIENTE]' },
        { title: '[A PREENCHER PELO CLIENTE] Primeiros dias', text: '[A PREENCHER PELO CLIENTE]' },
        { title: '[A PREENCHER PELO CLIENTE] Até a próxima sessão', text: '[A PREENCHER PELO CLIENTE]' },
      ],
    },
  },

  /* ---------------------------------------------------------------
   * Projetos
   * ------------------------------------------------------------- */
  projects: {
    seo: {
      title: 'Projetos — Wabori',
      description:
        'Projetos de tatuagem japonesa tradicional do Wabori: braço fechado, costas, perna e bodysuit, contados sessão por sessão.',
    },
    label: 'Projetos',
    aside: (n: number) => `${String(n).padStart(2, '0')} composições`,
    title: 'Composições inteiras.',
    lead: 'Cada projeto é mostrado do esboço à pele cicatrizada, com o número de sessões e o estado atual.',
    filters: {
      area: 'Área',
      status: 'Estado',
      all: 'Todos',
      areas: { braco: 'Braço', costas: 'Costas', perna: 'Perna', bodysuit: 'Bodysuit' },
    },
    empty: 'Nenhum projeto com esses filtros.',
    results: (n: number) => (n === 1 ? '1 projeto' : `${n} projetos`),
  },

  study: {
    brought: 'O que o cliente trouxe',
    sketch: 'O esboço da composição',
    sessions: 'Sessão por sessão',
    sessionCounter: (i: number, total: number) =>
      `Sessão ${String(i).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
    sessionCounterSr: (i: number, total: number) => `Sessão ${i} de ${total}`,
    sessionLabel: (i: number) => `Sessão ${String(i).padStart(2, '0')}`,
    healed: 'O resultado cicatrizado',
    meaning: 'O significado dos elementos',
    facts: { area: 'Área', scale: 'Escala', sessions: 'Sessões', period: 'Período', status: 'Estado' },
    prev: 'Projeto anterior',
    next: 'Próximo projeto',
    back: 'Todos os projetos',
    exampleNotice: 'Projeto de exemplo, com conteúdo provisório. Substitua pelos projetos reais.',
  },

  /* ---------------------------------------------------------------
   * Sobre
   * ------------------------------------------------------------- */
  about: {
    seo: {
      title: 'Sobre — Wabori',
      description:
        'O Wabori é um ateliê privado de tatuagem japonesa tradicional em Maringá, PR. Atendimento somente com hora marcada, para clientes de qualquer cidade.',
    },
    label: 'Sobre',
    aside: 'O ateliê e o artista',
    title: ['Um ateliê dedicado', 'a um só estilo.'],
    atelier: {
      heading: 'O ateliê',
      paragraphs: [
        'O Wabori faz só tatuagem japonesa tradicional, e só em projetos de grande escala. Não fazemos peças pequenas, porque o estilo precisa de espaço para compor.',
        'O atendimento é em ateliê privado, em Maringá, somente com hora marcada. Recebemos clientes de outras cidades: as sessões são longas e espaçadas, e o projeto é planejado para quem vem de fora.',
      ],
      facts: [
        { k: 'Cidade', v: 'Maringá — PR' },
        { k: 'Atendimento', v: 'Ateliê privado, somente com hora marcada' },
        { k: 'Clientes', v: 'De Maringá e de outras cidades' },
        { k: 'Técnica', v: 'Máquina elétrica' },
      ],
    },
    philosophy: {
      heading: 'A filosofia',
      paragraphs: [
        'O nome vem de 和彫り, wabori, a tatuagem japonesa tradicional. A linguagem é a do irezumi, a tatuagem tradicional japonesa: o contorno, o fundo de vento e água, a borda que fecha a composição.',
        'O tebori, a técnica feita à mão, é a origem desse estilo. Ele é citado aqui por respeito. O Wabori trabalha com máquina elétrica.',
      ],
    },
    artist: {
      heading: 'O artista',
      name: '[A PREENCHER: nome do artista]',
      photo: '[FOTO: retrato do artista no ateliê]',
      photoAlt: '[A PREENCHER: descrição do retrato do artista]',
      /** A história, em texto que se acende palavra por palavra (padrão do manifesto). */
      story: [
        'Começou tatuando outros estilos. Com o tempo, o estudo da tatuagem japonesa tradicional tomou o lugar do resto, e hoje ele faz só esse estilo.',
        'Não tem linhagem formal nem nome de horishi, o nome de ofício que um mestre japonês dá ao aprendiz. O que sustenta o trabalho é o estudo contínuo e os projetos mostrados por inteiro, do esboço à pele cicatrizada.',
      ],
      storyLabel: 'A trajetória',
      paragraphs: ['[A PREENCHER: anos de trabalho, formação e outros fatos verificáveis]'],
    },
  },

  /* ---------------------------------------------------------------
   * Iniciar um projeto
   * ------------------------------------------------------------- */
  start: {
    seo: {
      title: 'Iniciar um projeto — Wabori',
      description:
        'Conte a área do corpo, a escala e a ideia do seu projeto de tatuagem japonesa tradicional. O orçamento é definido após avaliação.',
    },
    label: 'Iniciar um projeto',
    aside: 'Triagem',
    title: ['Conte o projeto', 'que você imagina.'],
    intro:
      'O Wabori faz tatuagem japonesa tradicional em projetos de grande escala. Não fazemos peças pequenas, cópias de trabalhos de outros artistas nem misturas de estilo.',
    notice: 'Trabalhamos com projetos de grande escala. O orçamento é definido após avaliação.',
    groups: { project: 'O projeto', you: 'Você' },
    fields: {
      area: {
        label: 'Área do corpo',
        placeholder: 'Escolha a área',
        options: ['Braço', 'Costas', 'Perna', 'Peito', 'Bodysuit', 'Outra área'],
      },
      scale: {
        label: 'Escala',
        options: ['Meia manga', 'Braço fechado', 'Costas completas', 'Bodysuit', 'Outro'],
      },
      existing: { label: 'Já existem tatuagens na área?' },
      idea: {
        label: 'Sua ideia',
        placeholder: 'Conte o que você imagina. Referências são bem-vindas, mas não precisam estar prontas.',
      },
      references: { label: 'Referências', hint: 'Opcional.' },
      availability: { label: 'Você tem disponibilidade para várias sessões?' },
      city: { label: 'Cidade', placeholder: 'Onde você mora' },
      source: { label: 'Como conheceu o ateliê?' },
      name: { label: 'Nome' },
      email: { label: 'E-mail' },
      whatsapp: { label: 'WhatsApp', placeholder: '(44) 90000-0000' },
    },
    errors: {
      required: 'Preencha este campo.',
      choose: 'Escolha uma opção.',
      email: 'Confira o e-mail.',
      phone: 'Confira o número, com DDD.',
      summary: 'Revise os campos marcados antes de enviar.',
    },
    submit: 'Enviar pedido',
    sending: 'Enviando…',
    success: {
      title: 'Pedido recebido.',
      text: 'Obrigado por contar o seu projeto. Respondemos em até [PRAZO], pelo e-mail ou pelo WhatsApp que você informou.',
      again: 'Enviar outro pedido',
    },
    failure: {
      title: 'Não conseguimos enviar.',
      text: 'Tente de novo em alguns minutos. Se o erro continuar, escreva para o Instagram @wabori.tattoo.',
      retry: 'Tentar de novo',
    },
  },

  footer: {
    label: 'Rodapé',
    navLabel: 'Páginas',
    contact: 'Contato',
    note: 'Ateliê privado em Maringá — PR. Somente com hora marcada.',
    rights: (year: number) => `© ${year} Wabori`,
    top: 'Voltar ao topo',
  },

  notFound: {
    seo: { title: 'Página não encontrada — Wabori', description: 'Esta página não existe.' },
    label: 'Erro 404',
    title: 'Esta página não existe.',
    back: 'Voltar à página inicial',
  },

  intro: { label: 'Carregando' },
}
