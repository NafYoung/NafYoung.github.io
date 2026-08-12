/**
 * Cloudflare Worker: retrieve against public index + DeepSeek polish.
 * Secret: DEEPSEEK_API_KEY
 * Optional vars: INDEX_URL, ALLOWED_ORIGINS
 */

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
const DEFAULT_INDEX =
  'https://raw.githubusercontent.com/NafYoung/NafYoung.github.io/main/public/rag/index.json'

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'is', 'are',
  'with', 'this', 'that', 'it', 'as', 'at', 'by', 'from', 'be', 'you', 'your',
  '我', '的', '了', '和', '是', '在', '有', '也', '就', '都', '而', '与', '及',
  '一个', '什么', '怎么', '如何',
])

function tokenize(input) {
  const text = String(input || '').toLowerCase()
  const tokens = []
  const re = /[a-z0-9][a-z0-9+.#-]{1,}|[\u4e00-\u9fff]{1,2}/g
  let m
  while ((m = re.exec(text))) {
    const t = m[0]
    if (!STOP.has(t) && t.length > 1) tokens.push(t)
  }
  return tokens
}

function retrieve(chunks, query, topK = 5) {
  const queryTerms = tokenize(query)
  if (!queryTerms.length) return chunks.slice(0, topK)
  const docs = chunks.map((c) => ({
    chunk: c,
    tokens: tokenize(`${c.title}\n${c.text}`),
  }))
  const n = docs.length
  const avgDl = docs.reduce((s, d) => s + d.tokens.length, 0) / Math.max(1, n)
  const df = new Map()
  for (const d of docs) {
    for (const t of new Set(d.tokens)) df.set(t, (df.get(t) || 0) + 1)
  }
  const k1 = 1.2
  const b = 0.75
  return docs
    .map((d) => {
      const tf = new Map()
      for (const t of d.tokens) tf.set(t, (tf.get(t) || 0) + 1)
      const dl = d.tokens.length || 1
      let score = 0
      for (const term of queryTerms) {
        const f = tf.get(term) || 0
        if (!f) continue
        const nQi = df.get(term) || 0.5
        const idf = Math.log(1 + (n - nQi + 0.5) / (nQi + 0.5))
        score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * dl) / avgDl)))
      }
      return { chunk: d.chunk, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.chunk)
}

function corsHeaders(origin, allowed) {
  const ok =
    !origin ||
    allowed.includes('*') ||
    allowed.includes(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  return {
    'Access-Control-Allow-Origin': ok ? origin || '*' : allowed[0] || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  })
}

function buildMessages(question, chunks, history) {
  const context = chunks
    .map(
      (c, i) =>
        `[#${i + 1}] ${c.title}\n来源: ${c.url}\n${c.text.slice(0, 900)}`,
    )
    .join('\n\n')

  const messages = [
    {
      role: 'system',
      content: `你是邵扬帆（NafYoung）个人站点 Signal Lab 上的助手。
只用提供的资料回答关于他的经历、项目、技能与合作意向的问题。
规则：
1. 不要编造资料里没有的事实；不确定就明确说不知道，并建议邮件联系。
2. 语气自然、简洁；可用「他/邵扬帆」指代，不要替他做无法核实的承诺。
3. 优先中文回答；用户用英文提问时可英文回答。
4. 若问题与他无关，礼貌拒绝并拉回个人相关话题。
5. 回答简洁，必要时可给一个可继续追问的方向。`,
    },
  ]

  for (const m of history) {
    if (
      m &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string'
    ) {
      messages.push({
        role: m.role,
        content: String(m.content).slice(0, 1500),
      })
    }
  }

  messages.push({
    role: 'user',
    content: `资料：\n${context || '（暂无检索结果）'}\n\n用户问题：${question}`,
  })

  return messages
}

export default {
  async fetch(request, env) {
    const allowed = String(
      env.ALLOWED_ORIGINS ||
        'https://nafyoung.github.io,http://localhost:5173,http://127.0.0.1:5173',
    )
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const origin = request.headers.get('Origin') || ''
    const headers = corsHeaders(origin, allowed)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, headers)
    }

    if (!env.DEEPSEEK_API_KEY) {
      return json({ error: 'Server misconfigured' }, 500, headers)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Invalid JSON' }, 400, headers)
    }

    const question = String(body?.question || '').trim()
    if (!question || question.length > 1000) {
      return json({ error: 'Invalid question' }, 400, headers)
    }

    const history = Array.isArray(body?.history) ? body.history.slice(-6) : []

    try {
      const indexUrl = env.INDEX_URL || DEFAULT_INDEX
      const indexRes = await fetch(indexUrl, {
        cf: { cacheTtl: 300, cacheEverything: true },
      })
      if (!indexRes.ok) {
        return json({ error: 'Index unavailable' }, 502, headers)
      }
      const index = await indexRes.json()
      const chunks = retrieve(index.chunks || [], question, 5)
      const messages = buildMessages(question, chunks, history)

      const llmRes = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          temperature: 0.4,
          max_tokens: 700,
          messages,
        }),
      })

      if (!llmRes.ok) {
        const errText = await llmRes.text()
        console.error('DeepSeek error', llmRes.status, errText.slice(0, 300))
        return json({ error: 'Upstream model error' }, 502, headers)
      }

      const data = await llmRes.json()
      const answer =
        data?.choices?.[0]?.message?.content?.trim() ||
        '暂时没有生成有效回复，请稍后再试。'

      return json(
        {
          answer,
          sources: chunks.map((c) => ({
            id: c.id,
            title: c.title,
            url: c.url,
            source: c.source,
          })),
        },
        200,
        headers,
      )
    } catch (err) {
      console.error(err)
      return json({ error: 'Chat failed' }, 500, headers)
    }
  },
}
