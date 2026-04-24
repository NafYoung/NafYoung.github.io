import type { WorkflowStep } from '../types/content'
import { SectionTitle } from './SectionTitle'

interface WorkflowSectionProps {
  workflow: WorkflowStep[]
}

export function WorkflowSection({ workflow }: WorkflowSectionProps) {
  return (
    <section className="panel rise-in delay-4" id="workflow">
      <SectionTitle
        description="这部分不是励志口号，而是我在做项目、做运营支持和处理复杂任务时最常用的三段式方法。"
        eyebrow="My playbook"
        index="03"
        title="我怎么做事"
      />

      <ol className="workflow-grid">
        {workflow.map((item) => (
          <li className="workflow-card comic-frame" key={item.step}>
            <span className="workflow-step">{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
