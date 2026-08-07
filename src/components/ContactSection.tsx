import type { ContactInfo, Profile } from '../types/content'

interface ContactSectionProps {
  contact: ContactInfo
  profile: Profile
}

export function ContactSection({ contact, profile }: ContactSectionProps) {
  return (
    <section className="section contact" id="contact">
      <div className="contact-panel">
        <p className="eyebrow">开启下一步</p>
        <h2>
          {profile.displayName}
          <span> / {profile.englishName}</span>
        </h2>
        <p className="contact-note">{contact.note}</p>
        <div className="contact-actions">
          <a className="cta-primary" href={contact.githubUrl} rel="noreferrer" target="_blank">
            <span className="cta-video" aria-hidden="true">
              <video src="/media/cta.mp4" muted playsInline loop autoPlay />
            </span>
            <span>{contact.githubLabel}</span>
          </a>
          <a className="cta-ghost" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </div>
        <p className="contact-meta">
          {profile.status} · {profile.location}
        </p>
      </div>
    </section>
  )
}
