import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import styles from './Field.module.css'

type ShellProps = {
  label: string
  hint?: ReactNode
  error?: string
  className?: string
  children: (a11y: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: true }) => ReactNode
}

/** Rótulo visível, dica e erro ligados ao controle por id. Nunca só placeholder. */
function FieldShell({ label, hint, error, className, children }: ShellProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined
  return (
    <div className={`${styles.field} ${className ?? ''}`} data-invalid={error ? '' : undefined}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  )
}

type Base = { label: string; hint?: ReactNode; error?: string; className?: string }

export function Field({ label, hint, error, className, ...input }: Base & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {(a11y) => <input className={styles.control} type="text" {...input} {...a11y} />}
    </FieldShell>
  )
}

export function TextArea({ label, hint, error, className, ...input }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {(a11y) => <textarea className={`${styles.control} ${styles.textarea}`} {...input} {...a11y} />}
    </FieldShell>
  )
}

type SelectProps = Base &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: readonly string[]
    placeholder?: string
  }

export function Select({ label, hint, error, className, options, placeholder, ...input }: SelectProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {(a11y) => (
        <span className={styles.selectWrap}>
          <select className={`${styles.control} ${styles.select}`} {...input} {...a11y}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <span className={styles.chevron} aria-hidden="true">
            ↓
          </span>
        </span>
      )}
    </FieldShell>
  )
}
