import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { ChipGroup } from '../components/ChipGroup'
import { Field, Select, TextArea } from '../components/Field'
import { FileDrop } from '../components/FileDrop'
import { Reveal } from '../components/Reveal'
import { SectionMeta } from '../components/SectionMeta'
import { content } from '../content'
import { usePageMeta } from '../lib/seo'
import { submitBriefing, type Briefing } from '../lib/submitBriefing'
import styles from './StartProject.module.css'

const t = content.start
const f = t.fields
const ui = content.ui

type Values = Omit<Briefing, 'references'>
type Errors = Partial<Record<keyof Values, string>>
type Status = 'idle' | 'sending' | 'success' | 'error'

const EMPTY: Values = {
  area: '',
  scale: '',
  existing: '',
  idea: '',
  availability: '',
  city: '',
  source: '',
  name: '',
  email: '',
  whatsapp: '',
  website: '',
}

const yesNo = [
  { value: ui.yes, label: ui.yes },
  { value: ui.no, label: ui.no },
]
const scaleOptions = f.scale.options.map((o) => ({ value: o, label: o }))

function validate(v: Values): Errors {
  const e: Errors = {}
  const req = (k: keyof Values, msg = t.errors.required) => {
    if (!v[k]?.trim()) e[k] = msg
  }
  req('area', t.errors.choose)
  req('scale', t.errors.choose)
  req('existing', t.errors.choose)
  req('idea')
  req('availability', t.errors.choose)
  req('city')
  req('name')
  req('email')
  req('whatsapp')
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = t.errors.email
  const digits = v.whatsapp.replace(/\D/g, '')
  if (v.whatsapp && (digits.length < 10 || digits.length > 13)) e.whatsapp = t.errors.phone
  return e
}

/**
 * Formulário de triagem. Todo campo tem rótulo visível; erros ligados ao campo (aria-describedby)
 * e o foco vai para o primeiro campo com erro. O envio passa por lib/submitBriefing.
 * Sem preço em lugar nenhum.
 */
export function StartProject() {
  usePageMeta(t.seo)
  const [values, setValues] = useState<Values>(EMPTY)
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [attempt, setAttempt] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const set = (k: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [k]: value }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }
  const bind = (k: keyof Values) => ({
    name: k,
    value: values[k],
    onChange: (e: { target: { value: string } }) => set(k)(e.target.value),
    error: errors[k],
  })

  // depois de uma tentativa com erro, o foco vai para o primeiro campo inválido
  useEffect(() => {
    if (!attempt) return
    const el = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
    if (!el) return
    const target = el.tagName === 'FIELDSET' ? el.querySelector<HTMLElement>('input') : el
    target?.focus()
  }, [attempt])

  useEffect(() => {
    if (status === 'success' || status === 'error') resultRef.current?.focus()
  }, [status])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    const found = validate(values)
    setErrors(found)
    if (Object.values(found).some(Boolean)) {
      setAttempt((n) => n + 1)
      return
    }
    setStatus('sending')
    try {
      await submitBriefing({ ...values, references: files })
      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  const reset = () => {
    setValues(EMPTY)
    setFiles([])
    setErrors({})
    setStatus('idle')
  }

  const hasErrors = Object.values(errors).some(Boolean)

  return (
    <section className="section" data-tone="light" aria-labelledby="iniciar-titulo">
      <div className="container-wide">
        <SectionMeta section="iniciar" label={t.label} aside={t.aside} />
        <div className={styles.layout}>
          <div className={styles.aside}>
            <Reveal>
              <h1 id="iniciar-titulo" className={styles.title}>
                {t.title.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </h1>
            </Reveal>
            <Reveal i={1}>
              <p className={styles.intro}>{t.intro}</p>
            </Reveal>
          </div>

          {status === 'success' ? (
            <div ref={resultRef} tabIndex={-1} className={styles.result} role="status">
              <h2 className={styles.resultTitle}>{t.success.title}</h2>
              <p>{t.success.text}</p>
              <Button variant="secondary" onClick={reset}>
                {t.success.again}
              </Button>
            </div>
          ) : (
            <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate aria-describedby="aviso-orcamento">
              <p id="aviso-orcamento" className={styles.notice}>
                {t.notice}
              </p>
              <fieldset className={styles.group}>
                <legend className={styles.legend}>{t.groups.project}</legend>
                <Select
                  label={f.area.label}
                  options={f.area.options}
                  placeholder={f.area.placeholder}
                  required
                  {...bind('area')}
                />
                <ChipGroup
                  legend={f.scale.label}
                  name="scale"
                  options={scaleOptions}
                  value={values.scale}
                  onChange={set('scale')}
                  error={errors.scale}
                  required
                />
                <ChipGroup
                  legend={f.existing.label}
                  name="existing"
                  options={yesNo}
                  value={values.existing}
                  onChange={set('existing')}
                  error={errors.existing}
                  required
                />
                <TextArea label={f.idea.label} placeholder={f.idea.placeholder} required rows={6} {...bind('idea')} />
                <FileDrop label={`${f.references.label} (${ui.optional})`} files={files} onChange={setFiles} max={5} />
                <ChipGroup
                  legend={f.availability.label}
                  name="availability"
                  options={yesNo}
                  value={values.availability}
                  onChange={set('availability')}
                  error={errors.availability}
                  required
                />
              </fieldset>

              <fieldset className={styles.group}>
                <legend className={styles.legend}>{t.groups.you}</legend>
                <div className={styles.pair}>
                  <Field label={f.name.label} autoComplete="name" required {...bind('name')} />
                  <Field label={f.city.label} placeholder={f.city.placeholder} autoComplete="address-level2" required {...bind('city')} />
                </div>
                <div className={styles.pair}>
                  <Field label={f.email.label} type="email" autoComplete="email" inputMode="email" required {...bind('email')} />
                  <Field
                    label={f.whatsapp.label}
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder={f.whatsapp.placeholder}
                    required
                    {...bind('whatsapp')}
                  />
                </div>
                <Field label={`${f.source.label} (${ui.optional})`} {...bind('source')} />
                {/* armadilha anti-spam: invisível para pessoas e leitores de tela */}
                <div className={styles.trap} aria-hidden="true">
                  <label>
                    Site
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={values.website}
                      onChange={(e) => set('website')(e.target.value)}
                    />
                  </label>
                </div>
              </fieldset>

              <div className={styles.submit}>
                {hasErrors && (
                  <p className={styles.errorSummary} role="alert">
                    {t.errors.summary}
                  </p>
                )}
                {status === 'error' && (
                  <div ref={resultRef} tabIndex={-1} className={styles.failure} role="alert">
                    <strong>{t.failure.title}</strong> {t.failure.text}
                  </div>
                )}
                <Button type="submit" disabled={status === 'sending'} aria-disabled={status === 'sending'}>
                  {status === 'sending' ? t.sending : status === 'error' ? t.failure.retry : t.submit}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
