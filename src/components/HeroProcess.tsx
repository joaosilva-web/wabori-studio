import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react'
import { content } from '../content'
import { MOBILE, REDUCED_MOTION, useReducedMotion } from '../hooks/useMediaQuery'
import { scrollYForProgress, useScrollProgress } from '../hooks/useScrollProgress'
import { frameAt, imageAt, MARKS, markAt, stepAt } from '../lib/heroFrames'
import imageManifest from '../lib/imageManifest.json'
import type { ResponsiveImage } from '../lib/images'
import { isConstrainedNetwork, whenIdle, whenIntroDone, whenLoaded } from '../lib/intro'
import { scrollToTarget } from '../lib/smoothScroll'
import type { Scrubber } from '../lib/videoScrub'
import { HeroCards, type HeroCardsHandle } from './HeroCards'
import { WaboriSymbol } from './Symbol'
import styles from './HeroProcess.module.css'

const t = content.home.cover
const manifest = imageManifest as Record<string, ResponsiveImage>

const VIDEO = { desktop: '/video/wabori-processo-1280.mp4', mobile: '/video/wabori-processo-576x720.mp4' }
const FRAMES = [
  { name: 'hero-processo-01-contorno', alt: t.alt.contorno },
  { name: 'hero-processo-02-cor', alt: t.alt.cor },
  { name: 'hero-processo-03-costas', alt: t.alt.costas },
  { name: 'hero-processo-04-final', alt: t.alt.final },
] as const

/** poster = só o quadro do contorno · video = busca pelo scroll · images = 4 quadros em crossfade */
type Mode = 'poster' | 'video' | 'images'

const isSafari = () => /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)

/**
 * Cena 2 — a capa conta o processo em vídeo, guiado pelo scroll (seção presa, 500 vh / 350 vh).
 * O vídeo original vai da peça completa ao contorno; aqui ele roda de trás para frente conforme
 * a pessoa desce: do contorno (quadro 189) à peça completa (quadro 0).
 *
 * - O LCP é o título ou o pôster (quadro do contorno, AVIF/WebP com fetchpriority high).
 * - O vídeo só baixa depois da hidratação, do load e da abertura. O loop de busca vem por import().
 * - Economia de dados, 2g ou falha na busca: modo de imagens (4 quadros em crossfade).
 * - Movimento reduzido: nada preso, pôster final e legendas empilhadas (decidido no CSS).
 * - O markup é o mesmo no servidor e no cliente; o JS só liga o progresso e troca o modo.
 */
