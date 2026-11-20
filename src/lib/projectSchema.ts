import { z } from 'zod'

/**
 * Formato de um projeto (content/projects/<slug>/projeto.json).
 * Documentado para o cliente em content/projects/README.md — mantenha os dois em sincronia.
 */

const month = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'use o formato AAAA-MM, ex.: 2026-03')

export const photoSchema = z.object({
  /** Arquivo na pasta do projeto (ex.: "costas-01.jpg"). Sem arquivo, aparece o placeholder. */
  file: z.string().optional(),
  /** Texto do placeholder enquanto não há foto. */
  placeholder: z.string().optional(),
  /** Texto alternativo: área, motivo e estado. Obrigatório. */
  alt: z.string().min(1, 'toda foto precisa de texto alternativo'),
  /** Etiqueta da foto. */
  state: z.enum(['fresca', 'cicatrizada']),
  /** Enquadramento: corpo inteiro, área completa ou detalhe. */
  framing: z.enum(['corpo', 'area', 'detalhe']),
})

export const sessionSchema = z.object({
  /** Data da sessão (AAAA-MM). Opcional. */
  date: month.optional(),
  /** O que foi feito nesta sessão. */
  note: z.string().min(1),
  photo: photoSchema.optional(),
})

export const projectSchema = z.object({
  /** true = projeto de exemplo (conteúdo provisório). Apague o arquivo quando houver projetos reais. */
  example: z.boolean().default(false),
  /** Aparece nos destaques da home. */
  featured: z.boolean().default(false),
  /** Ordem na lista (menor primeiro). Sem ordem, os mais recentes vêm antes. */
  order: z.number().optional(),

  title: z.string().min(1),
  area: z.enum(['braco', 'costas', 'perna', 'bodysuit']),
  /** Escala por extenso (ex.: "Braço fechado", "Costas completas"). */
  scale: z.string().min(1),
  status: z.enum(['concluido', 'andamento']),
  /** Número de sessões. Se ficar vazio, conta as sessões listadas. */
  sessions: z.number().int().positive().optional(),
  dates: z
    .object({ start: month.optional(), end: month.optional() })
    .default({}),

  /** Uma linha, para a lista de projetos. */
  summary: z.string().min(1),
  /** Descrição do projeto, um parágrafo por item. */
  description: z.array(z.string()).min(1),
  /** O que o cliente trouxe: ideia, referências, contexto. */
  brought: z.array(z.string()).min(1),
  /** O esboço da composição. */
  sketch: z.object({ text: z.array(z.string()).default([]), photo: photoSchema.optional() }),
  /** Significado dos elementos da composição. */
  meaning: z.array(z.object({ element: z.string(), text: z.string() })).default([]),
  /** Evolução sessão por sessão. */
  sessionLog: z.array(sessionSchema).default([]),
  /** Fotos do resultado (a primeira é a capa e a prévia da lista). */
  photos: z.array(photoSchema).min(1),
})

export type ProjectPhotoData = z.infer<typeof photoSchema>
export type ProjectData = z.infer<typeof projectSchema>
