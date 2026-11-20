import { BriefingError, type BriefingAdapter } from './types'

/**
 * Formspree: POST direto do navegador. Defina VITE_FORMSPREE_ID (o código do formulário).
 * Atenção: anexos só funcionam nos planos pagos; no gratuito, as imagens são descartadas.
 */
export const sendFormspree: BriefingAdapter = async (data) => {
  const id = import.meta.env.VITE_FORMSPREE_ID as string | undefined
  if (!id) throw new BriefingError('VITE_FORMSPREE_ID não configurado.')
  const res = await fetch(`https://formspree.io/f/${id}`, {
    method: 'POST',
    body: data,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new BriefingError(`Falha no envio (${res.status}).`)
}
