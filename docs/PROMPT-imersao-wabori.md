# Prompt para o Claude Code — camada de imersão do Wabori

> Cole no Claude Code dentro do repositório `wabori-studio`. Este prompt continua o trabalho já feito, até o commit "SEO, pré-renderização e Lighthouse". Ele não recomeça nada.

---

A base do site está correta e completa: as seis páginas, tokens, componentes, conteúdo, envio do formulário, pré-renderização, acessibilidade e o loop de velocidade do scroll, com Lighthouse entre 97 e 98. Mas a experiência ficou **simples demais**. Hoje a home é uma pilha de seções com revelação no scroll, e falta a **imersão** do site da Wa Labs, onde a página conta uma história enquanto você rola: seções presas, cenas guiadas pelo scroll, fundo que reage ao cursor e transições que emendam uma seção na outra.

O objetivo desta etapa é transformar a home numa **sequência de cenas** e levar a mesma linguagem para as páginas internas. Cada cena traduz um elemento real da tatuagem japonesa: o contorno (sujibori), a borda (mikiri), o fundo de vento e água (Kaze) e as sessões. Nada de efeito pelo efeito.

## 0. Antes de começar

1. Leia:
   - as páginas `src/pages/Home.tsx`, `About.tsx` e `Process.tsx`;
   - os hooks `src/hooks/useScrollProgress.ts`, `useViewProgress.ts` e `useMediaQuery.ts`, e `src/lib/scrollVelocity.ts`;
   - os componentes `SessionTrack.tsx` (o padrão de seção presa que já funciona), `Intro.tsx`, `Kaze.tsx`, `Marquee.tsx`, `ProcessRail.tsx`, `Footer.tsx` e `Layout.tsx`;
   - `src/App.tsx` (o `ScrollToTop`), o script inline da abertura em `index.html`, `src/entry-server.tsx` e `scripts/prerender.mjs`;
   - `docs/lighthouse/RESUMO.md` e `docs/Wabori — Design System.html`.
2. Me mostre um plano com: as cenas na ordem, a altura de cada seção presa (em `vh`), quais hooks novos você vai criar e o que vai remover ou substituir. Espere meu ok.

## 1. Regras que esta etapa muda no design system

Atualize a seção "(06) Movimento" de `docs/Wabori — Design System.html` para refletir estas mudanças:

- **Rolagem suave liberada:** Lenis (`lerp: 0.09`, só no desktop, desligada em movimento reduzido). O `scrollVelocity` passa a ler a velocidade do Lenis.
- **Cursor customizado liberado** (só com `pointer: fine`), como descrito na cena 7.
- **Cenas presas no scroll liberadas.** Use `position: sticky` com a seção alta, e nunca `overflow: hidden` em ancestrais: use `overflow-x: clip`.
- **Máscara sobre foto liberada durante uma transição** (círculo que abre, cortina). O estado final sempre mostra a foto inteira. Continua proibido animar a foto em si: nada de zoom, distorção, parallax dentro do quadro ou filtro.
- Continua valendo: o símbolo nunca gira, o shu é a cor da marca, o ōdo quase nunca aparece, nada de vidro, pílula ou sombra.

**Padrão técnico** (o mesmo da Wa Labs e o que o `SessionTrack` já usa): cada cena escreve o seu progresso (0 → 1) em CSS variables via `requestAnimationFrame`, sem re-render do React por frame. O React só re-renderiza quando muda uma etapa discreta, como a etapa ativa ou o número da sessão. **Reaproveite `useScrollProgress`** para todas as seções presas, sem criar um hook paralelo. Se precisar estender o hook, estenda o existente. Não use GSAP. Tudo pausa fora da tela.

## 1b. Restrições do projeto atual (não quebrar)

- **Pré-renderização:** o HTML de cada rota é gerado por `entry-server.tsx`, e o React hidrata por cima. Toda cena precisa renderizar o mesmo markup no servidor e no cliente. Canvas, Lenis, cursor, View Transitions e qualquer acesso a `window` só podem rodar dentro de `useEffect`. Não decida a estrutura do markup pelo `useMediaQuery` no primeiro render, porque isso causa diferença de hidratação. A estrutura de cena presa versus empilhada é decidida em CSS (media queries e `prefers-reduced-motion`), e o JS só liga ou desliga o progresso.
- **Abertura sem piscar:** a abertura é decidida antes da pintura pelo script inline de `index.html` (classes `.intro` / `.no-intro` e `data-intro="out"`). A nova abertura mantém esse mecanismo, para que o HTML pré-renderizado já nasça coberto.
- **Lenis e rotas:** troque o `window.scrollTo(0, 0)` do `ScrollToTop` por `lenis.scrollTo(0, { immediate: true })` quando o Lenis estiver ativo. Links âncora (`#conteudo`, "Pular para o conteúdo") passam pelo Lenis e mantêm o foco. O `scrollVelocity` lê `lenis.velocity` quando houver Lenis e cai para `scrollY` sem ele.
- **Sticky:** os ancestrais continuam com `overflow-x: clip`, como em `global.css`. O Lenis não pode usar um wrapper com `overflow: hidden`.
- **Desempenho:** hoje o Lighthouse no celular está entre 97 e 98, com LCP entre 1,9 e 2,1 s e TBT de até 10 ms. Depois desta etapa, nenhuma página pode cair abaixo de 95, o LCP precisa ficar em até 2,5 s e o TBT em até 100 ms. O código das cenas pesadas (o loop de busca do vídeo, cursor, transição de página) é carregado com `import()` dinâmico depois da hidratação e nunca entra no caminho da primeira pintura. Na cena da capa, o LCP deve ser o título ou o pôster do vídeo, nunca o vídeo.

