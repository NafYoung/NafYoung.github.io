import { useInView } from '../hooks/useInView'
import type { TimelineItem } from '../types/content'

interface TimelineSectionProps {
  timeline: TimelineItem[]
}

export function TimelineSection({ timeline }: TimelineSectionProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.25 })

  return (
    <section className="section timeline" id="timeline" ref={ref}>
      <div className="section-head">
        <p className="eyebrow">Timeline</p>
        <h2>经历轨迹</h2>
        <p className="section-desc">从市场营销到数字经济，再到把 AI 嵌进真实运营与产品表达。</p>
      </div>

      <div className={`masonry ${inView ? 'is-inview' : ''}`}>
        {timeline.map((item, index) => (
          <article
            className="masonry-item"
            key={`${item.title}-${item.period}`}
            style={{ ['--i' as string]: index }}
          >
            <span className="period">{item.period}</span>
            <h3>{item.title}</h3>
            <p className="subtitle">{item.subtitle}</p>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
