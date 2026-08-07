import { useInView } from '../hooks/useInView'
import type { Project } from '../types/content'

interface ProjectsSectionProps {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="section projects" id="projects">
      <div className="section-head flat">
        <div>
          <p className="eyebrow">作品集</p>
          <h2>AI 项目，落地成真</h2>
        </div>
        <p className="section-desc">
          我更偏爱那些能同时体现问题拆解、流程设计和体验打磨的项目。
        </p>
      </div>

      <div className="project-rail">
        {projects.map((project, index) => (
          <ProjectCard index={index} key={project.title} project={project} />
        ))}
      </div>
    </section>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.25 })

  return (
    <article
      className={`project-card ${inView ? 'is-inview' : ''}`}
      ref={ref}
      style={{ ['--d' as string]: `${index * 100}ms` }}
    >
      <div
        className="project-cover"
        style={{ backgroundImage: `url(${project.poster}), ${project.tone}` }}
      >
        <span>{project.year}</span>
        <strong>{project.title}</strong>
      </div>
      <div className="project-meta">
        <div className="tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <p>{project.summary}</p>
        <ul>
          {project.proofPoints.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        {project.href ? (
          <a href={project.href} rel="noreferrer" target="_blank">
            查看作品
          </a>
        ) : null}
      </div>
    </article>
  )
}
