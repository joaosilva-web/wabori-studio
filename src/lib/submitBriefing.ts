/**
 * Envio do formulário "Iniciar um projeto" — o único ponto que o formulário conhece.
 * O provedor vem de VITE_FORM_PROVIDER:
 *   email     → POST /api/briefing (função da Vercel que envia pelo Resend, com anexos)
 *   formspree → POST direto ao Formspree (VITE_FORMSPREE_ID); anexos só nos planos pagos
 *   mock      → simula o envio (padrão em desenvolvimento)
 * Para trocar de provedor, crie outro adaptador em ./briefing/ com a mesma assinatura.
 */
import { compressImage } from './compressImage'
import { sendEmail } from './briefing/email'
import { sendFormspree } from './briefing/formspree'
import { sendMock } from './briefing/mock'
import { BriefingError, type BriefingAdapter } from './briefing/types'

export { BriefingError }

export type Briefing = {
  area: string
  scale: string
  existing: string
  idea: string
  references: File[]
  availability: string
  city: string
  source: string
  name: string
  email: string
  whatsapp: string
  /** Armadilha anti-spam: campo invisível que pessoas não preenchem. */
  website?: string
}

/** Limite total dos anexos depois de comprimir (a função da Vercel aceita ~4,5 MB por requisição). */
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024

const adapters: Record<string, BriefingAdapter> = {
  email: sendEmail,
  formspree: sendFormspree,
  mock: sendMock,
}

function provider() {
  const configured = import.meta.env.VITE_FORM_PROVIDER as string | undefined
  if (configured) return configured
  if (import.meta.env.DEV) return 'mock'
  throw new BriefingError('VITE_FORM_PROVIDER não configurado.')
}

const LABELS: Record<keyof Omit<Briefing, 'references' | 'website'>, string> = {
  area: 'Área do corpo',
  scale: 'Escala',
  existing: 'Tatuagens na área',
  idea: 'Ideia',
  availability: 'Disponibilidade para várias sessões',
  city: 'Cidade',
  source: 'Como conheceu',
  name: 'Nome',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
}

export async function submitBriefing(b: Briefing) {
  // bots preenchem tudo: finge sucesso e não envia nada
  if (b.website) return

  const send = adapters[provider()]
  if (!send) throw new BriefingError(`Provedor de formulário desconhecido: ${provider()}`)

  const data = new FormData()
  for (const [key, label] of Object.entries(LABELS) as [keyof typeof LABELS, string][]) {
    data.append(label, b[key])
  }
  data.append('_replyto', b.email)
  data.append('_subject', `Novo projeto: ${b.scale} — ${b.name}`)

  const files = await Promise.all(b.references.map((f) => compressImage(f)))
  const total = files.reduce((sum, f) => sum + f.size, 0)
  if (total > MAX_TOTAL_BYTES) throw new BriefingError('As imagens somam mais do que o limite de envio.')
  files.forEach((f) => data.append('referencias', f, f.name))

  await send(data)
}
