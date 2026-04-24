import type { Project } from '../types/content'
import { SectionTitle } from './SectionTitle'

interface ProjectsSectionProps {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="panel rise-in delay-3" id="projects">
      <SectionTitle
        description="我更偏爱那些能同时体现问题拆解、流程设计和体验打磨的项目。下面这三个最能代表我的工作方式。"
        eyebrow="Featured builds"
        index="02"
        title="代表项目"
      />

      <div className="projects-grid">
        {projects.map((project, index) => (
          <article
            className={`project-card comic-frame ${
              index === 0 ? 'project-card-featured' : ''
            }`}
            key={project.title}
          >
            <div className="project-topline">
              <span className="project-year">{project.year}</span>
              <div className="project-tags">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>

            <h3>{project.title}</h3>
            <p className="project-summary">{project.summary}</p>

            <ul className="project-proof-list" aria-label={`${project.title} 亮点`}>
              {project.proofPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>

            <div className="project-story">
              <div className="story-block">
                <span>问题</span>
                <p>{project.challenge}</p>
              </div>
              <div className="story-block">
                <span>做法</span>
                <p>{project.build}</p>
              </div>
              <div className="story-block accent">
                <span>结果 / 亮点</span>
                <p>{project.outcome}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
