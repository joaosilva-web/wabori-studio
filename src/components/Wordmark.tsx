import { WaboriSymbol } from './Symbol'
import styles from './Wordmark.module.css'

type Props = {
  /** Mostra o símbolo à esquerda (assinatura horizontal). */
  withSymbol?: boolean
  /** Cor do símbolo: shu (marca) ou a mesma do texto. */
  symbolTone?: 'primary' | 'inherit'
  /** Layout: inline (WABORI STUDIO em linha) ou stacked (WABORI / STUDIO empilhados). */
  layout?: 'inline' | 'stacked'
  className?: string
}

/**
 * Assinatura: WABORI STUDIO em Dela Gothic One 400, caixa alta, letter-spacing .03em.
 * O símbolo mede 1,9 × a altura da caixa alta (cap height da Gothic = ~0,72 em → ~1,37 em).
 * O tamanho vem do font-size do pai.
 */
export function Wordmark({ withSymbol = true, symbolTone = 'primary', layout = 'inline', className }: Props) {
  return (
    <span className={`${styles.wordmark} ${layout === 'stacked' ? styles.stacked : ''} ${className ?? ''}`}>
      {withSymbol && <WaboriSymbol className={`${styles.symbol} ${styles[symbolTone]}`} size="1.38em" />}
      {layout === 'stacked' ? (
        <span className={styles.words}>
          <span className={styles.word}>WABORI</span>
          <span className={styles.word}>STUDIO</span>
        </span>
      ) : (
        <span className={styles.word}>WABORI STUDIO</span>
      )}
    </span>
  )
}
