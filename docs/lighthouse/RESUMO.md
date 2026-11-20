# Lighthouse — celular (2026-11-20)

Lighthouse 12.8.2, perfil móvel padrão (Moto G Power emulado, 4G lento, CPU 4×), build de produção
pré-renderizado servido localmente com gzip. Os relatórios completos estão nesta pasta (abra o .html).

| Página | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| / | 98 | 96 | 100 | 100 | 1.9 s | 10 ms | 0 |
| /projetos | 97 | 100 | 100 | 100 | 2.0 s | 10 ms | 0 |
| /projetos/exemplo-costas | 97 | 100 | 100 | 100 | 1.9 s | 10 ms | 0 |
| /processo | 98 | 100 | 100 | 100 | 2.0 s | 0 ms | 0 |
| /sobre | 97 | 100 | 100 | 100 | 1.9 s | 0 ms | 0 |
| /iniciar-projeto | 97 | 100 | 100 | 100 | 2.1 s | 10 ms | 0 |

## Observações

- **Acessibilidade 96 na home:** o Lighthouse sempre abre como primeira visita, com a abertura em shu.
  Ele mediu o parágrafo da capa no meio do fade de entrada (semitransparente). Com o texto já visível,
  o contraste é sumi sobre washi, 9,9:1.
- **Speed Index (~3,6 s):** a abertura cobre a página na primeira visita por cerca de 2,1 s, de propósito.
- **CSS bloqueante e JS não usado:** o pacote é um só (React + React Router, ~107 KB gzip). Dividir por rota
  economizaria ~55 KB na primeira visita, ao custo de complicar a hidratação. Não vale a pena com as notas atuais.
- Números de produção na Vercel (brotli, CDN) tendem a ser iguais ou melhores. Rode de novo com o domínio real.
