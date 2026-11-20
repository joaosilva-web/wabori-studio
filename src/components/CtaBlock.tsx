import { content, sectionPath } from '../content'
import { Button } from './Button'
import { Kaze } from './Kaze'
import { Reveal } from './Reveal'
import { SectionMeta } from './SectionMeta'
import styles from './CtaBlock.module.css'

const { cta, site } = content

/** Convite final, no fim de toda página (menos a do formulário). Sumi, com Kaze na entrada. */
export function CtaBlock() {
  return (
    <>
      <Kaze />
      <section className={`section ${styles.cta}`} data-tone="dark" aria-labelledby="cta-title">
        <div className="container">
          <SectionMeta section="iniciar" label={cta.label} aside={`${site.place} · ${site.appointmentOnly}`} />
          <div className={styles.body}>
            <Reveal as="div">
              <h2 id="cta-title" className={styles.title}>
                {cta.title.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
            </Reveal>
            <Reveal as="div" i={1} className={styles.side}>
              <p className={styles.text}>{cta.text}</p>
              <Button href={sectionPath.iniciar} inverse>
                {cta.button}
              </Button>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
