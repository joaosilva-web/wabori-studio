import { BriefingError, type BriefingAdapter } from './types'

/**
 * Simula o envio (padrão em desenvolvimento). Mostra o conteúdo no console.
 * Para ver o estado de erro, escreva "erro" no campo Cidade.
 */
export const sendMock: BriefingAdapter = async (data) => {
  await new Promise((r) => setTimeout(r, 1200))
  console.info('[briefing:mock]', Object.fromEntries([...data.entries()].map(([k, v]) => [k, v instanceof File ? `${v.name} (${v.size} B)` : v])))
  if (String(data.get('Cidade')).toLowerCase() === 'erro') throw new BriefingError('Erro simulado.')
}
