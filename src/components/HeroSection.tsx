import avatarFallback from '../assets/avatar-fallback.png'
import type { ContactInfo, Profile } from '../types/content'

interface HeroSectionProps {
  profile: Profile
  contact: ContactInfo
}

export function HeroSection({ profile, contact }: HeroSectionProps) {
  return (
    <section className="hero-section rise-in delay-1" id="home">
      <div className="hero-cover comic-frame">
        <div className="hero-copy">
          <span className="chapter-kicker">Personal brand dossier</span>
          <p className="hero-kicker">{profile.role}</p>
          <h1>{profile.headline}</h1>
          <p className="hero-summary">{profile.summary}</p>

          <ul className="badge-row hero-badges" aria-label="关键词">
            {profile.badges.map((badge) => (
              <li key={badge}>{badge}</li>
            ))}
          </ul>

          <div className="cta-row">
            <a
              aria-label="在新标签页打开 NafYoung 的 GitHub"
              className="cta-button primary"
              href={contact.githubUrl}
              rel="noreferrer"
              target="_blank"
            >
              查看 GitHub
            </a>
            <a className="cta-button secondary" href={`mailto:${contact.email}`}>
              发我邮件
            </a>
          </div>
        </div>

        <aside className="identity-board" aria-label="个人身份卡">
          <span className="pin-label">Main Character</span>
          <div className="portrait-frame">
            <img
              alt=""
              aria-hidden="true"
              className="portrait-outline"
              src={avatarFallback}
            />
            <img
              alt="NafYoung 的卡通头像主视觉"
              className="portrait-photo"
              src={avatarFallback}
            />
          </div>

          <div className="identity-card">
            <div>
              <strong>
                {profile.displayName} / {profile.englishName}
              </strong>
              <span>{profile.status}</span>
              <span>{profile.location}</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="proof-strip" aria-label="个人品牌证据点">
        {profile.proofPoints.map((item) => (
          <article className="proof-card comic-frame" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="mission-note comic-frame">
        <span className="handwritten-note">current mission</span>
        <p>{profile.mission}</p>
      </div>
    </section>
  )
}