## 2. As cenas da home, em ordem

### Cena 1 — Abertura: o símbolo é tatuado
Substitua a abertura atual. Sobre fundo shu, o símbolo (em washi) é feito nas três etapas reais de uma tatuagem:
1. **Sujibori (contorno):** o contorno da onda, com garras, se desenha como um traço (`stroke-dashoffset` no path da onda usado como contorno, 1,1 s, `--ease-ink`).
2. **Bokashi (sombra):** o preenchimento entra de baixo para cima, como uma máscara que sobe (0,6 s), e a linha entalhada aparece por último.
3. **Mikiri (borda):** o anel se fecha em volta (0,8 s).

Em seguida, o anel cresce até virar uma **íris** (`clip-path: circle()`) que se abre e revela a capa por baixo, em vez da cortina que sobe. Mantenha as regras atuais: espera o carregamento real, mínimo de cerca de 2,4 s, só na primeira visita da sessão e nunca em movimento reduzido. Nas visitas seguintes da sessão, mostre uma versão curta de 0,6 s, só com a íris.

### Cena 2 — Capa: o processo em vídeo, guiado pelo scroll (seção presa, cerca de 500 vh no desktop e 350 vh no celular)

O ateliê forneceu um vídeo de costas e braços fechados. No vídeo original, a tatuagem aparece **completa no começo** e vai se desfazendo até sobrar **só o contorno no fim**. No site, o scroll conta o processo na ordem certa: **o vídeo roda de trás para frente conforme a pessoa desce**, do contorno até a peça completa.

**Arquivos** (já preparados, só copiar para o repositório):
- `public/video/wabori-processo-1280.mp4`: 1280×720, 24 fps, 190 quadros, H.264 **all-intra** (todo quadro é chave), sem áudio, `faststart`, 3,7 MB. Usado no desktop.
- `public/video/wabori-processo-576x720.mp4`: recorte 4:5 centralizado no corpo, all-intra, 2,3 MB. Usado no celular.
- `content/images/hero-processo-01-contorno.jpg` (quadro 189, só contorno): o pôster e o estado inicial da capa.
- `content/images/hero-processo-02-cor.jpg` (quadro 150), `hero-processo-03-costas.jpg` (quadro 100) e `hero-processo-04-final.jpg` (quadro 0, peça completa de perfil): o modo de imagens e o estado final em movimento reduzido.
- Cada uma tem uma versão `-mobile` (4:5). Todas passam pelo `scripts/images.mjs` como qualquer imagem do site.

Não re-encode os vídeos sem manter o all-intra: é ele que faz a busca de quadro (`currentTime`) ser instantânea para frente e para trás.

**Mapa do scroll para o vídeo.** O progresso `p` (0 → 1) da seção presa, vindo do `useScrollProgress`, vira o quadro do vídeo por uma tabela de trechos com pausas de leitura. Quadro 189 é o contorno, quadro 0 é a peça completa de perfil:

| `p` | Quadros | O que se vê | Legenda |
| --- | --- | --- | --- |
| 0 → 0,16 | parado em 189 | Só o contorno nas costas e nos braços | Título da capa |
| 0,16 → 0,44 | 189 → 130 | A sombra e a cor vão entrando | 01 |
| 0,44 → 0,62 | 130 → 60 | As costas completas | 02 |
| 0,62 → 0,88 | 60 → 0 | A pessoa gira e mostra o braço fechado | 03 |
| 0,88 → 1 | parado em 0 | A peça completa | Chamada final |

- Converta o quadro em tempo com `t = (quadro + 0,5) / 24`. Atualize `video.currentTime` no máximo uma vez por frame, só quando o quadro alvo mudar, e com um lerp leve (0,2) no quadro alvo para a busca não "pular" quando o scroll é rápido. Com o Lenis, o scroll já chega suave.
- O vídeo fica sempre pausado (`muted`, `playsInline`, `preload="auto"`, sem `autoplay`, sem controles). Ele nunca toca sozinho: só o scroll move.
- Em Safari, faça uma chamada `play().then(pause)` silenciosa no primeiro toque ou scroll, para destravar a busca. Se a busca falhar, caia no modo de imagens (abaixo).

