import { useInView } from '../hooks/useInView'
import type { WorkflowStep } from '../types/content'

interface WorkflowSectionProps {
  workflow: WorkflowStep[]
}

export function WorkflowSection({ workflow }: WorkflowSectionProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.4 })

  return (
    <section className="section workflow" id="workflow" ref={ref}>
      <div className="section-head">
        <p className="eyebrow">Method board</p>
        <h2>工作方法</h2>
        <p className="section-desc">
          滚到这里，背景层会放大展开，把方法步骤推到画面中央。
        </p>
      </div>

      <div className={`board ${inView ? 'is-animate' : ''}`}>
        <div className="board-bg" />
        <div className="board-border" />
        <div className="board-main">
          <div className="board-main-inner">
            {workflow.map((step) => (
              <article key={step.step}>
                <span>{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="board-labels">
          <span>拆解问题</span>
          <span>补齐闭环</span>
        </div>
      </div>
    </section>
  )
}
