import { useEffect, useRef, useState, type FormEvent } from 'react'
import { mountCrtScene } from '../lab/inspired/crtScene'
import { SignalCursor } from '../lab/inspired/SignalCursor'
import { siteContent } from '../data/siteContent'

export function InspiredLabPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [draft, setDraft] = useState('')
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

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const q = draft.trim()
    const body = q
      ? `你好，我想聊：${q}`
      : '你好，我想了解你的项目与合作方式。'
    window.location.href = `mailto:${siteContent.contact.email}?subject=${encodeURIComponent('From Signal Lab')}&body=${encodeURIComponent(body)}`
  }

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

          <form className="signal-box" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="signal-input">
              Message
            </label>
            <textarea
              id="signal-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Throw me a hard one. I’m listening."
              rows={3}
            />
            <button
              aria-label="Send"
              className="signal-send"
              disabled={false}
              type="submit"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 4l-1.4 1.4 5.6 5.6H4v2h12.2l-5.6 5.6L12 20l8-8z"
                  transform="rotate(-90 12 12)"
                />
              </svg>
            </button>
          </form>

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
