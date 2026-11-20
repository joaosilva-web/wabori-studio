import { Link, useParams } from 'react-router'
import { ProjectPhoto } from '../components/ProjectPhoto'
import { Reveal } from '../components/Reveal'
import { SectionMeta } from '../components/SectionMeta'
import { SessionTrack } from '../components/SessionTrack'
import { TextLink } from '../components/TextLink'
import { content, sectionPath } from '../content'
import { PHOTO_SIZES } from '../lib/images'
import { getNeighbors, getProject, type Project } from '../lib/projects'
import { usePageMeta } from '../lib/seo'
import { NotFound } from './NotFound'
import styles from './ProjectStudy.module.css'

const t = content.study
const ui = content.ui
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const formatMonth = (m?: string) => {
  if (!m) return undefined
  const [y, mo] = m.split('-')
  return `${MONTHS[Number(mo) - 1]}/${y}`
}

function period(p: Project) {
  const start = formatMonth(p.dates.start)
  const end = formatMonth(p.dates.end)
  if (!start) return '[A PREENCHER]'
  if (!end) return p.status === 'andamento' ? `desde ${start}` : start
  return `${start} — ${end}`
}

export function ProjectStudy() {
  const { slug = '' } = useParams()
  const project = getProject(slug)
  if (!project) return <NotFound />
  return <Study project={project} />
}

function Study({ project: p }: { project: Project }) {
  usePageMeta({
    title: `${p.title} — Projetos — Wabori`,
    description: p.summary,
    image: p.photos[0]?.image?.src,
  })
  const { prev, next } = getNeighbors(p.slug)
  const [cover, ...rest] = p.photos
  const healed = p.photos.filter((ph) => ph.state === 'cicatrizada')
  const results = healed.length ? healed : rest.length ? rest : p.photos

  return (
    <article>
      {/* Abertura do estudo */}
      <section className={`section ${styles.top}`} data-tone="light" aria-labelledby="projeto-titulo">
        <div className="container-wide">
          <SectionMeta
            section="projetos"
            label={content.projects.label}
            aside={`${p.areaLabel} · ${ui.projectStatus[p.status]}`}
          />
          <div className={styles.back}>
            <TextLink href={sectionPath.projetos} arrow={false}>
              ← {t.back}
            </TextLink>
          </div>

          {p.example && (
            <p className={styles.notice} role="note">
              {t.exampleNotice}
            </p>
          )}

          <Reveal>
            <h1 id="projeto-titulo" className={styles.title}>
              {p.title}
            </h1>
          </Reveal>

          <div className={styles.intro}>
            <ProjectPhoto
              className={styles.cover}
              image={cover.image}
              placeholder={cover.placeholder}
              alt={cover.alt}
              state={cover.state}
              framing={cover.framing}
              index={1}
              total={p.photos.length}
              sizes={PHOTO_SIZES.half}
              priority
            />
            <div className={styles.introText}>
              <dl className={styles.facts}>
                <div>
                  <dt>{t.facts.area}</dt>
                  <dd>{p.areaLabel}</dd>
                </div>
                <div>
                  <dt>{t.facts.scale}</dt>
                  <dd>{p.scale}</dd>
                </div>
                <div>
                  <dt>{t.facts.sessions}</dt>
                  <dd>{p.sessions}</dd>
                </div>
                <div>
                  <dt>{t.facts.period}</dt>
                  <dd>{period(p)}</dd>
                </div>
                <div>
                  <dt>{t.facts.status}</dt>
                  <dd>{ui.projectStatus[p.status]}</dd>
                </div>
              </dl>
              <div className={styles.prose}>
                {p.description.map((d) => (
                  <p key={d}>{d}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O que o cliente trouxe + esboço */}
      <section className="section" data-tone="light">
        <div className={`container-wide ${styles.split}`}>
          <Reveal className={styles.block}>
            <h2 className={styles.h2}>{t.brought}</h2>
            <div className={styles.prose}>
              {p.brought.map((b) => (
                <p key={b}>{b}</p>
              ))}
            </div>
          </Reveal>
          <Reveal className={styles.block} i={1}>
            <h2 className={styles.h2}>{t.sketch}</h2>
            <div className={styles.prose}>
              {p.sketch.text.map((s) => (
                <p key={s}>{s}</p>
              ))}
            </div>
            {p.sketch.photo && (
              <ProjectPhoto
                className={styles.sketchPhoto}
                image={p.sketch.photo.image}
                placeholder={p.sketch.photo.placeholder}
                alt={p.sketch.photo.alt}
                sizes={PHOTO_SIZES.half}
              />
            )}
          </Reveal>
        </div>
      </section>

      {/* Sessão por sessão */}
      {p.sessionLog.length > 0 && (
        <SessionTrack
          sessions={p.sessionLog}
          head={
            <h2 className={styles.h2} id="sessoes-titulo">
              {t.sessions}
            </h2>
          }
        />
      )}

      {/* Resultado cicatrizado */}
      <section className="section" data-tone="light" aria-labelledby="resultado-titulo">
        <div className="container-wide">
          <h2 id="resultado-titulo" className={`${styles.h2} ${styles.gap}`}>
            {t.healed}
          </h2>
          <div className={styles.grid}>
            {results.map((ph, i) => (
              <ProjectPhoto
                key={`${ph.file ?? ph.placeholder}-${i}`}
                image={ph.image}
                placeholder={ph.placeholder}
                alt={ph.alt}
                state={ph.state}
                framing={ph.framing}
                index={i + 1}
                total={results.length}
                sizes={PHOTO_SIZES.grid}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Significado dos elementos */}
      {p.meaning.length > 0 && (
        <section className="section" data-tone="dark" aria-labelledby="significado-titulo">
          <div className="container">
            <h2 id="significado-titulo" className={`${styles.h2} ${styles.gap}`}>
              {t.meaning}
            </h2>
            <Reveal as="dl" stagger className={styles.meaning}>
              {p.meaning.map((m) => (
                <div key={m.element} data-rv="">
                  <dt>{m.element}</dt>
                  <dd>{m.text}</dd>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* Anterior / próximo */}
      {prev && next && (
        <nav className={`container-wide ${styles.pager}`} aria-label={content.projects.label}>
          <Link to={prev.href} className={styles.pagerLink} rel="prev">
            <span className="lbl">← {t.prev}</span>
            <span className={styles.pagerTitle}>{prev.title}</span>
          </Link>
          <Link to={next.href} className={`${styles.pagerLink} ${styles.pagerNext}`} rel="next">
            <span className="lbl">
              {t.next} →
            </span>
            <span className={styles.pagerTitle}>{next.title}</span>
          </Link>
        </nav>
      )}
    </article>
  )
}
