/**
 * Função da Vercel: recebe o formulário "Iniciar um projeto" e envia por e-mail pelo Resend.
 * Variáveis de ambiente (painel da Vercel, nunca no código):
 *   RESEND_API_KEY  chave da API do Resend
 *   BRIEFING_TO     e-mail que recebe os pedidos
 *   BRIEFING_FROM   remetente verificado no Resend (ex.: "Wabori <site@[DOMÍNIO]>")
 * Usada quando VITE_FORM_PROVIDER=email.
 */

const MAX_FILES = 5
const MAX_TOTAL = 4.4 * 1024 * 1024
const MAX_FIELD = 5000
const REQUIRED = ['Área do corpo', 'Escala', 'Ideia', 'Nome', 'E-mail', 'WhatsApp']

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

export async function POST(request: Request): Promise<Response> {
  const { RESEND_API_KEY, BRIEFING_TO, BRIEFING_FROM } = process.env
  if (!RESEND_API_KEY || !BRIEFING_TO || !BRIEFING_FROM) return json(500, { error: 'not-configured' })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return json(400, { error: 'bad-form' })
  }

  const fields: [string, string][] = []
  const files: File[] = []
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') {
      if (key.startsWith('_')) continue
      fields.push([key, value.slice(0, MAX_FIELD)])
    } else if (key === 'referencias') {
      files.push(value)
    }
  }

  const get = (k: string) => fields.find(([key]) => key === k)?.[1]?.trim() ?? ''
  if (REQUIRED.some((k) => !get(k))) return json(422, { error: 'missing-fields' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get('E-mail'))) return json(422, { error: 'bad-email' })
  if (files.length > MAX_FILES) return json(422, { error: 'too-many-files' })
  if (files.some((f) => !f.type.startsWith('image/'))) return json(422, { error: 'not-image' })
  if (files.reduce((s, f) => s + f.size, 0) > MAX_TOTAL) return json(413, { error: 'too-large' })

  const html = `
    <h2 style="font-family:Georgia,serif">Novo pedido de projeto</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${fields
        .map(
          ([k, v]) =>
            `<tr><th align="left" valign="top" style="border-bottom:1px solid #ddd">${escape(k)}</th>` +
            `<td style="border-bottom:1px solid #ddd;white-space:pre-wrap">${escape(v)}</td></tr>`,
        )
        .join('')}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#666">${files.length} imagem(ns) de referência em anexo.</p>`

  const attachments = await Promise.all(
    files.map(async (f, i) => ({
      filename: f.name || `referencia-${i + 1}.jpg`,
      content: Buffer.from(await f.arrayBuffer()).toString('base64'),
    })),
  )

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: BRIEFING_FROM,
      to: BRIEFING_TO.split(',').map((s) => s.trim()),
      reply_to: get('E-mail'),
      subject: `Novo projeto: ${get('Escala')} — ${get('Nome')}`.slice(0, 200),
      html,
      attachments,
    }),
  })

  if (!res.ok) return json(502, { error: 'send-failed' })
  return json(200, { ok: true })
}
