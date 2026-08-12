import { useEffect, useRef } from 'react'
import { mountCrtScene } from '../lab/inspired/crtScene'
import { SignalChat } from '../lab/inspired/SignalChat'
import { SignalCursor } from '../lab/inspired/SignalCursor'
import { siteContent } from '../data/siteContent'

export function InspiredLabPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!canvasRef.current || reduceMotion) return
    let handle: { destroy: () => void } | undefined
    let cancelled = false

    const start = async () => {
      try {
        await document.fonts.ready
      } catch {
        // ignore font loading failures; system fallback still works
      }
      if (cancelled || !canvasRef.current) return
      handle = mountCrtScene(canvasRef.current, {
        text: 'NafYoung',
        glitch: 1,
      })
    }

    void start()
    return () => {
      cancelled = true
      handle?.destroy()
    }
  }, [reduceMotion])

  return (
    <div className="signal-page">
      <SignalCursor />
      <header className="signal-nav">
        <a className="signal-brand" href="/">
          <span className="signal-mark" aria-hidden="true" />
          <span>NafYoung</span>
        </a>
        <nav aria-label="Lab navigation">
          <a href="/">Home</a>
          <a href="/#projects">Projects</a>
          <a href={siteContent.contact.githubUrl} rel="noreferrer" target="_blank">
            GitHub
          </a>
          <a href={`mailto:${siteContent.contact.email}`}>Contact</a>
        </nav>
      </header>

      <main className="signal-hero">
        <div className="signal-stage" aria-hidden="true">
          {reduceMotion ? (
            <div className="signal-fallback-title">NafYoung</div>
          ) : (
            <canvas ref={canvasRef} className="signal-canvas" />
          )}
          <div className="signal-halo" />
          <div className="signal-vignette" />
        </div>

        <div className="signal-content">
          <p className="signal-tagline">
            Seeking a cleaner path from messy signals to working systems.
          </p>

          <SignalChat />

          <div className="signal-ctas">
            <a className="signal-pill" href="/#projects">
              View Projects
            </a>
            <a
              className="signal-pill"
              href={siteContent.contact.githubUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open GitHub
            </a>
          </div>
        </div>
      </main>

      <section className="signal-notes">
        <div>
          <h2>What this page is</h2>
          <p>
            A visual craft study: CRT interference type, center halo, and a quiet
            black frame. Built for learning motion and WebGL texture distortion.
          </p>
        </div>
        <div>
          <h2>What this page is not</h2>
          <p>
            Not an official product page. No third-party trademarks, logos, or
            original marketing copy are used here.
          </p>
        </div>
      </section>

      <footer className="signal-foot">
        <p>
          Inspired by contemporary AI brand homepage craft · independent study by{' '}
          {siteContent.profile.displayName} / {siteContent.profile.englishName}
        </p>
        <p>Not affiliated with Moonshot AI, Kimi, or related entities.</p>
      </footer>
    </div>
  )
}
