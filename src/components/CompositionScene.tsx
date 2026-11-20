import { useRef, useState, type CSSProperties } from 'react'
import { content, pad2 } from '../content'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { useScrollProgress } from '../hooks/useScrollProgress'
import imageManifest from '../lib/imageManifest.json'
import type { ResponsiveImage } from '../lib/images'
import { Picture } from './Picture'
import { WaboriSymbol } from './Symbol'
import styles from './CompositionScene.module.css'

const t = content.process
const manifest = imageManifest as Record<string, ResponsiveImage>

/** Camadas do corpo-tela: quadros do mesmo vídeo da capa, em 4:5 (contorno → cor → completo). */
const LAYERS = ['hero-processo-01-contorno', 'hero-processo-02-cor', 'hero-processo-03-costas'] as const

/**
 * Cena 6 — como uma composição nasce (página Processo). Seção presa (~400 vh):
 * à esquerda as 5 etapas (a ativa em sumi, as outras em nezumi a 40%, com uma barra shu
 * de progresso); à direita, preso no centro, um corpo-tela kinari 4:5 em que a composição
 * se constrói por camadas — contorno (quadro 189), cor entrando (150) e completa (100) —
 * em crossfade, nunca vídeo. As opacidades saem de --p no CSS; o React só re-renderiza
 * quando a etapa ativa muda. Movimento reduzido: tudo empilhado, camadas completas.
 */
export function CompositionScene() {
  const reduced = useReducedMotion()
  const wrapperRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const steps = t.steps

  useScrollProgress(
    wrapperRef,
    stickyRef,
    (p) => {
      stickyRef.current?.style.setProperty('--p', p.toFixed(4))
      const i = Math.min(steps.length - 1, Math.floor(p * steps.length))
      if (i !== activeRef.current) setActive((activeRef.current = i))
    },
    !reduced,
  )

  return (
    <section ref={wrapperRef} className={styles.scene} data-tone="light" aria-label={t.canvas.label}>
      <div ref={stickyRef} className={styles.sticky}>
        <div className={`container-wide ${styles.grid}`}>
          <div className={styles.list}>
            <span className={styles.bar} aria-hidden="true" />
            <ol className={styles.steps}>
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className={styles.step}
                  data-active={i === active || undefined}
                  aria-current={i === active && !reduced ? 'step' : undefined}
                >
                  <span className={styles.num} aria-hidden="true">
                    {pad2(i + 1)}
                  </span>
                  <h2 className={styles.title}>
                    <span className="sr-only">{i + 1}. </span>
                    {s.title}
                  </h2>
                  <div className={styles.textWrap}>
                    <p className={styles.text}>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <figure className={styles.canvas}>
            <WaboriSymbol className={styles.seal} size={28} />
            {LAYERS.map((name, i) => {
              const img = manifest[`site/${name}-mobile.jpg`]
              return img ? (
                <div key={name} className={styles.layer} style={{ '--l': i } as CSSProperties}>
                  <Picture image={img} alt={i === LAYERS.length - 1 ? t.canvas.alt : ''} sizes="(max-width: 760px) 70vw, 40vw" className={styles.img} />
                </div>
              ) : null
            })}
          </figure>
        </div>
      </div>
    </section>
  )
}
