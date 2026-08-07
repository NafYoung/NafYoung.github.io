import { useCallback, useEffect, useRef } from 'react'
import { HeroAtmosphere } from './HeroAtmosphere'
import { useRaceCarousel } from '../hooks/useRaceCarousel'
import type { ContactInfo, HeroSlide, Profile } from '../types/content'

interface HeroSectionProps {
  profile: Profile
  contact: ContactInfo
  slides: HeroSlide[]
}

export function HeroSection({ profile, contact, slides }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const { value, race, start, pause } = useRaceCarousel({
    max: slides.length,
    interval: 3000,
    autoStart: false,
  })

  const onEnter = useCallback(() => start(), [start])
  const onLeave = useCallback(() => pause(), [pause])

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) onEnter()
        else onLeave()
      },
      { threshold: 0.35 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [onEnter, onLeave])

  // Keep only adjacent videos mounted/visible like Jimeng
  const visible = (index: number) => Math.abs(value - index) <= 1

  return (
    <section className="hero" id="home" ref={sectionRef}>
      <div className="hero-bg" aria-hidden="true">
        {slides.map((slide, index) =>
          visible(index) ? (
            <div
              className={`hero-video-layer ${index === value ? 'is-active' : ''}`}
              key={slide.video}
              style={{ backgroundImage: slide.gradient }}
            >
              <video
                className="hero-video"
                src={slide.video}
                poster={slide.poster}
                muted
                playsInline
                loop
                autoPlay
                preload={index === 0 ? 'auto' : 'metadata'}
              />
            </div>
          ) : (
            <div
              className="hero-video-layer"
              key={`${slide.video}-off`}
              style={{ backgroundImage: slide.gradient, display: 'none' }}
            />
          ),
        )}
        <div className="hero-bg-mask" />
        <HeroAtmosphere accent={slides[value]?.accent ?? '#5eead4'} />
      </div>

      <div className="hero-main">
        <h1 className="hero-title rise">{profile.englishName}</h1>
        <p className="hero-sub rise delay-1">{profile.headline}</p>
      </div>

      <div className="hero-thumbs" aria-label="场景切换">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            className={`hero-thumb ${index === value ? 'is-active' : ''}`}
            aria-current={index === value ? true : undefined}
            onMouseEnter={() => race(index)}
            style={{ backgroundImage: `url(${slide.poster}), ${slide.gradient}` }}
          >
            <span>{slide.title}</span>
          </button>
        ))}
      </div>

      <div className="hero-dock rise delay-2">
        <a className="prompt-bar" href={`mailto:${contact.email}`}>
          <span className="prompt-text">{slides[value]?.prompt}</span>
          <span className="prompt-btn">
            <span className="prompt-btn-video" aria-hidden="true">
              <video src="/media/cta.mp4" muted playsInline loop autoPlay />
            </span>
            <span className="prompt-btn-label">开始对话</span>
          </span>
        </a>
        <p className="hero-tip">视觉演示由前端实时渲染 · {profile.displayName}</p>
      </div>
    </section>
  )
}
