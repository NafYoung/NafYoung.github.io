import { useEffect } from 'react'
import './App.css'
import { ContactSection } from './components/ContactSection'
import { HeroSection } from './components/HeroSection'
import { ProjectsSection } from './components/ProjectsSection'
import { TimelineSection } from './components/TimelineSection'
import { TraitsSection } from './components/TraitsSection'
import { WorkflowSection } from './components/WorkflowSection'
import { siteContent } from './data/siteContent'

function App() {
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.slice(1)

      if (!id) {
        return
      }

      window.requestAnimationFrame(() => {
        document.getElementById(decodeURIComponent(id))?.scrollIntoView()
      })
    }

    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)

    return () => {
      window.removeEventListener('hashchange', scrollToHash)
    }
  }, [])

  return (
    <div className="page-shell">
      <div className="paper-texture" aria-hidden="true" />

      <header className="topbar">
        <a className="brand-lockup" href="#home" aria-label="返回首页">
          <span className="brand-kicker">NafYoung Studio Log</span>
          <strong>{siteContent.profile.displayName}</strong>
        </a>

        <nav className="topnav" aria-label="页面导航">
          <a href="#traits">Who am I</a>
          <a href="#projects">项目</a>
          <a href="#workflow">方法</a>
          <a href="#timeline">经历</a>
          <a href="#contact">联系</a>
        </nav>
      </header>

      <main className="portfolio-story">
        <HeroSection
          contact={siteContent.contact}
          profile={siteContent.profile}
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
    </div>
  )
}

export default App
