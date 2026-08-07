import { useInView } from '../hooks/useInView'
import type { TimelineItem } from '../types/content'

interface TimelineSectionProps {
  timeline: TimelineItem[]
}

export function TimelineSection({ timeline }: TimelineSectionProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2 })

  // Showcase: staggered columns with unique cards (no duplicate spam)
  const columns: TimelineItem[][] = [
    [timeline[0], timeline[2]].filter(Boolean) as TimelineItem[],
    [timeline[1]].filter(Boolean) as TimelineItem[],
    [timeline[2], timeline[0]].filter(Boolean) as TimelineItem[],
  ]

  return (
    <section className="section showcase" id="timeline" ref={ref}>
      <div className="section-head">
        <p className="eyebrow">经历涌动</p>
        <h2>创意轨迹，灵感绽放</h2>
        <p className="section-desc">从市场营销到数字经济，再到把 AI 嵌进真实运营与产品表达。</p>
      </div>

      <div className={`showcase-cols ${inView ? 'is-inview' : ''}`}>
        {columns.map((col, colIndex) => (
          <div className="showcase-col" key={colIndex} style={{ ['--col' as string]: colIndex }}>
            {col.map((item, itemIndex) => (
              <article
                className="showcase-card"
                key={`${colIndex}-${item.title}-${itemIndex}`}
                style={{
                  ['--i' as string]: itemIndex,
                  backgroundImage: `linear-gradient(180deg, rgba(5,11,24,0.15), rgba(5,11,24,0.82)), url(${item.poster})`,
                }}
              >
                <span>{item.period}</span>
                <h3>{item.title}</h3>
                <p className="sub">{item.subtitle}</p>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
