/**
 * Camada de leitura dos projetos — o ÚNICO lugar que sabe de onde os projetos vêm.
 * Hoje: arquivos JSON em content/projects/<slug>/projeto.json, validados com zod no build.
 * Para plugar um CMS headless (Decap, Sanity…), troque só a fonte em `loadRaw` mantendo
 * os tipos `Project` / `ProjectPhoto`; os componentes não mudam.
 */
import { content } from '../content'
import type { ResponsiveImage } from './images'
import { projectSchema, type ProjectData, type ProjectPhotoData } from './projectSchema'
import imageManifest from './imageManifest.json'

export type ProjectPhoto = ProjectPhotoData & { image?: ResponsiveImage }

export type Project = Omit<ProjectData, 'photos' | 'sessionLog' | 'sketch' | 'sessions'> & {
  slug: string
  href: string
  sessions: number
  areaLabel: string
  photos: ProjectPhoto[]
  sketch: { text: string[]; photo?: ProjectPhoto }
  sessionLog: (ProjectData['sessionLog'][number] & { photo?: ProjectPhoto })[]
}

const manifest = imageManifest as Record<string, ResponsiveImage>

function loadRaw(): Record<string, unknown> {
  const files = import.meta.glob('/content/projects/*/projeto.json', { eager: true, import: 'default' })
  const out: Record<string, unknown> = {}
  for (const [path, data] of Object.entries(files)) {
    const slug = path.split('/').at(-2)!
    out[slug] = data
  }
  return out
}

function withImage(slug: string, photo: ProjectPhotoData): ProjectPhoto
function withImage(slug: string, photo: ProjectPhotoData | undefined): ProjectPhoto | undefined
function withImage(slug: string, photo: ProjectPhotoData | undefined): ProjectPhoto | undefined {
  if (!photo) return undefined
  const image = photo.file ? manifest[`${slug}/${photo.file}`] : undefined
  if (photo.file && !image && import.meta.env.DEV) {
    console.warn(`[projetos] ${slug}: a foto "${photo.file}" não foi processada. Rode npm run images.`)
  }
  return { ...photo, image }
}

function build(): Project[] {
  const raw = loadRaw()
  const list = Object.entries(raw).map(([slug, data]) => {
    const parsed = projectSchema.safeParse(data)
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.') || '(raiz)'}: ${i.message}`).join('\n')
      throw new Error(`Projeto "${slug}" inválido (content/projects/${slug}/projeto.json):\n${issues}`)
    }
    const p = parsed.data
    return {
      ...p,
      slug,
      href: `/projetos/${slug}`,
      sessions: p.sessions ?? p.sessionLog.length,
      areaLabel: content.projects.filters.areas[p.area],
      photos: p.photos.map((ph) => withImage(slug, ph)),
      sketch: { text: p.sketch.text, photo: withImage(slug, p.sketch.photo) },
      sessionLog: p.sessionLog.map((s) => ({ ...s, photo: withImage(slug, s.photo) })),
    } satisfies Project
  })

  return list.sort((a, b) => {
    if (a.order != null || b.order != null) return (a.order ?? Infinity) - (b.order ?? Infinity)
    return (b.dates.start ?? '').localeCompare(a.dates.start ?? '')
  })
}

const projects = build()

export const getProjects = () => projects
export const getProject = (slug: string) => projects.find((p) => p.slug === slug)

/** Destaques da home: os marcados com featured; se faltar, completa com os primeiros. */
export function getFeatured(n = 3) {
  const marked = projects.filter((p) => p.featured)
  return [...marked, ...projects.filter((p) => !p.featured)].slice(0, n)
}

/** Anterior e próximo na ordem da lista (circular). */
export function getNeighbors(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug)
  if (i < 0 || projects.length < 2) return { prev: undefined, next: undefined }
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  }
}

/** Formato da lista editorial / prévia. */
export const toListItem = (p: Project) => ({
  slug: p.slug,
  href: p.href,
  area: p.areaLabel,
  title: p.title,
  summary: p.summary,
  sessions: p.sessions,
  status: p.status,
  example: p.example,
  preview: p.photos[0]?.image,
  previewPlaceholder: p.photos[0]?.placeholder,
})
