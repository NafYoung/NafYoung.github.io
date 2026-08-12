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
      hit: /技能|会什么|会啥|能干|擅长|技术栈|工具|ai|编程|python|sql|能力/,
      add: ['技能', 'Python', 'SQL', 'Git', 'AI工具', 'workflow', '擅长'],
    },
    {
      hit: /实习|工作|职业|求职|方向|岗位|做什么|职业规划|就业|干啥/,
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
      if (!/site-profile|persona-identity|persona-edu_|site-edu-|persona-skill_|site-project-/.test(c.id)) continue
      ranked.unshift({ chunk: c, score: 0.002 })
      seen.add(c.id)
    }
  }

  const out = ranked.slice(0, topK).map((x) => x.chunk)
  if (!out.length && chunks.length) return chunks.slice(0, topK)
  return out
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
        `「${c.title}」\n${c.text.slice(0, 900)}`,
    )
    .join('\n\n')

  const messages = [
    {
      role: 'system',
      content: `你是邵扬帆（NafYoung）个人站点上的对话助手，对访客介绍他。

【人称】
- 访客是「你」；站点主人是「他 / 邵扬帆 / NafYoung」。
- 不要把访客当成邵扬帆；不要用「你是…用户/你做过…」来描述他。

【提问】口语、挑衅、简称都正常接，尽量理解意图。

【知识红线】
- 只依据资料陈述；没有就说「资料里没有」。
- 禁止编造、禁止把自我定位/理念升级成「胜任某岗位」这类强结论。
- 可以罗列资料里的具体做法与项目，但不要替他做面试式盖章评价。
- 有边界就说边界（例如偏运营/产品与工具实践，不等于算法研究），前提是资料支持或至少不要夸大。

【表达】
- 短、像人说话：优先 3～6 句或少量要点，不要长篇编号小作文。
- 不要使用「资料#1」「根据资料#N」这类写法；来源由界面单独展示。
- 不要套话收尾（如「这些共同构成了…基础」）。
- 硬事实优先于口号/理念；一条落地项目强过三条空泛态度。
- 默认中文。`,
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
    content: `资料（唯一事实来源，勿在回答里写编号引用）：\n${context || '（暂无检索结果）'}\n\n访客问题：${question}\n\n用对他的第三人称短答；只说资料里有的。`,
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
        temperature: 0.15,
        max_tokens: 420,
        messages,
      }),
    })

    if (!llmRes.ok) {
      const errText = await llmRes.text()
      console.error('DeepSeek error', llmRes.status, errText.slice(0, 300))
      return json({ error: 'Upstream model error' }, 502, headers)
    }

    const data = await llmRes.json()
    let answer =
      data?.choices?.[0]?.message?.content?.trim() ||
      '暂时没有生成有效回复，请稍后再试。'
    // Soft cleanup if the model still leaks internal citation markers.
    answer = answer
      .replace(/根据资料\s*#?\d+/g, '')
      .replace(/资料\s*#\s*\d+/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .trim()

    // Prefer denser sources in UI: persona/site/project before generic github profile noise.
    const sourceRank = (c) => {
      const id = `${c.id} ${c.title} ${c.source}`
      if (/persona-skill_|persona-project_|site-project-|skill_ai|project_/i.test(id)) return 0
      if (/persona-|site-profile|site-edu|education/i.test(id)) return 1
      if (/contact|workflow/i.test(id)) return 2
      if (/github profile|gh-profile|gh-readme/i.test(id)) return 4
      return 3
    }
    const sources = [...chunks]
      .sort((a, b) => sourceRank(a) - sourceRank(b))
      .slice(0, 4)
      .map((c) => ({
        id: c.id,
        title: c.title,
        url: c.url,
        source: c.source,
      }))

    return json(
      {
        answer,
        sources,
      },
      200,
      headers,
    )
  } catch (err) {
    console.error(err)
    return json({ error: 'Chat failed' }, 500, headers)
  }
}
