/** Um adaptador recebe o FormData pronto e resolve quando o envio foi aceito. */
export type BriefingAdapter = (data: FormData) => Promise<void>

export class BriefingError extends Error {}
