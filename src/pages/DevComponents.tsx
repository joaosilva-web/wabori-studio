import { useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { ChipGroup } from '../components/ChipGroup'
import { Faq } from '../components/Faq'
import { Field, Select, TextArea } from '../components/Field'
import { FileDrop } from '../components/FileDrop'
import { Kaze } from '../components/Kaze'
import { Marquee } from '../components/Marquee'
import { ProjectList, type ProjectListItem } from '../components/ProjectList'
import { ProjectPhoto } from '../components/ProjectPhoto'
import { Reveal } from '../components/Reveal'
import { SectionMeta } from '../components/SectionMeta'
import { WaboriSymbol } from '../components/Symbol'
import { Tag } from '../components/Tag'
import { TextLink } from '../components/TextLink'
import { Wordmark } from '../components/Wordmark'
import { content } from '../content'
import { PHOTO_SIZES } from '../lib/images'
import styles from './DevComponents.module.css'

/*
 * /dev/componentes — só em desenvolvimento. Mostra cada componente em cada tom.
 * Os projetos abaixo são exemplos de layout, não projetos reais.
 */

const sample: ProjectListItem[] = [
  {
    slug: 'exemplo-costas',
    href: '/dev/componentes',
    area: 'Costas',
    title: '[EXEMPLO] Costas completas',
    summary: '[A PREENCHER] Uma linha sobre a composição.',
    sessions: 18,
    status: 'concluido',
    example: true,
    previewPlaceholder: '[FOTO: costas completas, corpo inteiro]',
  },
  {
    slug: 'exemplo-braco',
    href: '/dev/componentes',
    area: 'Braço',
    title: '[EXEMPLO] Braço fechado',
    summary: '[A PREENCHER] Uma linha sobre a composição.',
    sessions: 10,
    status: 'andamento',
    example: true,
    previewPlaceholder: '[FOTO: braço fechado, área completa]',
  },
]

function Block({ title, children, tone = 'light' }: { title: string; children: ReactNode; tone?: 'light' | 'dark' | 'warm' }) {
  return (
    <div className={styles.block} data-tone={tone}>
      <span className={`lbl ${styles.blockTitle}`}>{title}</span>
      {children}
    </div>
  )
}

export default function DevComponents() {
  const [scale, setScale] = useState('Braço fechado')
  const [yes, setYes] = useState('')
  const [files, setFiles] = useState<File[]>([])

  return (
    <div>
      <section className="section" data-tone="light">
        <div className="container">
          <SectionMeta section="atelie" label="Componentes" aside="Só em desenvolvimento" />
          <h1 className={styles.title}>Peças que se repetem.</h1>

          <Block title="Símbolo e assinatura">
            <div className={styles.row}>
              <WaboriSymbol size={16} title={content.ui.symbolLabel} />
              <WaboriSymbol size={28} />
              <WaboriSymbol size={64} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '1rem' }}>
                <Wordmark />
              </span>
              <span style={{ fontSize: '2.5rem' }}>
                <Wordmark />
              </span>
            </div>
          </Block>
          <Block title="Símbolo e assinatura · sumi" tone="dark">
            <div className={styles.row}>
              <WaboriSymbol size={64} />
              <span style={{ fontSize: '2.5rem' }}>
                <Wordmark symbolTone="inherit" />
              </span>
            </div>
          </Block>

          <Block title="Button e TextLink">
            <div className={styles.row}>
              <Button href="/dev/componentes">Iniciar um projeto</Button>
              <Button variant="secondary" href="/dev/componentes">
                Ver o processo
              </Button>
              <Button disabled>Desabilitado</Button>
              <TextLink href="/dev/componentes" arrow="→">
                Ver projetos
              </TextLink>
            </div>
          </Block>
          <Block title="Button e TextLink · inverse (sumi)" tone="dark">
            <div className={styles.row}>
              <Button inverse href="/dev/componentes">
                Iniciar um projeto
              </Button>
              <Button variant="secondary" inverse href="/dev/componentes">
                Sobre o ateliê
              </Button>
              <TextLink href={content.site.instagramUrl}>{content.site.instagramHandle}</TextLink>
            </div>
          </Block>

          <Block title="SectionMeta">
            <SectionMeta section="projetos" label="Projetos" aside="12 composições" />
          </Block>
          <Block title="SectionMeta · sumi" tone="dark">
            <SectionMeta section="atelie" label="O ateliê" aside="Maringá — PR" />
          </Block>

          <Block title="Tag">
            <div className={styles.row}>
              <Tag>18 sessões</Tag>
              <Tag variant="fill">Cicatrizada</Tag>
              <Tag>Em andamento</Tag>
            </div>
          </Block>

          <Block title="ProjectRow / ProjectList (passe o mouse)">
            <ProjectList items={sample} />
          </Block>

          <Block title="ProjectPhoto">
            <div className={styles.photos}>
              <ProjectPhoto
                placeholder="[FOTO: costas completas, corpo inteiro]"
                alt="[EXEMPLO] Costas completas, corpo inteiro, cicatrizada"
                state="cicatrizada"
                framing="corpo"
                index={1}
                total={3}
                sizes={PHOTO_SIZES.grid}
              />
              <ProjectPhoto
                placeholder="[FOTO: detalhe]"
                alt="[EXEMPLO] Detalhe, fresca"
                state="fresca"
                framing="detalhe"
                index={2}
                total={3}
                sizes={PHOTO_SIZES.grid}
              />
            </div>
          </Block>

          <Block title="Formulário: Field, Select, TextArea, ChipGroup, FileDrop">
            <form className={styles.form} onSubmit={(e) => e.preventDefault()} noValidate>
              <Select
                label="Área do corpo"
                options={content.start.fields.area.options}
                placeholder={content.start.fields.area.placeholder}
                defaultValue=""
              />
              <Field label="Cidade" placeholder="Onde você mora" />
              <ChipGroup
                className={styles.full}
                legend="Escala"
                name="dev-scale"
                options={content.start.fields.scale.options.map((o) => ({ value: o, label: o }))}
                value={scale}
                onChange={setScale}
              />
              <ChipGroup
                legend="Já existem tatuagens na área?"
                name="dev-yes"
                options={[
                  { value: 'sim', label: 'Sim' },
                  { value: 'nao', label: 'Não' },
                ]}
                value={yes}
                onChange={setYes}
                error={yes ? undefined : 'Escolha uma opção.'}
              />
              <Field label="E-mail" type="email" error="Confira o e-mail." defaultValue="nome@" />
              <TextArea
                className={styles.full}
                label="Sua ideia"
                placeholder={content.start.fields.idea.placeholder}
                hint={content.start.notice}
              />
              <div className={styles.full}>
                <FileDrop label="Referências" hint="Opcional." files={files} onChange={setFiles} />
              </div>
              <div>
                <Button type="submit">Enviar pedido</Button>
              </div>
            </form>
          </Block>

          <Block title="Faq">
            <Faq items={content.process.faq.items} />
          </Block>

          <Block title="Reveal (role para ver)">
            <Reveal stagger className={styles.row}>
              {['01', '02', '03', '04'].map((n) => (
                <div key={n} data-rv="" className={styles.revealCard}>
                  {n}
                </div>
              ))}
            </Reveal>
          </Block>
        </div>
      </section>

      <Kaze />
      <section className="section" data-tone="dark">
        <div className="container">
          <SectionMeta section="atelie" label="Kaze" aside="Role para acelerar" />
          <p className={styles.note}>Três faixas tom sobre tom. Rolar acelera; rolar para cima inverte.</p>
        </div>
      </section>
      <Kaze bordered />
      <div style={{ height: 'var(--space-5)' }} data-tone="dark" />
      <Kaze tone="warm" />
      <Marquee items={content.home.marquee.items} label={content.home.marquee.label} />
      <div style={{ height: '60vh' }} />
    </div>
  )
}
