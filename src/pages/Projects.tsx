import { useSearchParams } from 'react-router'
import { ChipGroup } from '../components/ChipGroup'
import { ProjectList } from '../components/ProjectList'
import { Reveal } from '../components/Reveal'
import { SectionMeta } from '../components/SectionMeta'
import { content } from '../content'
import { getProjects, toListItem, type Project } from '../lib/projects'
import { usePageMeta } from '../lib/seo'
import styles from './Projects.module.css'

const t = content.projects
const ALL = 'todos'

const areaOptions = [
  { value: ALL, label: t.filters.all },
  ...(Object.entries(t.filters.areas) as [Project['area'], string][]).map(([value, label]) => ({ value, label })),
]
const statusOptions = [
  { value: ALL, label: t.filters.all },
  ...(Object.entries(content.ui.projectStatus) as [Project['status'], string][]).map(([value, label]) => ({ value, label })),
]

/** Lista editorial com filtros por área e estado (chips). O filtro fica na URL: ?area=costas&estado=concluido */
export function Projects() {
  usePageMeta(t.seo)
  const [params, setParams] = useSearchParams()
  const area = params.get('area') ?? ALL
  const status = params.get('estado') ?? ALL

  const all = getProjects()
  const filtered = all.filter(
    (p) => (area === ALL || p.area === area) && (status === ALL || p.status === status),
  )

  const set = (key: 'area' | 'estado', value: string) => {
    const next = new URLSearchParams(params)
    if (value === ALL) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  return (
    <section className="section" data-tone="light" aria-labelledby="projetos-titulo">
      <div className="container-wide">
        <SectionMeta section="projetos" label={t.label} aside={t.aside(all.length)} />
        <div className={styles.head}>
          <Reveal>
            <h1 id="projetos-titulo" className={styles.title}>
              {t.title}
            </h1>
          </Reveal>
          <Reveal i={1}>
            <p className={styles.lead}>{t.lead}</p>
          </Reveal>
        </div>

        <div className={styles.filters}>
          <ChipGroup legend={t.filters.area} name="area" options={areaOptions} value={area} onChange={(v) => set('area', v)} />
          <ChipGroup
            legend={t.filters.status}
            name="estado"
            options={statusOptions}
            value={status}
            onChange={(v) => set('estado', v)}
          />
          <p className={styles.count} aria-live="polite">
            {t.results(filtered.length)}
          </p>
        </div>

        {filtered.length ? (
          // key: a lista remonta ao filtrar, e as linhas entram de novo em sequência
          <ProjectList key={`${area}-${status}`} items={filtered.map(toListItem)} headingLevel="h2" />
        ) : (
          <p className={styles.empty}>{t.empty}</p>
        )}
      </div>
    </section>
  )
}
