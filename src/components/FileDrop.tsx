import { useEffect, useId, useMemo, useState, type DragEvent } from 'react'
import { content } from '../content'
import styles from './FileDrop.module.css'

type Props = {
  label: string
  hint?: string
  files: File[]
  onChange: (files: File[]) => void
  max?: number
  /** Tamanho máximo por arquivo, em MB. */
  maxMB?: number
  accept?: string
}

const t = content.ui.fileDrop

/**
 * Upload de imagens: input de arquivo de verdade (teclado e leitor de tela) + área de soltar.
 * Mostra miniaturas, permite remover e valida quantidade, tipo e tamanho.
 */
export function FileDrop({
  label,
  hint,
  files,
  onChange,
  max = 5,
  maxMB = 10,
  accept = 'image/jpeg,image/png,image/webp,image/heic,image/avif',
}: Props) {
  const id = useId()
  const [error, setError] = useState<string>()
  const [over, setOver] = useState(false)

  const previews = useMemo(() => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })), [files])
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews])

  const add = (incoming: FileList | File[]) => {
    const list = [...incoming]
    for (const f of list) {
      if (!f.type.startsWith('image/')) return setError(t.notImage(f.name))
      if (f.size > maxMB * 1024 * 1024) return setError(t.tooBig(f.name, maxMB))
    }
    const next = [...files, ...list.filter((f) => !files.some((g) => g.name === f.name && g.size === f.size))]
    if (next.length > max) return setError(t.tooMany(max))
    setError(undefined)
    onChange(next)
  }

  const remove = (file: File) => {
    setError(undefined)
    onChange(files.filter((f) => f !== file))
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    if (e.dataTransfer.files.length) add(e.dataTransfer.files)
  }

  const full = files.length >= max
  const describedBy = [`${id}-hint`, error ? `${id}-error` : null].filter(Boolean).join(' ')

  return (
    <div className={styles.field}>
      <span className={styles.label} id={`${id}-label`}>
        {label}
      </span>
      <div
        className={styles.zone}
        data-over={over || undefined}
        onDragOver={(e) => {
          e.preventDefault()
          if (!full) setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <input
          id={id}
          className={styles.input}
          type="file"
          accept={accept}
          multiple
          disabled={full}
          aria-labelledby={`${id}-label ${id}-cta`}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            if (e.target.files) add(e.target.files)
            e.target.value = ''
          }}
        />
        <label htmlFor={id} id={`${id}-cta`} className={styles.cta} aria-disabled={full || undefined}>
          {t.cta}
        </label>
        <span className={styles.or} aria-hidden="true">
          {t.or}
        </span>
        <span className={styles.count}>{t.count(files.length, max)}</span>
      </div>

      <span id={`${id}-hint`} className={styles.hint}>
        {hint ? `${hint} ` : ''}
        {t.limit(max)}
      </span>
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}

      {previews.length > 0 && (
        <ul className={styles.list}>
          {previews.map(({ file, url }) => (
            <li key={url} className={styles.item}>
              <img src={url} alt="" width={64} height={80} className={styles.thumb} />
              <span className={styles.name}>{file.name}</span>
              <button type="button" className={styles.remove} onClick={() => remove(file)} aria-label={t.remove(file.name)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
