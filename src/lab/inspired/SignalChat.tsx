import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { siteContent } from '../../data/siteContent'

type ChatSource = {
  id: string
  title: string
  url: string
  source: string
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: ChatSource[]
}

const CHAT_URL =
  import.meta.env.VITE_SIGNAL_CHAT_URL?.trim() ||
  'https://signal-chat.nafyoung.workers.dev'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function SignalChat() {
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '可以直接问我的项目、经历或合作方向。回答会基于公开 GitHub 与站点资料检索后再生成。',
    },
  ])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, busy])

  const send = async (raw: string) => {
    const question = raw.trim()
    if (!question || busy) return

    setError('')
    setDraft('')
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: question }
    setMessages((prev) => [...prev, userMsg])
    setBusy(true)

    const history = [...messages, userMsg]
      .filter((m) => m.id !== 'welcome')
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: history.slice(0, -1) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || `请求失败（${res.status}）`)
      }

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content: String(data.answer || '没有生成回复。'),
          sources: Array.isArray(data.sources) ? data.sources : [],
        },
      ])
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : '网络异常，请稍后重试。'
      setError(msg)
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content: `刚才没接上。你也可以直接邮件联系：${siteContent.contact.email}`,
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void send(draft)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send(draft)
    }
  }

  return (
    <div className="signal-chat">
      <div className="signal-chat-log" ref={listRef} aria-live="polite">
        {messages.map((m) => (
          <div className={`signal-chat-bubble is-${m.role}`} key={m.id}>
            <p>{m.content}</p>
            {m.sources && m.sources.length > 0 ? (
              <ul className="signal-chat-sources">
                {m.sources.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    <a href={s.url} rel="noreferrer" target="_blank">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
        {busy ? (
          <div className="signal-chat-bubble is-assistant is-pending">
            <p>检索资料并生成中…</p>
          </div>
        ) : null}
      </div>

      <form className="signal-box" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="signal-input">
          Message
        </label>
        <textarea
          id="signal-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="问一个关于 NafYoung 的问题…"
          rows={3}
          disabled={busy}
        />
        <button
          aria-label="Send"
          className="signal-send"
          disabled={busy || !draft.trim()}
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
      {error ? <p className="signal-chat-error">{error}</p> : null}
    </div>
  )
}
