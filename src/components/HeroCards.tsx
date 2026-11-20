import { Fragment, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, type CSSProperties } from 'react'
import { content, pad2, sectionPath } from '../content'
import { CALLOUT_POINTS, segmentProgress, stepAt, VIDEO_SIZE } from '../lib/heroFrames'
import { Button } from './Button'
import styles from './HeroCards.module.css'

const t = content.home.cover

/** Posição do vídeo na tela (object-fit: cover, object-position 50% 40%). */
const OBJECT_POSITION = { x: 0.5, y: 0.4 }
/** Quanto o cartão sobe ao longo do trecho ("respira") — o mesmo valor do CSS. */
const BREATHE = 24
/** Lado de cada cartão no desktop: a linha sai da borda voltada para o corpo. */
const SIDES = ['right', 'left', 'right', 'left'] as const

export type HeroCardsHandle = { update: (p: number) => void }

type Props = {
  /** Etapa ativa (0 = título, 1–3 = cartões, 4 = chamada final). */
  step: number
  onFinalFocus: () => void
}

/** Letras para a entrada por trás da máscara (espaço vira espaço fixo: inline-block não colapsa). */
const letters = (s: string) => [...s].map((ch) => (ch === ' ' ? ' ' : ch))
const words = (s: string) => s.split(/\s+/)

/**
 * Cena 2 — cartões das etapas como anotações sobre o corpo (desenho técnico).
 * Cada cartão tem o seu lugar (alternando os lados) e uma linha de chamada até um ponto
 * do corpo (só desktop). Entrada em camadas: a borda se desenha, o fundo washi sobe,
 * o número roda como odômetro, o rótulo entra letra por letra e o texto palavra por palavra.
 * O cartão que sai vai primeiro (300 ms); o próximo espera. Tudo por transições CSS sobre
 * data-active; por frame só --sp (progresso no trecho) no cartão ativo e o d da linha dele.
 */
