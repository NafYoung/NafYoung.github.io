import { useInView } from '../hooks/useInView'
import type { TimelineItem } from '../types/content'

interface TimelineSectionProps {
  timeline: TimelineItem[]
}

export function TimelineSection({ timeline }: TimelineSectionProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2 })

  return (
    <section className="section showcase" id="timeline" ref={ref}>
      <div className="section-head">
        <p className="eyebrow">教育经历</p>
        <h2>学校与专业</h2>
        <p className="section-desc">本科市场营销，硕士数字经济。</p>
      </div>

      <div className={`edu-grid ${inView ? 'is-inview' : ''}`}>
        {timeline.map((item, index) => (
          <article
            className="showcase-card edu-card"
            key={`${item.title}-${item.period}`}
            style={{
              ['--i' as string]: index,
              backgroundImage: `linear-gradient(180deg, rgba(5,11,24,0.2), rgba(5,11,24,0.86)), url(${item.poster})`,
            }}
          >
            <span>{item.period}</span>
            <h3>{item.title}</h3>
            <p className="sub">{item.subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
