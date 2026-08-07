import { useInView } from '../hooks/useInView'
import type { Project } from '../types/content'

interface ProjectsSectionProps {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="section projects" id="projects">
      <div className="section-head">
        <p className="eyebrow">Featured builds</p>
        <h2>代表项目</h2>
        <p className="section-desc">
          我更偏爱那些能同时体现问题拆解、流程设计和体验打磨的项目。
        </p>
      </div>

      <div className="project-stack">
        {projects.map((project, index) => (
          <ProjectCard index={index} key={project.title} project={project} />
        ))}
      </div>
    </section>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.3 })

  return (
    <article
      className={`project-panel ${inView ? 'is-inview' : ''}`}
      ref={ref}
      style={{ ['--delay' as string]: `${index * 80}ms` }}
    >
      <div className="project-visual" style={{ backgroundImage: project.tone }}>
        <span>{project.year}</span>
        <strong>{project.title}</strong>
      </div>

      <div className="project-body">
        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <p className="project-summary">{project.summary}</p>
        <ul>
          {project.proofPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <div className="project-story">
          <div>
            <span>问题</span>
            <p>{project.challenge}</p>
          </div>
          <div>
            <span>做法</span>
            <p>{project.build}</p>
          </div>
          <div>
            <span>结果</span>
            <p>{project.outcome}</p>
          </div>
        </div>
        {project.href ? (
          <a className="text-link" href={project.href} rel="noreferrer" target="_blank">
            查看作品
          </a>
        ) : null}
      </div>
    </article>
  )
}
