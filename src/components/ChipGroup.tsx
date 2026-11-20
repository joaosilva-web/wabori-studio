import { useId } from 'react'
import styles from './ChipGroup.module.css'

export type ChipOption = { value: string; label: string }

type Props = {
  legend: string
  name: string
  options: readonly ChipOption[]
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  /** Esconde a legenda visualmente (quando outro rótulo já está à vista, como nos filtros). */
  hideLegend?: boolean
  className?: string
}

/**
 * Escolha única em chips: radios de verdade (setas do teclado navegam, Espaço marca).
 * Selecionado em shu com texto washi.
 */
export function ChipGroup({ legend, name, options, value, onChange, required, error, hideLegend, className }: Props) {
  const errorId = useId()
  return (
    <fieldset
      className={`${styles.group} ${className ?? ''}`}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className={hideLegend ? 'sr-only' : styles.legend}>{legend}</legend>
      <div className={styles.chips}>
        {options.map((o) => (
          <label key={o.value} className={styles.chip}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              required={required}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </fieldset>
  )
}
