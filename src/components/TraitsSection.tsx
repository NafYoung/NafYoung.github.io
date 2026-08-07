import { GlitchMedia } from '../lib/glitch/GlitchMedia'
import { useInView } from '../hooks/useInView'
import type { Trait } from '../types/content'

interface TraitsSectionProps {
  traits: Trait[]
}

const tones = [
  'linear-gradient(145deg, #38bdf8 0%, #1d4ed8 45%, #0b1224 100%)',
  'linear-gradient(145deg, #22d3ee 0%, #0e7490 42%, #082f49 100%)',
  'linear-gradient(145deg, #7dd3fc 0%, #0369a1 48%, #020617 100%)',
]

export function TraitsSection({ traits }: TraitsSectionProps) {
  const featured = traits.slice(0, 3)

  return (
    <section className="section traits" id="traits">
      <div className="section-head">
        <p className="eyebrow">工作方式</p>
        <h2>把能力拆成可感知的动作</h2>
        <p className="section-desc">
          不只是标签罗列，而是我真正用来推进项目的三件事：拆问题、补闭环、把 AI 嵌进流程。
        </p>
      </div>

      <div className="trait-rows">
        {featured.map((trait, index) => (
          <TraitRow
            index={index}
            key={trait.title}
            tone={tones[index % tones.length]}
            trait={trait}
          />
        ))}
      </div>
    </section>
  )
}

function TraitRow({
  trait,
  tone,
  index,
}: {
  trait: Trait
  tone: string
  index: number
}) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.35 })
  const reverse = index % 2 === 1

  return (
    <article
      className={`trait-row ${reverse ? 'is-reverse' : ''} ${inView ? 'is-inview' : ''}`}
      ref={ref}
    >
      <div className="trait-copy">
        <span className="trait-index">0{index + 1}</span>
        <h3>{trait.title}</h3>
        <p className="trait-en">{trait.englishLabel}</p>
        <p>{trait.description}</p>
      </div>
      <div className="trait-media">
        <GlitchMedia
          gradient={tone}
          subtitle={trait.englishLabel}
          title={trait.title}
        />
      </div>
    </article>
  )
}
