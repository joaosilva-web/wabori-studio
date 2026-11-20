import { HeroProcess } from '../components/HeroProcess'
import { Kaze } from '../components/Kaze'
import { Marquee } from '../components/Marquee'
import { ProcessRail } from '../components/ProcessRail'
import { ProjectList } from '../components/ProjectList'
import { Reveal } from '../components/Reveal'
import { SectionMeta } from '../components/SectionMeta'
import { TextLink } from '../components/TextLink'
import { content, pad2, sectionPath } from '../content'
import { getFeatured, toListItem } from '../lib/projects'
import { usePageMeta } from '../lib/seo'
import styles from './Home.module.css'

const { home, process } = content

export function Home() {
  usePageMeta(home.seo)
  const featured = getFeatured(3).map(toListItem)

  return (
    <>
      {/* 1. Capa: o processo em vídeo, guiado pelo scroll */}
      <HeroProcess />

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