**Layout.**
- O vídeo ocupa a tela inteira (`100svh`, `object-fit: cover`). No desktop usa o arquivo 1280 com `object-position: 50% 40%`; no celular, o 4:5. A troca de arquivo é feita no `useEffect`, por media query, e o markup pré-renderizado é o mesmo nos dois.
- O fundo da seção é o cinza do próprio vídeo (cerca de `#B8B8B8`), para não aparecer uma borda quando o vídeo carrega.
- **Título da capa** (`h1`, mantém o padrão atual de linhas com máscara): "O corpo inteiro / como composição.", em sumi sobre o vídeo, alinhado à esquerda no terço inferior. Ele sai subindo e perdendo opacidade entre `p` 0,10 e 0,18.
- **Legendas** (uma por trecho) aparecem num cartão washi, com cantos retos e fio sumi, preso à direita no desktop e na base no celular. Cada cartão tem o número de dois dígitos em shu, um rótulo em caixa alta e duas linhas de texto em sumi. Eles entram e saem com a revelação padrão (subir 44 px e opacidade):
  - **01 — Bokashi e cor.** "Depois do contorno, sessão após sessão, a sombra dá volume e a cor assenta."
  - **02 — Costas completas.** "De 15 a 25 sessões, cada uma de 4 a 6 horas, com semanas de intervalo."
  - **03 — Uma peça só.** "Costas e braços desenhados juntos, para a composição acompanhar o corpo."
  - **Chamada final:** "Tudo começa por uma linha." com os botões "Iniciar um projeto" e "Ver projetos".
- Uma **régua de progresso** fina no rodapé da cena, com cinco marcas (Contorno, Sombra, Cor, Costas, Braço) e o trecho ativo em shu. Clicar numa marca leva o scroll até ela (via Lenis).
- No topo, à esquerda, a etiqueta "Processo" e o selo do símbolo. **Não** diga que é um projeto de cliente nem cite um número de sessões específico desta peça: as legendas usam só as faixas gerais do ateliê.
- O header fixo fica transparente durante a cena e volta ao washi translúcido depois.

**Carregamento e desempenho.**
- O LCP é o título ou o pôster (AVIF/WebP do pipeline, com `fetchpriority="high"`). O vídeo só começa a baixar depois da hidratação e da abertura.
- Com `navigator.connection.saveData`, conexão `2g`/`slow-2g` ou movimento reduzido, **não baixe o vídeo**: a cena usa as 4 imagens `hero-processo-01` a `04`, trocadas por crossfade conforme o scroll. Em movimento reduzido, a seção não fica presa: mostra o pôster final com as legendas empilhadas.
- Pause tudo (incluindo o loop de busca) quando a seção sai da tela.

A abertura (Cena 1) termina com a íris revelando **o pôster do contorno**, que é o primeiro quadro que a capa mostra.

### Cena 3 — Kaze reativo
- A faixa Kaze entre as seções passa a reagir à velocidade: além de acelerar, a **amplitude da onda cresce** com a velocidade do scroll e volta a se acalmar quando a rolagem para. Crie uma segunda versão do path `WIND` com exatamente os mesmos comandos e o mesmo número de pontos (só os valores de y mudam, com mais amplitude) e interpole os dois pela velocidade normalizada (0 a 1), escrevendo o atributo `d` no mesmo loop do `scrollVelocity`.

### Cena 4 — Manifesto: o texto se acende e o contorno se desenha (seção sumi presa, cerca de 250 vh)
- Um parágrafo grande em Zen Old Mincho 900 (`--text-2xl`), com o texto da ideia central, dividido em palavras. Cada palavra passa de `--nezumi-claro` a 25% de opacidade para washi cheio conforme o scroll avança, palavra por palavra.
- Ao fundo, enorme e saindo das bordas, a **linha da onda do símbolo** (o contorno com garras) se desenha em `--sumi-2`, com `stroke-dashoffset` guiado pelo mesmo progresso.
- No fim da cena, um **anel shu se fecha** em volta do conjunto (o mikiri), e os três pilares (Composição, Tempo, Compromisso) entram em sequência.

### Cena 5 — Faixa em shu com inércia
- Duas linhas de faixa em sentidos opostos. Além da velocidade, aplique um `skewX` de até 8° proporcional à velocidade do scroll, voltando a 0 com suavidade.

