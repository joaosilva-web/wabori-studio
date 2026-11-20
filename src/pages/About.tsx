import { Kaze } from '../components/Kaze'
import { ProjectPhoto } from '../components/ProjectPhoto'
import { Reveal } from '../components/Reveal'
import { SectionMeta } from '../components/SectionMeta'
import { TextLink } from '../components/TextLink'
import { content } from '../content'
import { PHOTO_SIZES } from '../lib/images'
import { usePageMeta } from '../lib/seo'
import styles from './About.module.css'

const t = content.about
const site = content.site

/**
 * Primeiro o ateliê e a filosofia, depois o artista.
 * Trajetória honesta: sem linhagem nem nome de horishi; máquina elétrica; tebori só como respeito à origem.
 */
export function About() {
  usePageMeta(t.seo)

  return (
    <>
      <section className="section" data-tone="light" aria-labelledby="sobre-titulo">
        <div className="container-wide">
          <SectionMeta section="sobre" label={t.label} aside={t.aside} />
          <Reveal>
            <h1 id="sobre-titulo" className={styles.title}>
              {t.title.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h1>
          </Reveal>

          <div className={styles.atelier}>
            <Reveal className={styles.text}>
              <h2 className={styles.h2}>{t.atelier.heading}</h2>
              {t.atelier.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </Reveal>
            <Reveal i={1}>
              <dl className={styles.facts}>
                {t.atelier.facts.map((f) => (
                  <div key={f.k}>
                    <dt>{f.k}</dt>
                    <dd>{f.v}</dd>
                  </div>
                ))}
                <div>
                  <dt>Instagram</dt>
                  <dd>
                    <TextLink href={site.instagramUrl}>{site.instagramHandle}</TextLink>
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      <Kaze />
      <section className="section" data-tone="dark" aria-labelledby="filosofia-titulo">
        <div className="container">
          <SectionMeta section="sobre" label={t.label} aside={t.philosophy.heading} />
          <div className={styles.philosophy}>
            <Reveal>
              <h2 id="filosofia-titulo" className={styles.h2}>
                {t.philosophy.heading}
              </h2>
            </Reveal>
            <Reveal i={1} className={styles.text}>
              {t.philosophy.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section" data-tone="light" aria-labelledby="artista-titulo">
        <div className="container-wide">
          <SectionMeta section="sobre" label={t.label} aside={t.artist.heading} />
          <div className={styles.artist}>
            <ProjectPhoto
              className={styles.portrait}
              placeholder={t.artist.photo}
              alt={t.artist.photoAlt}
              sizes={PHOTO_SIZES.half}
            />
            <Reveal className={styles.text}>
              <span className="lbl muted">{t.artist.heading}</span>
              <h2 id="artista-titulo" className={styles.name}>
                {t.artist.name}
              </h2>
              {t.artist.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
