import type { CSSProperties } from 'react'
import { Button } from '../components/Button'
import { Kaze } from '../components/Kaze'
import { Marquee } from '../components/Marquee'
import { ProcessRail } from '../components/ProcessRail'
import { ProjectList } from '../components/ProjectList'
import { ProjectPhoto } from '../components/ProjectPhoto'
import { Reveal } from '../components/Reveal'
import { SectionMeta } from '../components/SectionMeta'
import { WaboriSymbol } from '../components/Symbol'
import { TextLink } from '../components/TextLink'
import { content, pad2, sectionPath } from '../content'
import { PHOTO_SIZES } from '../lib/images'
import { getFeatured, toListItem } from '../lib/projects'
import { usePageMeta } from '../lib/seo'
import styles from './Home.module.css'

const { home, process } = content

export function Home() {
  usePageMeta(home.seo)
  const featured = getFeatured(3).map(toListItem)

  return (
    <>
      {/* 1. Capa */}
      <section className={styles.cover} data-tone="light" aria-labelledby="capa-titulo">
        <div className="container-wide">
          <div className={`lbl ${styles.bar}`}>
            {home.cover.meta.map((m, i) => (
              <span key={m} className={i ? 'muted' : undefined}>
                {m}
              </span>
            ))}
          </div>

          <h1 id="capa-titulo" className={styles.title}>
            <span className="sr-only">{home.cover.titleLabel}</span>
            {home.cover.title.map((line, i) => (
              <span key={i} className={styles.line} data-align={line.align} aria-hidden="true">
                <span className={styles.tx} style={{ '--i': i } as CSSProperties}>
                  {line.segments.map((seg, j) =>
                    'symbol' in seg ? (
                      <WaboriSymbol key={j} className={styles.titleSymbol} size=".86em" />
                    ) : (
                      <span key={j}>{seg.text}</span>
                    ),
                  )}
                </span>
              </span>
            ))}
          </h1>

          <div className={styles.after}>
            <p className={styles.lead}>{home.cover.lead}</p>
            <div className={styles.actions}>
              <Button href={sectionPath.iniciar}>{home.cover.primary}</Button>
              <Button href={sectionPath.projetos} variant="secondary">
                {home.cover.secondary}
              </Button>
            </div>
          </div>

          <div className={styles.photo}>
            <ProjectPhoto
              placeholder={home.cover.photo}
              alt={home.cover.photoAlt}
              state="cicatrizada"
              framing="corpo"
              ratio="3/2"
              ratioMobile="4/5"
              sizes={PHOTO_SIZES.hero}
              priority
            />
          </div>
        </div>
      </section>

      {/* 2. Kaze */}
      <Kaze />

      {/* 3. Ideia central */}
      <section className="section" data-tone="dark" aria-labelledby="ideia-titulo">
        <div className="container">
          <SectionMeta section="atelie" label={home.idea.label} aside={home.idea.aside} />
          <div className={styles.idea}>
            <Reveal>
              <h2 id="ideia-titulo" className={styles.h2}>
                {home.idea.title.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </h2>
            </Reveal>
            <Reveal i={1}>
              <p className={styles.ideaText}>{home.idea.paragraph}</p>
            </Reveal>
          </div>
          <Reveal as="ul" stagger className={styles.pillars}>
            {home.idea.pillars.map((p, i) => (
              <li key={p.title} className={styles.pillar} data-rv="">
                <span className={`lbl ${styles.pillarNum}`}>
                  {pad2(i + 1)}
                </span>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 4. Faixa em shu */}
      <Marquee items={home.marquee.items} label={home.marquee.label} />

      {/* 5. Projetos em destaque */}
      <section className="section" data-tone="light" aria-labelledby="destaques-titulo">
        <div className="container-wide">
          <SectionMeta section="projetos" label={home.featured.label} aside={home.featured.aside(featured.length)} />
          <div className={styles.head}>
            <Reveal>
              <h2 id="destaques-titulo" className={styles.h2}>
                {home.featured.title}
              </h2>
            </Reveal>
            <TextLink href={sectionPath.projetos} arrow="→">
              {home.featured.all}
            </TextLink>
          </div>
          <ProjectList items={featured} />
        </div>
      </section>

      {/* 6. Processo resumido */}
      <section className={`section ${styles.process}`} data-tone="light" aria-labelledby="processo-titulo">
        <div className="container-wide">
          <SectionMeta section="processo" label={home.process.label} aside={home.process.aside} />
          <div className={styles.head}>
            <Reveal>
              <h2 id="processo-titulo" className={styles.h2}>
                {process.title.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </h2>
            </Reveal>
            <TextLink href={sectionPath.processo} arrow="→">
              {home.process.more}
            </TextLink>
          </div>
          <ProcessRail />
        </div>
      </section>
      {/* 7. Chamada final e rodapé: no Layout */}
    </>
  )
}
