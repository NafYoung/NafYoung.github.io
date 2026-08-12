/**
 * Signal Lab chat API on Cloudflare Pages (*.pages.dev).
 * Secret: DEEPSEEK_API_KEY (Pages project secret)
 * Optional vars: INDEX_URL, ALLOWED_ORIGINS
 */

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
const DEFAULT_INDEX = 'https://nafyoung.github.io/rag/index.json'

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

/** Loose question side: map colloquial asks to KB vocabulary. */
function expandQuery(query) {
  const q = String(query || '')
  const bags = [
    {
      hit: /学历|学校|毕业|本科|硕士|读研|就读|哪所|什么大学|教育|读的什|哪个学校/,
      add: [
        '学历', '学校', '毕业', '毕业于', '本科', '硕士', '大学', '就读',
        '教育背景', '上海大学', '上海海洋大学', '市场营销', '数字经济',
      ],
    },
    {
      hit: /项目|作品|做过|开发|作品集|portfolio|github|仓库|demo|上线/,
      add: ['项目', '作品', 'GitHub', '独立开发', '自动化', '地图', '英语阅读'],
    },
    {
      hit: /技能|会什么|擅长|技术栈|工具|ai|编程|python|sql|能力/,
      add: ['技能', 'Python', 'SQL', 'Git', 'AI工具', 'workflow', '擅长'],
    },
    {
      hit: /实习|工作|职业|求职|方向|岗位|做什么|职业规划|就业/,
      add: ['实习', '职业', '运营', '产品', '数字经济', '目标', '工作'],
    },
    {
      hit: /英语|英文|口语|听力|学习方法|怎么学/,
      add: ['英语', '学习', '口语', '阅读', '偏好'],
    },
    {
      hit: /联系|邮箱|合作|约|聊聊|contact|邮件/,
      add: ['联系', '合作', '邮件', 'GitHub', 'Contact'],
    },
    {
      hit: /是谁|介绍|自己|个人|简介|关于你|关于他/,
      add: ['简介', '邵扬帆', 'NafYoung', '运营', '产品', '上海'],
    },
  ]

  const extras = []
  for (const bag of bags) {
    if (bag.hit.test(q)) extras.push(...bag.add)
  }
  // Always keep a light personal anchor so vague questions still retrieve profile.
  if (!extras.length) {
    extras.push('邵扬帆', 'NafYoung', '项目', '技能', '简介')
  }
  return `${q} ${extras.join(' ')}`.trim()
}

function retrieve(chunks, query, topK = 8) {
  const queryTerms = tokenize(expandQuery(query))
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

  let ranked = docs
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
    .sort((a, b) => b.score - a.score)

  const positive = ranked.filter((x) => x.score > 0)
  ranked = positive.length ? positive : ranked

  // Topic soft-fallbacks: if a theme is asked, ensure theme chunks are present.
  const topicRules = [
    {
      hit: /学历|学校|毕业|本科|硕士|读研|就读|哪所|什么大学|教育/,
      re: /edu|教育|大学|本科|硕士|学历|毕业|就读|海洋|上海大学/,
    },
    {
      hit: /项目|作品|做过|开发|github|仓库/,
      re: /project|项目|作品|github|readme|独立开发/,
    },
    {
      hit: /技能|会什么|擅长|技术|python|sql|ai/,
      re: /skill|技能|python|sql|git|ai|工具|workflow/,
    },
    {
      hit: /联系|邮箱|合作|contact/,
      re: /contact|联系|邮件|合作|email/,
    },
    {
      hit: /是谁|介绍|简介|关于/,
      re: /profile|简介|身份|persona-identity|site-profile/,
    },
  ]

  const q = String(query || '')
  const seen = new Set(ranked.slice(0, topK).map((x) => x.chunk.id))
  for (const rule of topicRules) {
    if (!rule.hit.test(q)) continue
    for (const c of chunks) {
      if (seen.has(c.id)) continue
      if (!rule.re.test(`${c.id}\n${c.title}\n${c.text}`)) continue
      ranked.push({ chunk: c, score: 0.001 })
      seen.add(c.id)
    }
  }

  // If still thin, prepend core profile/persona facts so the model has something grounded.
  if (ranked.filter((x) => x.score > 0).length < 2) {
    for (const c of chunks) {
      if (seen.has(c.id)) continue
      if (!/site-profile|persona-identity|persona-edu_|site-edu-/.test(c.id)) continue
      ranked.unshift({ chunk: c, score: 0.002 })
      seen.add(c.id)
    }
  }

  return ranked.slice(0, topK).map((x) => x.chunk)
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
      content: `你是邵扬帆（NafYoung）个人站点助手。

【提问侧】用户怎么问都可以：口语、简称、不完整句子都正常理解，尽量对上资料主题。

【知识侧 / 红线】
1. 只能依据下方「资料」回答；资料没有的事实一律不编、不脑补、不外推。
2. 资料有的就直接答，不要假装不知道。
3. 资料不足时，明确说「资料里没有」；可建议邮件联系，不要猜测。
4. 不要把倾向/推断说成已发生的事实。
5. 语气自然简洁；优先中文；无关闲聊可短回并拉回他的经历/项目/合作。
6. 不要输出与资料无关的长篇通用知识。`,
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
    content: `资料（唯一事实来源）：\n${context || '（暂无检索结果）'}\n\n用户问题：${question}\n\n请只根据资料作答。`,
  })

  return messages
}

export async function onRequest(context) {
  const { request, env } = context
  const allowed = String(
    env.ALLOWED_ORIGINS ||
      'https://nafyoung.github.io,http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173',
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
    const chunks = retrieve(index.chunks || [], question, 8)
    const messages = buildMessages(question, chunks, history)

    const llmRes = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.2,
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
}
