interface SectionTitleProps {
  eyebrow: string
  title: string
  description: string
  index?: string
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  index,
}: SectionTitleProps) {
  return (
    <div className="section-title">
      <div className="section-heading-row">
        {index ? <span className="section-index">{index}</span> : null}
        <span className="section-eyebrow">{eyebrow}</span>
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}
