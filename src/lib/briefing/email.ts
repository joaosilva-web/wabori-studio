import { BriefingError, type BriefingAdapter } from './types'

/** E-mail: envia para a função /api/briefing (api/briefing.ts), que repassa pelo Resend. */
export const sendEmail: BriefingAdapter = async (data) => {
  const res = await fetch('/api/briefing', { method: 'POST', body: data })
  if (!res.ok) throw new BriefingError(`Falha no envio (${res.status}).`)
}
