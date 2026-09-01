import { useState } from 'react'
import { ResultTable } from './PlayTabs'
import {
  CHIPS,
  CRAFT_ROWS,
  findPlay,
  matchChip,
  type PlayId,
} from './plays'

type PromptTableProps = {
  playId: PlayId
  query: string
  open: boolean
  onRun: (text: string, playId?: PlayId) => void
}

export function PromptTable({ playId, query, open, onRun }: PromptTableProps) {
  const [draft, setDraft] = useState(query)
  const chip = matchChip(query)
  const rows =
    chip?.resultKind === 'craft' ? CRAFT_ROWS : findPlay(chip?.play ?? playId).rows

  const submitDraft = () => {
    const text = draft.trim()
    if (!text) return
    const matched = matchChip(text)
    onRun(text, matched?.play)
  }

  return (
    <section className="kiln-section" id="prompt">
      <div className="kiln-section-copy">
        <p className="kiln-kicker">Prompt</p>
        <h2>芯片按下去，表自己出来</h2>
        <p>
          这里没有表单 GET。芯片和提交都是 <code>button</code>
          ，只改本页状态和查询参数。
        </p>
      </div>

      <div className="kiln-prompt">
        <label className="kiln-prompt-label" htmlFor="kiln-query">
          想先看哪一段演示？
        </label>
        <div className="kiln-prompt-bar">
          <input
            id="kiln-query"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                submitDraft()
              }
            }}
            placeholder="点下面的芯片，或自己写一句"
            autoComplete="off"
          />
          <button
            className="kiln-btn kiln-btn-solid"
            type="button"
            onClick={submitDraft}
          >
            提交
          </button>
        </div>

        <div className="kiln-chips">
          {CHIPS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`kiln-chip${query === item.label ? ' is-active' : ''}`}
              onClick={() => {
                setDraft(item.label)
                onRun(item.label, item.play)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {open ? (
          <div className="kiln-prompt-result">
            <p className="kiln-result-label">结果表 · {query}</p>
            <ResultTable caption="Prompt 结果表" rows={rows} />
          </div>
        ) : null}
      </div>
    </section>
  )
}
