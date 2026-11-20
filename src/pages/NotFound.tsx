import { Button } from '../components/Button'
import { SectionMeta } from '../components/SectionMeta'
import { content } from '../content'
import { usePageMeta } from '../lib/seo'

const t = content.notFound

export function NotFound() {
  usePageMeta({ ...t.seo, noindex: true })
  return (
    <section className="section" data-tone="light" aria-labelledby="nf-titulo">
      <div className="container">
        <SectionMeta section="atelie" label={t.label} />
        <h1 id="nf-titulo" style={{ fontSize: 'var(--text-hero)', margin: 'var(--space-6) 0 var(--space-5)' }}>
          {t.title}
        </h1>
        <Button href="/">{t.back}</Button>
      </div>
    </section>
  )
}
