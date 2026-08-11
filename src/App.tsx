import './App.css'
import { ContactSection } from './components/ContactSection'
import { HeroSection } from './components/HeroSection'
import { ProjectsSection } from './components/ProjectsSection'
import { TimelineSection } from './components/TimelineSection'
import { TraitsSection } from './components/TraitsSection'
import { WorkflowSection } from './components/WorkflowSection'
import { siteContent } from './data/siteContent'
import { useLenis } from './hooks/useLenis'

function App() {
  useLenis()

  return (
    <div className="page">
      <header className="topnav">
        <a className="brand" href="#home">
          <span className="brand-mark" aria-hidden="true" />
          <strong>{siteContent.profile.englishName}</strong>
        </a>
        <nav aria-label="页面导航">
          <a href="#traits">能力</a>
          <a href="#projects">项目</a>
          <a href="#workflow">方法</a>
          <a href="#timeline">经历</a>
          <a href="#contact">联系</a>
        </nav>
      </header>

      <main>
        <HeroSection
          contact={siteContent.contact}
          profile={siteContent.profile}
          slides={siteContent.heroSlides}
        />
        <TraitsSection traits={siteContent.traits} />
        <ProjectsSection projects={siteContent.projects} />
        <WorkflowSection workflow={siteContent.workflow} />
        <TimelineSection timeline={siteContent.timeline} />
        <ContactSection
          contact={siteContent.contact}
          profile={siteContent.profile}
        />
      </main>

      <footer className="site-footer">
        <span>
          {siteContent.profile.displayName} / {siteContent.profile.englishName}
        </span>
        <a className="footer-lab-link" href="/inspired/">
          Signal Lab
        </a>
        <span>Video · WebGL Glitch · Lenis · IO</span>
      </footer>
    </div>
  )
}

export default App