export const HeroCards = forwardRef<HeroCardsHandle, Props>(function HeroCards({ step, onFinalFocus }, ref) {
  const listRef = useRef<HTMLOListElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const geo = useRef<{ ax: number; ay: number; px: number; py: number; ok: boolean }[]>([])
  const sp = useRef([0, 0, 0, 0])

  const drawLine = useCallback((i: number) => {
    const g = geo.current[i]
    const group = svgRef.current?.children[i] as SVGGElement | undefined
    const path = group?.querySelector('path')
    const dot = group?.querySelector('g')
    if (!g || !group || !path || !dot) return
    const ay = g.ay - sp.current[i] * BREATHE
    path.setAttribute('d', `M${g.ax.toFixed(1)} ${ay.toFixed(1)} L${g.px.toFixed(1)} ${g.py.toFixed(1)}`)
    dot.setAttribute('transform', `translate(${g.px.toFixed(1)} ${g.py.toFixed(1)})`)
    group.toggleAttribute('data-off', !g.ok)
  }, [])

  // Geometria das linhas: pontos do vídeo → tela (cover + object-position), borda do cartão.
  const layout = useCallback(() => {
    const list = listRef.current
    const svg = svgRef.current
    if (!list || !svg) return
    const box = list.getBoundingClientRect()
    const W = box.width
    const H = box.height
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    const s = Math.max(W / VIDEO_SIZE.w, H / VIDEO_SIZE.h)
    const offX = (W - VIDEO_SIZE.w * s) * OBJECT_POSITION.x
    const offY = (H - VIDEO_SIZE.h * s) * OBJECT_POSITION.y
    const cards = [...list.children] as HTMLElement[]
    geo.current = CALLOUT_POINTS.map(([vx, vy], i) => {
      const r = cards[i]?.getBoundingClientRect()
      const px = offX + vx * s
      const py = offY + vy * s
      if (!r) return { ax: 0, ay: 0, px, py, ok: false }
      const ax = (SIDES[i] === 'right' ? r.left : r.right) - box.left
      const ay = r.top + r.height / 2 - box.top
      // fora da tela, ou o ponto atrás do próprio cartão: sem linha
      const inside = px > 8 && px < W - 8 && py > 8 && py < H - 8
      const clear = SIDES[i] === 'right' ? px < ax - 24 : px > ax + 24
      return { ax, ay, px, py, ok: inside && clear }
    })
    geo.current.forEach((_, i) => drawLine(i))
  }, [drawLine])

  useEffect(() => {
    // sem medir já na hidratação (forçaria layout): o primeiro callback do ResizeObserver
    // chega depois do layout natural da página
    const ro = new ResizeObserver(layout)
    if (listRef.current) ro.observe(listRef.current)
    document.fonts?.ready.then(layout)
    return () => ro.disconnect()
  }, [layout])

  useImperativeHandle(
    ref,
    () => ({
      update(p) {
        const s = stepAt(p)
        if (s < 1) return
        const i = s - 1
        const v = segmentProgress(p)
        if (Math.abs(v - sp.current[i]) < 0.0005) return
        sp.current[i] = v
        const card = listRef.current?.children[i] as HTMLElement | undefined
        card?.style.setProperty('--sp', v.toFixed(4))
        if (i < CALLOUT_POINTS.length) drawLine(i)
      },
    }),
    [drawLine],
  )

  return (
    <>
      {/* linhas de chamada: por cima do vídeo, sem pegar clique (só desktop) */}
      <svg ref={svgRef} className={styles.callouts} aria-hidden="true" focusable="false">
        {CALLOUT_POINTS.map((_, i) => (
          <g key={i} className={styles.callout} data-active={step === i + 1 || undefined}>
            <path pathLength={1} />
            <g>
              <circle className={styles.pulse} r="5" />
              <circle className={styles.dot} r="5" />
            </g>
          </g>
        ))}
      </svg>

      <ol ref={listRef} className={styles.cards}>
        {t.steps.map((s, i) => (
          <li
            key={s.label}
            className={styles.card}
            data-pos={i + 1}
            data-side={SIDES[i]}
            data-active={step === i + 1 || undefined}
          >
            <span className={styles.giant} aria-hidden="true">
              {pad2(i + 1)}
            </span>
            <div className={styles.sheet}>
              <Border />
              <span className={styles.bg} aria-hidden="true" />
              <div className={styles.content}>
                <span className="sr-only">
                  {pad2(i + 1)}. {s.label}. {s.text}
                </span>
                <Odometer n={i + 1} />
                <span className={`lbl ${styles.label}`} aria-hidden="true">
                  {letters(s.label).map((ch, k) => (
                    <span key={k} className={styles.ch} style={{ '--k': k } as CSSProperties}>
                      {ch}
                    </span>
                  ))}
                </span>
                <p className={styles.text} aria-hidden="true">
                  {words(s.text).map((w, k) => (
                    <Fragment key={k}>
                      <span className={styles.word} style={{ '--k': k } as CSSProperties}>
                        {w}
                      </span>{' '}
                    </Fragment>
                  ))}
                </p>
              </div>
              <span className={styles.bar} aria-hidden="true" />
            </div>
          </li>
        ))}

        <li className={`${styles.card} ${styles.final}`} data-pos={4} data-side="left" data-active={step === 4 || undefined} onFocus={onFinalFocus}>
          <div className={styles.sheet}>
            <Border />
            <span className={styles.bg} aria-hidden="true" />
            <div className={styles.content}>
              <p className={styles.finalTitle}>
                <span className="sr-only">{t.final}</span>
                <span aria-hidden="true">
                  {words(t.final).map((w, k) => (
                    <Fragment key={k}>
                      <span className={styles.word} style={{ '--k': k } as CSSProperties}>
                        {w}
                      </span>{' '}
                    </Fragment>
                  ))}
                </span>
              </p>
              <span className={styles.rule} aria-hidden="true" />
              <div className={styles.actions}>
                <Button href={sectionPath.iniciar}>{t.primary}</Button>
                <Button href={sectionPath.projetos} variant="secondary">
                  {t.secondary}
                </Button>
              </div>
            </div>
          </div>
        </li>
      </ol>
    </>
  )
})

/** O contorno do cartão, desenhado como traço (os 4 lados em sequência). */
function Border() {
  return (
    <svg className={styles.border} aria-hidden="true" focusable="false">
      <rect x="0.5" y="0.5" pathLength={1} />
    </svg>
  )
}

const REEL = '0\n1\n2\n3\n4\n5\n6\n7\n8\n9'

/** Número em odômetro: dois dígitos que rolam na vertical de 00 até o número da etapa. */
function Odometer({ n }: { n: number }) {
  const digits = pad2(n).split('').map(Number)
  return (
    <span className={styles.num} aria-hidden="true">
      {digits.map((d, i) => (
        <span key={i} className={styles.digit}>
          {/* um texto só com 0–9 em linhas (menos nós no DOM) */}
          <span className={styles.reel} style={{ '--d': d } as CSSProperties}>
            {REEL}
          </span>
        </span>
      ))}
    </span>
  )
}
