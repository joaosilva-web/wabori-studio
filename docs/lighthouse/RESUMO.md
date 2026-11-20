# Lighthouse — celular (2026-11-20, depois da camada de imersão)

Lighthouse 12.8.2, perfil móvel padrão (Moto G Power emulado, 4G lento, CPU 4×), build de produção
pré-renderizado (`VITE_SITE_URL` definida) servido localmente com gzip e `cleanUrls`, como na Vercel.
Os relatórios completos estão nesta pasta (abra o .html).

| Página | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | TBT | CLS | Speed Index |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 98 | 100 | 100 | 100 | 2.2 s | 41 ms | 0 | 1.6 s |
| /projetos | 98 | 100 | 100 | 100 | 2.1 s | 22 ms | 0.002 | 1.8 s |
| /projetos/exemplo-costas | 98 | 100 | 100 | 100 | 2.0 s | 38 ms | 0.001 | 1.7 s |
| /processo | 98 | 100 | 100 | 100 | 2.2 s | 35 ms | 0 | 1.6 s |
| /sobre | 98 | 100 | 100 | 100 | 2.0 s | 35 ms | 0.001 | 1.7 s |
| /iniciar-projeto | 98 | 100 | 100 | 100 | 2.0 s | 56 ms | 0 | 1.7 s |

Metas desta etapa: nenhuma página abaixo de 95, LCP até 2,5 s, TBT até 100 ms. Todas cumpridas.

## Observações

- **LCP da home é o título da capa** ("como composição."), não o vídeo. O pôster do contorno vem logo
  atrás (AVIF, `fetchpriority="high"`). O vídeo só começa a baixar depois do `load`, da abertura e de um
  momento ocioso, então não aparece no caminho da primeira pintura.
- **Código das cenas pesadas fora do pacote inicial:** Lenis (4,7 KB gzip), loop de busca do vídeo, cursor
  e transição de página entram por `import()` depois da hidratação.
- **Variação do TBT na home:** em rodadas repetidas, entre 34 e 83 ms (uma rodada isolada deu 162 ms).
  O pico vem da hidratação, que coincide com o fim da abertura.
- **Hidratação corrigida nesta etapa:** o pré-render gravava `dist/<rota>/index.html`, e `/sobre` (sem barra)
  recebia o HTML da home. O React descartava o HTML (erro #418) e re-renderizava tudo no cliente. Isso já
  acontecia nas medições anteriores das rotas internas. Agora cada rota é `dist/<rota>.html` e as sete
  rotas hidratam sem aviso no console.
- **SEO depende de `VITE_SITE_URL`:** sem ela, canonical e sitemap ficam relativos e o SEO cai para 83–85.

## Quadros no desktop (scroll contínuo pela home inteira)

Chrome 1440×900, Lenis ativo, wheel de 100 px a cada 16 ms do topo ao rodapé (11,5 mil px, todas as cenas):

| CPU | Mediana | p95 | p99 | Quadros acima de 25 ms |
| --- | --- | --- | --- | --- |
| sem limitação | 16,7 ms | 16,8 ms | 16,8 ms | 0,4% |
| 4× mais lenta | 16,7 ms | 33,4 ms | 50,1 ms | 15,4% |

Num desktop comum não há queda perceptível. Com a CPU 4× mais lenta (um notebook fraco), cerca de 1 em
cada 6 quadros passa de 25 ms durante a rolagem rápida. Se isso aparecer em aparelhos reais, os primeiros
candidatos são o manifesto (recalcula a cor de cada palavra a cada quadro) e a busca do vídeo.