### Cena 6 — Como uma composição nasce
Na home, o vídeo da capa já conta o processo, então esta cena **sai da home**: remova o `ProcessRail` da home e troque a seção "Processo resumido" por um bloco curto, com as 5 etapas numa linha e o link para `/processo`. A cena completa, presa no scroll, vai para a página **Processo** (veja "Páginas internas"):
- **Esquerda:** as 5 etapas (Conversa, Desenho, Estimativa e sinal, Sessões, Cicatrização), com numeral grande, título e texto. A etapa ativa fica em sumi e as outras em nezumi a 40%. Uma barra fina shu mostra o progresso.
- **Direita, presa no centro:** um "corpo-tela" em kinari (4:5), onde a composição se constrói por camadas. Use os quadros do mesmo vídeo como camadas: contorno (quadro 189), cor entrando (150), completo (100). Use crossfade, nunca vídeo de novo.

### Cena 7 — Projetos em galeria horizontal (seção presa, cerca de 300 vh)
- Os projetos em destaque viram cartões grandes 4:5 lado a lado, que se movem na horizontal conforme o scroll. Cada cartão tem foto, número, área, título e número de sessões. Termina num cartão "Ver todos os projetos".
- **Cursor customizado:** um ponto shu de 8 px segue o cursor com lerp de 0,25. Sobre um cartão de projeto, ele vira um **anel do símbolo** de 88 px com o texto "Ver" em washi sobre shu. Sobre links e botões, cresce para 32 px. Ele some em toque e em movimento reduzido. O cursor do sistema continua visível em campos de texto.
- Mantenha a `ProjectList` com a prévia que segue o cursor na página `/projetos`.

### Cena 8 — Rodapé revelado
- O rodapé em shu fica fixo por baixo da página (`position: sticky; bottom: 0` com `z-index` menor). O conteúdo sobe e **revela** o rodapé, como uma cortina. A palavra WABORI gigante sobe letra por letra com o progresso da revelação, e o símbolo washi se desenha nas três etapas da abertura.

### Páginas internas
- **Sobre:** a história do artista usa o padrão do manifesto (texto que se acende palavra por palavra, com o contorno da onda ao fundo), mais curto, com cerca de 160 vh.
- **Processo:** a cena "Como uma composição nasce" (Cena 6), com os textos detalhados de cada etapa que já estão na página.
- **Estudo de projeto:** o `SessionTrack` ganha o cursor "Arrastar" sobre o trilho e um contador de sessão grande em Zen Old Mincho 900, preso no canto.
- **Projetos e Iniciar um projeto:** só o cursor, as revelações e a transição de página. O formulário não ganha nenhum efeito que atrapalhe o preenchimento.

### Transição entre páginas
- Ao trocar de rota: um painel shu sobe de baixo (450 ms, `--ease-exit`) com o símbolo washi no centro, a rota troca e o painel sai pelo topo (600 ms, `--ease-enter`). Use a View Transitions API quando houver suporte e um fallback com CSS. O foco vai para o `h1` da nova página e o título do documento é anunciado. Nada disso acontece em movimento reduzido.

## 3. Celular e desempenho

- Abaixo de 760 px, as cenas presas continuam, mas mais curtas (cerca de 60% da altura) e sem cursor. O vídeo da capa usa o arquivo 4:5. A galeria horizontal vira um carrossel com scroll-snap.
- A meta continua: Lighthouse acima de 90 em desempenho no celular, sem queda de quadros perceptível no desktop. Meça com o Performance panel e me mostre o resultado.
- Toda cena tem versão em `prefers-reduced-motion`: sem seções presas, conteúdo empilhado, estado final direto (foto inteira, texto aceso, camadas completas).

## 4. Entrega

1. O plano (seção 0) e espere meu ok.
2. Implemente uma cena por commit, nesta ordem: Lenis (com `ScrollToTop`, âncoras e `scrollVelocity` ajustados), Cena 2 (vídeo da capa), Cena 4, Cena 7 + cursor, Cena 1, Cenas 3, 5 e 8, páginas internas (incluindo a Cena 6 no Processo) e transição de páginas.
3. Ao fim de cada cena, descreva o que o usuário vê do começo ao fim do scroll e grave um vídeo curto ou uma sequência de capturas em 0%, 50% e 100% do progresso.
4. Rode o Lighthouse de novo nas seis rotas e atualize `docs/lighthouse/RESUMO.md`. Confirme também que o build pré-renderizado hidrata sem avisos no console.
5. Atualize o design system (seção "(06) Movimento") com as novas regras e o inventário de cenas.
6. O repositório ainda não tem um `README.md` na raiz, embora o primeiro prompt pedisse um. Crie-o com: como rodar e fazer o build, como adicionar um projeto (pode apontar para `content/projects/README.md`), onde trocar os textos, como configurar o envio do formulário e o `VITE_SITE_URL`, a lista de placeholders `[...]` que faltam e o inventário de cenas.
