import { useState } from 'react'
import { BallPool } from '../lab/kiln/BallPool'
import { HeroContraption } from '../lab/kiln/HeroContraption'
import { PlayTabs } from '../lab/kiln/PlayTabs'
import { PromptTable } from '../lab/kiln/PromptTable'
import { TeardownNotes } from '../lab/kiln/TeardownNotes'
import {
  PLAYS,
  findPlay,
  readKilnState,
  writeKilnState,
  type PlayId,
} from '../lab/kiln/plays'

export function KilnLabPage() {
  const initial = readKilnState()
  const [playId, setPlayId] = useState<PlayId>(initial.playId)
  const [query, setQuery] = useState(initial.query)
  const [tableOpen, setTableOpen] = useState(initial.tableOpen)

  const play = findPlay(playId)

  const changePlay = (id: PlayId) => {
    setPlayId(id)
    writeKilnState(id, query)
  }

  const runPrompt = (text: string, nextPlay?: PlayId) => {
    const id = nextPlay ?? playId
    setPlayId(id)
    setQuery(text)
    setTableOpen(true)
    writeKilnState(id, text)
  }

  return (
    <div className="kiln-page">
      <header className="kiln-nav">
        <a className="kiln-brand" href="/kiln/">
          <span className="kiln-mark" aria-hidden="true" />
          <strong>Kiln</strong>
        </a>
        <nav aria-label="Kiln 导航">
          <a href="/">Home</a>
          <a href="/inspired/">Signal Lab</a>
          <a href="#notes">拆解</a>
        </nav>
      </header>

      <main>
        <HeroContraption />
        <PlayTabs play={play} plays={PLAYS} onPlayChange={changePlay} />
        <PromptTable
          open={tableOpen}
          playId={playId}
          query={query}
          onRun={runPrompt}
        />
        <BallPool />
        <TeardownNotes />
      </main>

      <footer className="kiln-footer">
        <span>Kiln · NafYoung Lab</span>
        <span>自制资产 · 对照 clay.com · 不是官网复刻</span>
      </footer>
    </div>
  )
}
