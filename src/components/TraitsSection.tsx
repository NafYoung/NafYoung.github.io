import type { Trait } from '../types/content'
import { SectionTitle } from './SectionTitle'

interface TraitsSectionProps {
  traits: Trait[]
}

export function TraitsSection({ traits }: TraitsSectionProps) {
  return (
    <section className="panel rise-in delay-2" id="traits">
      <SectionTitle
        description="我更愿意用这些关键词描述自己：它们会体现在我拆问题、推进项目、表达想法和打磨作品的方式里。"
        eyebrow="Self portrait"
        index="01"
        title="Who am I"
      />

      <div className="traits-grid">
        {traits.map((trait, index) => (
          <article
            className="trait-card comic-frame"
            key={trait.title}
          >
            <span className="card-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="trait-label">{trait.englishLabel}</span>
            <h3>{trait.title}</h3>
            <p>{trait.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
