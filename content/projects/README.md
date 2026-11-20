# Como adicionar um projeto

Cada projeto é uma pasta dentro de `content/projects/`. O nome da pasta vira o endereço:
a pasta `costas-ryu` aparece em `/projetos/costas-ryu`. Use só letras minúsculas, números e hífen.

```
content/projects/
└─ costas-ryu/
   ├─ projeto.json      ← os textos e a lista de fotos
   ├─ capa.jpg          ← as fotos originais, do jeito que saíram da câmera
   ├─ sessao-01.jpg
   └─ detalhe.jpg
```

## Passo a passo

1. Copie uma pasta de exemplo (ex.: `exemplo-costas`) e renomeie.
2. Coloque as fotos originais na pasta. JPG, PNG ou WebP (fotos HEIC do iPhone: exporte como JPG antes). O site gera sozinho as versões
   leves (AVIF e WebP) em vários tamanhos; não precisa redimensionar.
3. Edite o `projeto.json` (veja os campos abaixo). Em cada foto, troque `"placeholder"` por
   `"file": "nome-do-arquivo.jpg"`.
4. Rode `npm run dev` para conferir. Se algum campo estiver errado, o terminal mostra qual.
5. Quando houver projetos reais, apague as três pastas `exemplo-*`.

## Campos do `projeto.json`

| Campo | Obrigatório | O que é |
| --- | --- | --- |
| `title` | sim | Título do projeto. |
| `area` | sim | `braco`, `costas`, `perna` ou `bodysuit` (é o que os filtros usam). |
| `scale` | sim | Escala por extenso: "Braço fechado", "Costas completas"… |
| `status` | sim | `concluido` ou `andamento`. |
| `sessions` | não | Número de sessões. Se ficar de fora, conta as sessões listadas em `sessionLog`. |
| `dates` | não | `{ "start": "2025-03", "end": "2026-01" }` (ano-mês). |
| `summary` | sim | Uma linha, para a lista de projetos. |
| `description` | sim | Parágrafos sobre o projeto (lista de textos). |
| `brought` | sim | O que o cliente trouxe: ideia, referências, contexto (lista de textos). |
| `sketch` | sim | `{ "text": [...], "photo": { ... } }` — o esboço da composição. A foto do esboço não leva `state`. |
| `meaning` | não | Lista de `{ "element": "Ryū", "text": "o que significa" }`. |
| `sessionLog` | não | Lista de sessões: `{ "date": "2025-04", "note": "...", "photo": { ... } }`. |
| `photos` | sim | Fotos do resultado. A primeira é a capa do projeto e a prévia da lista. |
| `featured` | não | `true` para aparecer nos destaques da home. |
| `order` | não | Ordem na lista (1 primeiro). Sem ordem, os mais recentes vêm antes. |
| `example` | não | `true` só nos projetos de exemplo. |

### Cada foto

```json
{
  "file": "capa.jpg",
  "alt": "Costas completas com dragão entre nuvens, do pescoço à lombar, cicatrizada",
  "state": "cicatrizada",
  "framing": "corpo"
}
```

- `alt` (obrigatório): descreva a área, o motivo e o estado. É o que leitores de tela e o Google leem.
- `state`: `fresca` ou `cicatrizada` — vira a etiqueta da foto.
- `framing`: `corpo` (corpo inteiro), `area` (área completa) ou `detalhe`.

## Regras das fotos

- Fundo neutro. Nada de filtro, moldura ou marca d'água: o selo do Wabori é posto pelo site.
- O site nunca corta a foto. Fotos verticais (4:5) aparecem maiores.
- Não publique número, data ou história que não seja verdadeira.

## Trocar para um CMS

A leitura dos projetos fica isolada em `src/lib/projects.ts`. Para usar um CMS headless
(Decap CMS, Sanity, TinaCMS…), basta trocar a fonte dentro dessa função mantendo o mesmo formato.
O Decap CMS, por exemplo, pode editar estes mesmos arquivos JSON pelo navegador, sem mudar nada no site.
