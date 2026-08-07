import { GlitchVideo } from '../lib/glitch/GlitchVideo'
import { useInView } from '../hooks/useInView'
import type { Trait } from '../types/content'

interface TraitsSectionProps {
  traits: Trait[]
}

export function TraitsSection({ traits }: TraitsSectionProps) {
  return (
    <section className="section features" id="traits">
      <div className="section-head">
        <p className="eyebrow">能力拆解</p>
        <h2>把模糊任务，做成可推进的系统</h2>
        <p className="section-desc">
          三件事构成我的默认工作方式：先看清结构，再补执行闭环，最后把 AI 嵌进真实流程。
        </p>
      </div>

      <div className="feature-list">
        {traits.map((trait, index) => (
          <FeatureRow index={index} key={trait.title} trait={trait} />
        ))}
      </div>
    </section>
  )
}

function FeatureRow({ trait, index }: { trait: Trait; index: number }) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.4 })
  const reverse = index % 2 === 1

  return (
    <article
      className={`feature-row ${reverse ? 'is-reverse' : ''} ${inView ? 'is-inview' : ''}`}
      ref={ref}
    >
      <div className="feature-copy">
        <span className="feature-index">0{index + 1}</span>
        <h3>{trait.title}</h3>
        <p className="feature-en">{trait.englishLabel}</p>
        <p className="feature-desc">{trait.description}</p>
        <a className="ghost-cta" href="#projects">
          查看项目
        </a>
      </div>
      <div className="feature-media">
        <GlitchVideo
          alt={trait.title}
          poster={trait.poster}
          src={trait.video}
        />
      </div>
    </article>
  )
}
