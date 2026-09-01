import type { Play, PlayId } from './plays'

type PlayTabsProps = {
  play: Play
  onPlayChange: (id: PlayId) => void
  plays: Play[]
}

export function PlayTabs({ play, onPlayChange, plays }: PlayTabsProps) {
  return (
    <section className="kiln-section" id="plays">
      <div className="kiln-section-copy">
        <p className="kiln-kicker">Play Tabs</p>
        <h2>切换一段演示，URL 跟着变</h2>
        <p>
          选中态用深底。当前片段写进 <code>?play=</code>
          ，刷新后还停在同一段。
        </p>
      </div>

      <div className="kiln-tabs" role="tablist" aria-label="演示片段">
        {plays.map((item) => {
          const selected = item.id === play.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`kiln-tab${selected ? ' is-selected' : ''}`}
              onClick={() => onPlayChange(item.id)}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <article className="kiln-play-card">
        <p className="kiln-kicker">{play.kicker}</p>
        <h3>{play.headline}</h3>
        <p>{play.body}</p>
        <ResultTable caption={`${play.label} 演示表`} rows={play.rows} />
      </article>
    </section>
  )
}

export function ResultTable({
  caption,
  rows,
}: {
  caption: string
  rows: { name: string; role: string; company: string; signal: string; owner: string }[]
}) {
  return (
    <div className="kiln-table-wrap">
      <table className="kiln-table">
        <caption className="kiln-sr">{caption}</caption>
        <thead>
          <tr>
            <th>名称</th>
            <th>角色</th>
            <th>对象</th>
            <th>信号</th>
            <th>负责人</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.name}-${row.signal}`}>
              <td>{row.name}</td>
              <td>{row.role}</td>
              <td>{row.company}</td>
              <td>{row.signal}</td>
              <td>{row.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