export function HeroProcess() {
  const reduced = useReducedMotion()
  const wrapperRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scrubRef = useRef<Scrubber | null>(null)
  const cardsRef = useRef<HeroCardsHandle>(null)
  const progress = useRef(0)
  const visible = useRef(false)
  const modeRef = useRef<Mode>('poster')

  const [mode, setModeState] = useState<Mode>('poster')
  const [step, setStep] = useState(0)
  const [mark, setMark] = useState(0)
  const [image, setImage] = useState(0)
  const stepRef = useRef(0)
  const markRef = useRef(0)
  const imageRef = useRef(0)

  const setMode = (m: Mode) => {
    modeRef.current = m
    setModeState(m)
    if (m === 'images') {
      imageRef.current = imageAt(progress.current)
      setImage(imageRef.current)
    }
  }

  useScrollProgress(
    wrapperRef,
    stickyRef,
    (p) => {
      progress.current = p
      stickyRef.current?.style.setProperty('--p', p.toFixed(4))
      const s = stepAt(p)
      if (s !== stepRef.current) setStep((stepRef.current = s))
      const m = markAt(p)
      if (m !== markRef.current) setMark((markRef.current = m))
      if (modeRef.current === 'images') {
        const i = imageAt(p)
        if (i !== imageRef.current) setImage((imageRef.current = i))
      }
      scrubRef.current?.setTarget(frameAt(p))
      cardsRef.current?.update(p)
    },
    !reduced,
    {
      onVisible: (v) => {
        visible.current = v
        scrubRef.current?.setActive(v)
      },
    },
  )

  // Header transparente enquanto a cena está sob ele.
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const html = document.documentElement
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) html.dataset.overHero = ''
        else delete html.dataset.overHero
      },
      { rootMargin: '0px 0px -99% 0px' },
    )
    io.observe(wrapper)
    return () => {
      io.disconnect()
      delete html.dataset.overHero
    }
  }, [])

  // Vídeo: decide o modo e carrega só depois da primeira pintura, do load e da abertura.
  useEffect(() => {
    const video = videoRef.current
    if (!video || window.matchMedia(REDUCED_MOTION).matches) return
    if (isConstrainedNetwork()) {
      setMode('images')
      return
    }

    let cancelled = false
    const cleanups: (() => void)[] = []
    const fail = () => {
      if (cancelled) return
      scrubRef.current?.dispose()
      scrubRef.current = null
      video.removeAttribute('src')
      video.load()
      setMode('images')
    }

    const mobile = window.matchMedia(MOBILE)
    const source = () => (mobile.matches ? VIDEO.mobile : VIDEO.desktop)

    const start = async () => {
      await whenLoaded()
      await whenIntroDone()
      await whenIdle()
      if (cancelled) return

      video.addEventListener('error', fail, { once: true })
      cleanups.push(() => video.removeEventListener('error', fail))
      video.preload = 'auto'
      video.src = source()
      video.load()

      const [{ createScrubber }] = await Promise.all([
        import('../lib/videoScrub'),
        new Promise<void>((resolve) => {
          if (video.readyState >= 2) resolve()
          else video.addEventListener('loadeddata', () => resolve(), { once: true })
        }),
      ])
      if (cancelled || modeRef.current === 'images') return

      const scrub = createScrubber(video, frameAt(progress.current), fail)
      scrubRef.current = scrub
      // o vídeo só aparece por cima do pôster quando o primeiro quadro buscado estiver pintado
      video.addEventListener('seeked', () => !cancelled && modeRef.current === 'poster' && setMode('video'), {
        once: true,
      })
      scrub.setActive(visible.current)
      scrub.setTarget(frameAt(progress.current))

      // Safari só libera a busca depois de um play() iniciado por gesto/scroll
      if (isSafari()) {
        const unlock = () => {
          video.play().then(() => video.pause(), () => {})
          off()
        }
        const events = ['pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown'] as const
        const off = () => events.forEach((ev) => window.removeEventListener(ev, unlock))
        events.forEach((ev) => window.addEventListener(ev, unlock, { passive: true, once: true }))
        cleanups.push(off)
      }

      // atravessou o limite de 760 px: troca o arquivo e continua do mesmo quadro
      const swap = () => {
        video.src = source()
        video.load()
        video.addEventListener('loadeddata', () => scrubRef.current?.setTarget(frameAt(progress.current) + 0.001), {
          once: true,
        })
      }
      mobile.addEventListener('change', swap)
      cleanups.push(() => mobile.removeEventListener('change', swap))
    }

    start().catch(fail)
    return () => {
      cancelled = true
      cleanups.forEach((c) => c())
      scrubRef.current?.dispose()
      scrubRef.current = null
    }
  }, [])

  const goTo = (i: number) => {
    const wrapper = wrapperRef.current
    const sticky = stickyRef.current
    if (!wrapper || !sticky) return
    // um pouco depois do início do trecho, para a legenda já estar entrando
    scrollToTarget(scrollYForProgress(wrapper, sticky, i === 0 ? 0 : MARKS[i] + 0.02))
  }

  /** Teclado: o foco nos botões da chamada final leva a cena até ela. */
  const onFinalFocus = () => {
    if (reduced || stepRef.current === 4) return
    const wrapper = wrapperRef.current
    const sticky = stickyRef.current
    if (wrapper && sticky) scrollToTarget(scrollYForProgress(wrapper, sticky, 0.95), { immediate: true })
  }

  return (
    <section
      ref={wrapperRef}
      className={styles.hero}
      data-mode={mode}
      data-step={step}
      aria-labelledby="capa-titulo"
      data-tone="light"
    >
      <div ref={stickyRef} className={styles.sticky}>
        <div className={styles.media}>
          {FRAMES.map((f, i) => (
            <HeroFrame
              key={f.name}
              name={f.name}
              alt={i === 0 || i === 3 ? f.alt : ''}
              priority={i === 0}
              className={i === 0 ? styles.poster : i === 3 ? `${styles.frame} ${styles.final}` : styles.frame}
              active={mode === 'images' && i === image}
            />
          ))}
          <video
            ref={videoRef}
            className={styles.video}
            muted
            playsInline
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>

        <div className={`lbl ${styles.tag}`}>
          <WaboriSymbol className={styles.seal} size={22} />
          <span>{t.label}</span>
        </div>

        <h1 id="capa-titulo" className={styles.title}>
          <span className="sr-only">{t.titleLabel}</span>
          {t.title.map((line, i) => (
            <span key={i} className={styles.line} aria-hidden="true">
              {line.map((f, j) => (
                <Fragment key={f.text}>
                  {j > 0 && f.from !== 'stamp' && ' '}
                  {/* cada fragmento na sua máscara; o ponto (carimbo) fica fora, para o anel crescer */}
                  <span className={f.from === 'stamp' ? undefined : styles.mask}>
                    <span className={styles.frag} data-from={f.from}>
                      {f.from === 'right'
                        ? [...f.text].map((ch, k) => (
                            <span key={k} className={styles.ch} style={{ '--k': k } as CSSProperties}>
                              {ch}
                            </span>
                          ))
                        : f.text}
                    </span>
                  </span>
                </Fragment>
              ))}
            </span>
          ))}
        </h1>

        <p className={styles.tagline} aria-hidden="true">{t.tagline}</p>

        <HeroCards ref={cardsRef} step={step} onFinalFocus={onFinalFocus} />

        <nav className={styles.ruler} aria-label={t.ruler.label} style={{ '--marks': MARKS.length } as CSSProperties}>
          <span className={styles.rulerFill} aria-hidden="true" />
          <ol>
            {t.ruler.marks.map((m, i) => (
              <li key={m}>
                <button
                  type="button"
                  className={styles.mark}
                  aria-current={mark === i ? 'step' : undefined}
                  aria-label={t.ruler.goTo(m)}
                  onClick={() => goTo(i)}
                >
                  <span aria-hidden="true">{m}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  )
}

type FrameProps = { name: string; alt: string; priority: boolean; className: string; active: boolean }

/** Um quadro do vídeo: arquivo 16:9 no desktop e recorte 4:5 no celular (mesmo markup). */
function HeroFrame({ name, alt, priority, className, active }: FrameProps) {
  const d = manifest[`site/${name}.jpg`]
  const m = manifest[`site/${name}-mobile.jpg`]
  if (!d) return null
  return (
    <picture>
      {m && <source media={MOBILE} type="image/avif" srcSet={m.avif} sizes="100vw" />}
      {m && <source media={MOBILE} type="image/webp" srcSet={m.webp} sizes="100vw" />}
      <source type="image/avif" srcSet={d.avif} sizes="100vw" />
      <source type="image/webp" srcSet={d.webp} sizes="100vw" />
      <img
        src={d.src}
        alt={alt}
        width={d.width}
        height={d.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        className={className}
        data-active={active || undefined}
      />
    </picture>
  )
}
