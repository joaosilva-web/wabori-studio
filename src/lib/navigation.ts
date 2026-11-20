/**
 * Ponte entre o roteador (React) e código fora do React (transição de página, lib/pageTransition).
 * O App registra o navigate; quem não é componente navega por aqui.
 */
type Navigate = (to: string) => void

let navigate: Navigate | null = null

export const setNavigate = (fn: Navigate | null) => {
  navigate = fn
}
export const getNavigate = () => navigate
