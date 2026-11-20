import { WaboriSymbol } from './Symbol'
import styles from './Wordmark.module.css'

type Props = {
  /** Mostra o símbolo à esquerda (assinatura horizontal). */
  withSymbol?: boolean
  /** Cor do símbolo: shu (marca) ou a mesma do texto. */
  symbolTone?: 'primary' | 'inherit'
  className?: string
}

/**
 * Assinatura: WABORI em Zen Old Mincho 900, caixa alta, letter-spacing .03em.
 * O símbolo mede 1,9 × a altura da caixa alta (cap height da Mincho = 0,726 em → 1,38 em).
 * O tamanho vem do font-size do pai.
 */
export function Wordmark({ withSymbol = true, symbolTone = 'primary', className }: Props) {
  return (
    <span className={`${styles.wordmark} ${className ?? ''}`}>
      {withSymbol && <WaboriSymbol className={`${styles.symbol} ${styles[symbolTone]}`} size="1.38em" />}
      <span className={styles.word}>WABORI</span>
    </span>
  )
}
