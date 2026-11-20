import { Wordmark } from '../components/Wordmark'
import { TextLink } from '../components/TextLink'

/** Provisória até a etapa 3 (home completa). */
export function Home() {
  return (
    <main className="container section" style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)' }}>
        <Wordmark />
      </h1>
      <p>Em construção.</p>
      {import.meta.env.DEV && <TextLink href="/dev/componentes" arrow="→">Ver componentes</TextLink>}
    </main>
  )
}
