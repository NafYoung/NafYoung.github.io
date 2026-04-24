import type { TimelineItem } from '../types/content'
import { SectionTitle } from './SectionTitle'

interface TimelineSectionProps {
  timeline: TimelineItem[]
}

export function TimelineSection({ timeline }: TimelineSectionProps) {
  return (
    <section className="panel rise-in delay-5" id="timeline">
      <SectionTitle
        description="我想保留的不是流水账，而是最能解释我为什么会走到“AI × 运营 × 产品表达”这条线上的关键节点。"
        eyebrow="Education & practice"
        index="04"
        title="经历时间线"
      />

      <div className="timeline-list">
        {timeline.map((item, index) => (
          <article className="timeline-card comic-frame" key={item.title}>
            <span className="timeline-marker">{String(index + 1).padStart(2, '0')}</span>
            <span className="timeline-period">{item.period}</span>
            <h3>{item.title}</h3>
            <strong>{item.subtitle}</strong>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
