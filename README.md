# Wabori — site do ateliê

Site do Wabori, ateliê de tatuagem japonesa tradicional em Maringá. React 19 + React Router 7 + Vite 7,
pré-renderizado em HTML estático (cada rota já chega pronta para buscadores e redes sociais) e hidratado
no navegador. Hospedagem pensada para a Vercel (`vercel.json`).

## Rodar e publicar

```bash
npm install
npm run dev        # http://localhost:5173 (gera as imagens antes de subir)
npm run build      # imagens → typecheck → vite build → pré-render (dist/)
npm run preview    # serve o dist/ para conferir o build
```

- `npm run images` gera só as imagens (AVIF e WebP em vários tamanhos) a partir dos originais em
  `content/`. Só reprocessa o que mudou.
- O pré-render (`scripts/prerender.mjs`) grava cada rota como `dist/<rota>.html` (a Vercel serve
  `/sobre` a partir de `sobre.html` com `cleanUrls`), além de `404.html`, `sitemap.xml` e `robots.txt`.
- O design system fica em `docs/Wabori — Design System.html` (abra no navegador). Os últimos números
  do Lighthouse estão em `docs/lighthouse/RESUMO.md`.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha.

| Variável | Onde | Para quê |
| --- | --- | --- |
| `VITE_SITE_URL` | `.env` e Vercel | URL pública, sem barra no fim. Gera canonical, `og:url`, sitemap e robots. **Sem ela, o SEO cai** (os links ficam relativos). |
| `VITE_FORM_PROVIDER` | `.env` e Vercel | Como o formulário envia: `email`, `formspree` ou `mock` (padrão em desenvolvimento). |
| `VITE_FORMSPREE_ID` | `.env` e Vercel | Só com `formspree`: o código em `formspree.io/f/<código>`. |
| `RESEND_API_KEY` | só no painel da Vercel | Só com `email`: chave do Resend. Nunca no código. |
| `BRIEFING_TO` | só no painel da Vercel | E-mail(s) que recebem os pedidos (separe vários por vírgula). |
| `BRIEFING_FROM` | só no painel da Vercel | Remetente verificado no Resend, ex.: `Wabori <site@seudominio>`. |

### Envio do formulário "Iniciar um projeto"

- **`email` (recomendado):** a função `api/briefing.ts` recebe o pedido e envia pelo Resend, com as
  imagens de referência anexadas (comprimidas no navegador, até 4 MB no total).
- **`formspree`:** envia direto ao Formspree. Anexos só nos planos pagos.
- **`mock`:** simula o envio. Bom para desenvolver; nunca em produção.

Para outro provedor, crie um adaptador em `src/lib/briefing/` com a mesma assinatura e registre em
`src/lib/submitBriefing.ts`.

## Adicionar um projeto

Cada projeto é uma pasta em `content/projects/<endereço>/` com um `projeto.json` e as fotos originais.
O passo a passo e todos os campos estão em [`content/projects/README.md`](content/projects/README.md).
Projetos com `"featured": true` aparecem na galeria da home.

## Onde trocar os textos

Todo o texto do site está em **`src/content/pt.ts`**, organizado por página (home, processo, sobre,
projetos, formulário, rodapé). Os componentes só leem dali. `src/content/en.ts` está preparado para uma
versão em inglês (vazio por enquanto; o que faltar cai no português).

Fotos do site que não são de projeto (os quadros da capa, por exemplo) ficam em `content/images/`.

## Placeholders que faltam

Procure por `[` em `src/content/pt.ts` e nos `projeto.json`:

- **`[DOMÍNIO]`**: o domínio ainda não registrado (`site.domain` em `pt.ts`, e-mails do formulário).
  Defina também o `VITE_SITE_URL`.
- **`[A PREENCHER: nome do artista]`**, a descrição do retrato e **`[FOTO: retrato do artista no ateliê]`**
  (página Sobre).
- **`[A PREENCHER: anos de trabalho, formação e outros fatos verificáveis]`** (Sobre).
- **`[A PREENCHER PELO CLIENTE: orientações de cuidado pós-sessão]`** e os três cuidados (Processo).
- **`[PRAZO]`**: em quanto tempo o ateliê responde (mensagem de sucesso do formulário).
- **Projetos:** as três pastas `exemplo-*` em `content/projects/` são de exemplo (todos os textos
  `[A PREENCHER]` e fotos `[FOTO: …]`). Troque por projetos reais e apague os exemplos.

## Movimento: inventário de cenas

A home é uma sequência de cenas guiadas pelo scroll, e as páginas internas usam a mesma linguagem.
As regras completas estão na seção "(06) Movimento" do design system.

| Cena | Onde | Arquivo |
| --- | --- | --- |
| 1. Abertura: o símbolo é tatuado (contorno, preenchimento, anel) e abre em íris | Entrada do site | `src/components/Intro.tsx` + script inline em `index.html` |
| 2. Capa: o processo em vídeo, rodando de trás para frente com o scroll (500 vh) | Home | `src/components/HeroProcess.tsx`, `src/lib/heroFrames.ts`, `src/lib/videoScrub.ts` |
| 3. Kaze reativo: a amplitude da onda cresce com a velocidade | Entre seções | `src/components/Kaze.tsx` |
| 4. Manifesto: palavras que se acendem, onda que se desenha, anel shu (250 vh) | Home e Sobre (160 vh) | `src/components/Manifesto.tsx` |
| 5. Faixa em shu com inércia (duas linhas, `skewX` pela velocidade) | Home | `src/components/Marquee.tsx` |
| 6. Como uma composição nasce: etapas e corpo-tela por camadas (400 vh) | Processo | `src/components/CompositionScene.tsx` |
| 7. Galeria horizontal de projetos (300 vh) + cursor customizado | Home / todo o site | `src/components/FeaturedGallery.tsx`, `src/lib/cursor.ts` |
| 8. Rodapé revelado como cortina | Todas as páginas | `src/components/Footer.tsx` |
| Sessões: trilho arrastável e contador grande | Estudo de projeto | `src/components/SessionTrack.tsx` |
| Transição entre páginas (painel shu, View Transitions) | Toda troca de rota | `src/lib/pageTransition.ts` |

Base comum: `src/hooks/useScrollProgress.ts` (progresso 0 → 1 de toda seção presa, escrito em CSS
variables), `src/lib/scrollVelocity.ts` (velocidade do scroll, um loop só) e `src/lib/smoothScroll.ts`
(Lenis, só no desktop). Em `prefers-reduced-motion`, nada fica preso: conteúdo empilhado e estado final.

### Vídeo da capa

`public/video/wabori-processo-1280.mp4` (desktop) e `wabori-processo-576x720.mp4` (celular, 4:5) são
H.264 **all-intra** (todo quadro é chave), sem áudio, com `faststart`. É isso que faz a busca de quadro pelo
scroll ser instantânea nos dois sentidos. **Se trocar o vídeo, mantenha o all-intra**, por exemplo:

```bash
ffmpeg -i original.mp4 -an -c:v libx264 -g 1 -keyint_min 1 -sc_threshold 0 -crf 23 \
  -pix_fmt yuv420p -movflags +faststart wabori-processo-1280.mp4
```

Os quadros parados (`content/images/hero-processo-01` a `04`, com versões `-mobile`) são o pôster, o modo
de imagens (economia de dados, 2g) e o estado final em movimento reduzido. Se o vídeo mudar, a tabela de
trechos em `src/lib/heroFrames.ts` (que quadro aparece em que ponto do scroll) precisa acompanhar.
