import { useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'
import type { WorkflowStep } from '../types/content'

interface WorkflowSectionProps {
  workflow: WorkflowStep[]
}

export function WorkflowSection({ workflow }: WorkflowSectionProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.4, once: true })
  const [clip, setClip] = useState(0)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (!inView) return
    timer.current = window.setInterval(() => {
      setClip((v) => (v + 1) % 2)
    }, 8000)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [inView])

  return (
    <section className="section canvas-sec" id="workflow" ref={ref}>
      <div className="section-head">
        <p className="eyebrow">方法画布</p>
        <h2>智能推进，多步骤融合</h2>
        <p className="section-desc">滚入视口后，主画面会放大展开，方法步骤随之上浮。</p>
      </div>

      <div className={`dream-board ${inView ? 'is-animate' : ''}`}>
        <div className="dream-board-bg" />
        <div className="dream-board-frame" />
        <div className="dream-board-main">
          <video
            className={`board-clip ${clip === 0 ? 'is-active' : ''}`}
            src="/media/board1.mp4"
            poster="/media/board1.jpg"
            muted
            playsInline
            loop
            autoPlay
          />
          <video
            className={`board-clip ${clip === 1 ? 'is-active' : ''}`}
            src="/media/board2.mp4"
            poster="/media/board2.jpg"
            muted
            playsInline
            loop
            autoPlay
          />
        </div>
        <div className="dream-board-static" aria-hidden={!inView}>
          <div className="board-steps">
            {workflow.map((step) => (
              <article key={step.step}>
                <span>{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="dream-board-tags">
          <span>拆解问题</span>
          <span>补齐闭环</span>
        </div>
      </div>
    </section>
  )
}
