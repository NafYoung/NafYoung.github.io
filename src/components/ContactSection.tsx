import type { ContactInfo, Profile } from '../types/content'

interface ContactSectionProps {
  profile: Profile
  contact: ContactInfo
}

export function ContactSection({
  profile,
  contact,
}: ContactSectionProps) {
  return (
    <footer className="panel contact-panel rise-in delay-6" id="contact">
      <div className="contact-card comic-frame">
        <div className="section-heading-row">
          <span className="section-index">05</span>
          <span className="section-eyebrow">Let&apos;s connect</span>
        </div>
        <h2>
          如果你在找一个能把思路、工具和执行串起来的人，
          <br />
          我很愿意聊聊。
        </h2>
        <p>{contact.note}</p>

        <div className="contact-links">
          <a
            aria-label="在新标签页打开 NafYoung 的 GitHub"
            href={contact.githubUrl}
            rel="noreferrer"
            target="_blank"
          >
            {contact.githubLabel}
          </a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </div>
      </div>

      <div className="signature-note comic-frame">
        <span className="handwritten-note">public version only</span>
        <p>
          这里保留的是职业向自我介绍：
          <strong>
            {' '}
            {profile.displayName} / {profile.englishName}
          </strong>
          ，没有放电话、QQ 或私人信息。
        </p>
      </div>
    </footer>
  )
}
