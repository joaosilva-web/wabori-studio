import { Faq } from '../components/Faq'
import { Kaze } from '../components/Kaze'
import { Reveal } from '../components/Reveal'
import { SectionMeta } from '../components/SectionMeta'
import { content, pad2 } from '../content'
import { usePageMeta } from '../lib/seo'
import styles from './Process.module.css'

const t = content.process

/** As 5 etapas em detalhe, quanto tempo leva, as dúvidas e os cuidados pós-sessão. */
export function Process() {
  usePageMeta(t.seo)

  return (
    <>
      <section className="section" data-tone="light" aria-labelledby="processo-titulo">
        <div className="container-wide">
          <SectionMeta section="processo" label={t.label} aside={t.aside} />
          <div className={styles.head}>
            <Reveal>
              <h1 id="processo-titulo" className={styles.title}>
                {t.title.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </h1>
            </Reveal>
            <Reveal i={1}>
              <p className={styles.lead}>{t.lead}</p>
            </Reveal>
          </div>

          <Reveal as="ol" stagger className={styles.steps}>
            {t.steps.map((s, i) => (
              <li key={s.title} className={styles.step} data-rv="">
                <span className={styles.num} aria-hidden="true">
                  {pad2(i + 1)}
                </span>
                <h2 className={styles.stepTitle}>
                  <span className="sr-only">{i + 1}. </span>
                  {s.title}
                </h2>
                <p className={styles.stepText}>{s.text}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <Kaze />
      <section className="section" data-tone="dark" aria-labelledby="tempo-titulo">
        <div className="container">
          <SectionMeta section="processo" label={t.label} aside={t.durations.label} />
          <h2 id="tempo-titulo" className="sr-only">
            {t.durations.label}
          </h2>
          <Reveal as="dl" stagger className={styles.durations}>
            {t.durations.items.map((d) => (
              <div key={d.title} className={styles.duration} data-rv="">
                <dt className="lbl">{d.title}</dt>
                <dd className={styles.durationValue}>{d.value}</dd>
                <dd className={styles.durationDetail}>{d.detail}</dd>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section" data-tone="light" id="duvidas" aria-labelledby="duvidas-titulo">
        <div className="container">
          <SectionMeta section="processo" label={t.label} aside={t.faq.label} />
          <h2 id="duvidas-titulo" className={styles.h2}>
            {t.faq.title}
          </h2>
          <Faq items={t.faq.items} />
        </div>
      </section>

      <section className="section" data-tone="light" id="cuidados" aria-labelledby="cuidados-titulo">
        <div className="container">
          <SectionMeta section="processo" label={t.label} aside={t.care.label} />
          <h2 id="cuidados-titulo" className={styles.h2}>
            {t.care.title}
          </h2>
          <p className={styles.lead}>{t.care.lead}</p>
          <Reveal as="ol" stagger className={styles.care}>
            {t.care.items.map((c, i) => (
              <li key={`${c.title}-${i}`} data-rv="">
                <span className={`lbl ${styles.careNum}`}>{pad2(i + 1)}</span>
                <h3 className={styles.careTitle}>{c.title}</h3>
                <p>{c.text}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  )
}
