/**
 * Lightweight lexical retrieval for the Signal Lab RAG index.
 * Good enough for a small personal corpus (ZH/EN).
 */

export type RagChunk = {
  id: string
  title: string
  source: string
  url: string
  text: string
}

export type RagIndex = {
  version: number
  builtAt: string
  owner: string
  chunkCount: number
  chunks: RagChunk[]
}

const STOP = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'to',
  'of',
  'in',
  'on',
  'for',
  'is',
  'are',
  'with',
  'this',
  'that',
  'it',
  'as',
  'at',
  'by',
  'from',
  'be',
  'you',
  'your',
  '我',
  '的',
  '了',
  '和',
  '是',
  '在',
  '有',
  '也',
  '就',
  '都',
  '而',
  '与',
  '及',
  '一个',
  '什么',
  '怎么',
  '如何',
])

export function tokenize(input: string): string[] {
  const text = input.toLowerCase()
  const tokens: string[] = []
  const re = /[a-z0-9][a-z0-9+.#-]{1,}|[\u4e00-\u9fff]{1,2}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const t = m[0]
    if (!STOP.has(t) && t.length > 1) tokens.push(t)
  }
  return tokens
}

function bm25Score(
  queryTerms: string[],
  docTokens: string[],
  avgDl: number,
  df: Map<string, number>,
  n: number,
) {
  const tf = new Map<string, number>()
  for (const t of docTokens) tf.set(t, (tf.get(t) || 0) + 1)
  const k1 = 1.2
  const b = 0.75
  const dl = docTokens.length || 1
  let score = 0
  for (const term of queryTerms) {
    const f = tf.get(term) || 0
    if (!f) continue
    const nQi = df.get(term) || 0.5
    const idf = Math.log(1 + (n - nQi + 0.5) / (nQi + 0.5))
    score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * dl) / avgDl)))
  }
  return score
}

export function retrieveChunks(
  index: RagIndex,
  query: string,
  topK = 5,
): RagChunk[] {
  const queryTerms = tokenize(query)
  if (!queryTerms.length || !index.chunks.length) {
    return index.chunks.slice(0, topK)
  }

  const docs = index.chunks.map((c) => ({
    chunk: c,
    tokens: tokenize(`${c.title}\n${c.text}`),
  }))
  const avgDl = docs.reduce((s, d) => s + d.tokens.length, 0) / docs.length
  const df = new Map<string, number>()
  for (const d of docs) {
    for (const t of new Set(d.tokens)) df.set(t, (df.get(t) || 0) + 1)
  }

  return docs
    .map((d) => ({
      chunk: d.chunk,
      score: bm25Score(queryTerms, d.tokens, avgDl, df, docs.length),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.chunk)
}
