import { OceanBackdrop } from './OceanBackdrop'
import { useRaceCarousel } from '../hooks/useRaceCarousel'
import type { ContactInfo, HeroSlide, Profile } from '../types/content'

interface HeroSectionProps {
  profile: Profile
  contact: ContactInfo
  slides: HeroSlide[]
}

export function HeroSection({ profile, contact, slides }: HeroSectionProps) {
  const { value, race, start, pause } = useRaceCarousel({
    max: slides.length,
    interval: 3000,
    autoStart: true,
  })

  const active = slides[value] ?? slides[0]

  return (
    <section
      className="hero"
      id="home"
      onMouseEnter={pause}
      onMouseLeave={start}
    >
      <div className="hero-stage" aria-hidden="true">
        {slides.map((slide, index) => (
          <OceanBackdrop
            accent={slide.accent}
            active={index === value}
            gradient={slide.gradient}
            key={slide.prompt}
          />
        ))}
      </div>

      <div className="hero-center">
        <p className="hero-role">{profile.role}</p>
        <h1 className="hero-brand">{profile.englishName}</h1>
        <p className="hero-line">{profile.headline}</p>
      </div>

      <div className="hero-rail" aria-label="场景预览">
        {slides.map((slide, index) => (
          <button
            aria-current={index === value ? true : undefined}
            className={`hero-thumb ${index === value ? 'is-active' : ''}`}
            key={slide.prompt}
            onMouseEnter={() => race(index)}
            style={{ backgroundImage: slide.gradient }}
            type="button"
          >
            <span>{slide.title}</span>
          </button>
        ))}
      </div>

      <div className="hero-bottom">
        <a className="glass-prompt" href={`mailto:${contact.email}`}>
          <span className="glass-prompt-text">{active?.prompt}</span>
          <span className="glass-prompt-cta">开始对话</span>
        </a>
        <p className="hero-credit">视觉氛围由前端实时生成 · {profile.displayName}</p>
      </div>
    </section>
  )
}
