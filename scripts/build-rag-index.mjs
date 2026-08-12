#!/usr/bin/env node
/**
 * Build a static RAG corpus from:
 * - siteContent
 * - public GitHub repos
 * - private KB normal-only export (nafyoung-knowledge)
 *
 * Privacy red line: never ingest private/restricted persona records.
 * Output: public/rag/index.json (+ public/rag/persona-normal.json cache)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import esbuild from 'esbuild'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outPath = join(root, 'public/rag/index.json')
const personaCachePath = join(root, 'public/rag/persona-normal.json')
const owner = 'NafYoung'
const privateKbRepo = 'nafyoung-knowledge'
const privateKbPath = 'nafyoung_kb_private_v1.json'

function resolveGithubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN
  const res = spawnSync('gh', ['auth', 'token'], { encoding: 'utf8' })
  if (res.status === 0 && res.stdout.trim()) return res.stdout.trim()
  return ''
}

const githubToken = resolveGithubToken()
const ghHeaders = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'nafyoung-rag-indexer',
  ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
}

function chunkText(text, { size = 700, overlap = 120 } = {}) {
  const clean = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  if (!clean) return []
  if (clean.length <= size) return [clean]
  const chunks = []
  let i = 0
  while (i < clean.length) {
    const end = Math.min(clean.length, i + size)
    chunks.push(clean.slice(i, end).trim())
    if (end >= clean.length) break
    i = Math.max(0, end - overlap)
  }
  return chunks.filter(Boolean)
}

async function loadSiteContent() {
  const entry = join(root, 'src/data/siteContent.ts')
  const outfile = join(root, 'scripts/.cache/siteContent.mjs')
  await mkdir(dirname(outfile), { recursive: true })
  await esbuild.build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
  })
  const mod = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`)
  return mod.siteContent
}

function docsFromSite(site) {
  const docs = []
  docs.push({
    id: 'site-profile',
    title: '个人简介',
    source: 'site',
    url: 'https://nafyoung.github.io/',
    text: [
      `${site.profile.displayName} / ${site.profile.englishName}`,
      site.profile.role,
      site.profile.headline,
      site.profile.summary,
      site.profile.status,
      site.profile.location,
      site.profile.mission,
      `关键词：${site.profile.badges.join('、')}`,
    ].join('\n'),
  })

  for (const project of site.projects) {
    docs.push({
      id: `site-project-${project.title}`,
      title: project.title,
      source: 'site',
      url: project.href,
      text: [
        project.title,
        project.year,
        `标签：${project.tags.join('、')}`,
        project.summary,
        `挑战：${project.challenge}`,
        `做法：${project.build}`,
        `结果：${project.outcome}`,
        `要点：${project.proofPoints.join('、')}`,
      ].join('\n'),
    })
  }

  for (const item of site.timeline) {
    docs.push({
      id: `site-edu-${item.title}`,
      title: `${item.title} · ${item.subtitle}`,
      source: 'site',
      url: 'https://nafyoung.github.io/#education',
      text: [
        item.period,
        item.title,
        item.subtitle,
        item.description,
        '教育背景 学历 学校 毕业 就读 本科 硕士 大学',
      ]
        .filter(Boolean)
        .join('\n'),
    })
  }

  for (const step of site.workflow) {
    docs.push({
      id: `site-workflow-${step.step}`,
      title: `工作方式 ${step.step} ${step.title}`,
      source: 'site',
      url: 'https://nafyoung.github.io/',
      text: `${step.title}\n${step.description}`,
    })
  }

  docs.push({
    id: 'site-contact',
    title: '联系方式',
    source: 'site',
    url: 'https://nafyoung.github.io/#contact',
    text: [
      site.contact.note,
      `GitHub：${site.contact.githubUrl}`,
      `Email：${site.contact.email}`,
    ].join('\n'),
  })

  return docs
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: ghHeaders })
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} for ${url}`)
  }
  return res.json()
}

async function fetchReadme(repo) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    { headers: { ...ghHeaders, Accept: 'application/vnd.github.raw' } },
  )
  if (res.status === 404) return ''
  if (!res.ok) {
    console.warn(`skip readme ${repo}: ${res.status}`)
    return ''
  }
  return res.text()
}

async function docsFromGithub() {
  const repos = await fetchJson(
    `https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`,
  )
  const publicRepos = repos.filter(
    (r) =>
      !r.private &&
      !r.fork &&
      !r.archived &&
      !String(r.description || '').includes('[DEPRECATED]') &&
      r.name !== privateKbRepo,
  )

  const docs = [
    {
      id: 'gh-profile',
      title: 'GitHub Profile',
      source: 'github',
      url: `https://github.com/${owner}`,
      text: 'NafYoung / 邵扬帆. Relentless learner. Building in public. Personal GitHub for AI workflow, product experiments, and tools.',
    },
  ]

  for (const repo of publicRepos) {
    const readme = await fetchReadme(repo.name)
    const base = [
      `仓库：${repo.full_name}`,
      repo.description || '',
      `语言：${repo.language || 'n/a'}`,
      `主页：${repo.homepage || repo.html_url}`,
      `Topics：${(repo.topics || []).join(', ')}`,
    ]
      .filter(Boolean)
      .join('\n')

    docs.push({
      id: `gh-repo-${repo.name}`,
      title: repo.name,
      source: 'github',
      url: repo.html_url,
      text: base,
    })

    for (const [i, part] of chunkText(readme).entries()) {
      docs.push({
        id: `gh-readme-${repo.name}-${i}`,
        title: `${repo.name} README`,
        source: 'github',
        url: `${repo.html_url}#readme`,
        text: `${repo.name}\n${repo.description || ''}\n${part}`,
      })
    }
  }

  return docs
}

function exportNormalPersona(kb) {
  const records = Array.isArray(kb?.records) ? kb.records : []
  const normal = records
    .filter((r) => r && r.sensitivity === 'normal' && r.statement)
    .map((r) => ({
      id: r.id,
      domain: r.domain,
      type: r.type,
      statement: r.statement,
      time_scope: r.time_scope || null,
      tags: Array.isArray(r.tags) ? r.tags : [],
    }))

  return {
    version: 1,
    source: `${owner}/${privateKbRepo}/${privateKbPath}`,
    exportedAt: new Date().toISOString(),
    policy: {
      include_sensitivity: ['normal'],
      exclude_sensitivity: ['private', 'restricted'],
      note: 'Public-site RAG whitelist only. No private/restricted persona records.',
    },
    identity_public: kb?.identity_public || null,
    records: normal,
  }
}

function docsFromPersonaNormal(persona) {
  const docs = []
  const idPub = persona?.identity_public
  if (idPub) {
    docs.push({
      id: 'persona-identity-public',
      title: '公开身份',
      source: 'persona',
      url: 'https://nafyoung.github.io/',
      text: [
        idPub.display_name_zh,
        idPub.public_name,
        idPub.current_role,
        idPub.primary_city,
        '教育背景 学历 学校 硕士 就读 大学',
      ]
        .filter(Boolean)
        .join('\n'),
    })
  }

  for (const r of persona.records || []) {
    const time =
      r.time_scope == null
        ? ''
        : typeof r.time_scope === 'string'
          ? r.time_scope
          : JSON.stringify(r.time_scope)
    const eduBoost =
      r.domain === 'education'
        ? '教育背景 学历 学校 毕业 就读 本科 硕士 大学 毕业于'
        : ''
    docs.push({
      id: `persona-${r.id}`,
      title: `${r.domain || 'persona'} · ${r.id}`,
      source: 'persona',
      url: 'https://nafyoung.github.io/inspired/',
      text: [
        r.statement,
        r.type ? `类型：${r.type}` : '',
        time ? `时间：${time}` : '',
        Array.isArray(r.tags) && r.tags.length ? `标签：${r.tags.join('、')}` : '',
        eduBoost,
      ]
        .filter(Boolean)
        .join('\n'),
    })
  }
  return docs
}

async function loadPrivateKb() {
  const desktop = join(
    process.env.HOME || '',
    'Desktop/nafyoung_kb_private_v1.json',
  )
  try {
    const local = await readFile(desktop, 'utf8')
    console.log('Loaded private KB from Desktop export')
    return JSON.parse(local)
  } catch {
    // fall through to GitHub private repo
  }

  if (!githubToken) {
    console.warn('No GitHub token; cannot fetch private KB from GitHub')
    return null
  }

  const url = `https://api.github.com/repos/${owner}/${privateKbRepo}/contents/${privateKbPath}`
  const res = await fetch(url, { headers: ghHeaders })
  if (!res.ok) {
    console.warn(`Private KB fetch failed: ${res.status}`)
    return null
  }
  const meta = await res.json()
  if (meta.encoding !== 'base64' || !meta.content) {
    console.warn('Private KB payload missing base64 content')
    return null
  }
  const text = Buffer.from(meta.content.replace(/\n/g, ''), 'base64').toString(
    'utf8',
  )
  console.log(`Loaded private KB from ${owner}/${privateKbRepo}`)
  return JSON.parse(text)
}

async function loadPersonaNormalDocs() {
  const kb = await loadPrivateKb()
  if (kb) {
    const persona = exportNormalPersona(kb)
    await mkdir(dirname(personaCachePath), { recursive: true })
    await writeFile(
      personaCachePath,
      `${JSON.stringify(persona, null, 2)}\n`,
      'utf8',
    )
    console.log(
      `Wrote ${persona.records.length} normal persona records → ${personaCachePath}`,
    )
    return docsFromPersonaNormal(persona)
  }

  try {
    const cached = JSON.parse(await readFile(personaCachePath, 'utf8'))
    console.log(
      `Using cached persona-normal.json (${cached.records?.length || 0} records)`,
    )
    return docsFromPersonaNormal(cached)
  } catch {
    console.warn('No private KB and no persona-normal cache; skipping persona docs')
    return []
  }
}

function toChunks(docs) {
  const chunks = []
  for (const doc of docs) {
    const parts = chunkText(doc.text)
    parts.forEach((text, i) => {
      chunks.push({
        id: parts.length === 1 ? doc.id : `${doc.id}#${i}`,
        title: doc.title,
        source: doc.source,
        url: doc.url,
        text,
      })
    })
  }
  return chunks
}

async function main() {
  console.log('Loading siteContent…')
  const site = await loadSiteContent()
  console.log('Loading persona normal whitelist…')
  const personaDocs = await loadPersonaNormalDocs()
  console.log('Fetching public GitHub repos…')
  const docs = [
    ...docsFromSite(site),
    ...personaDocs,
    ...(await docsFromGithub()),
  ]
  const chunks = toChunks(docs)
  const payload = {
    version: 2,
    builtAt: new Date().toISOString(),
    owner,
    chunkCount: chunks.length,
    sources: {
      site: true,
      persona_normal: personaDocs.length > 0,
      github_public: true,
    },
    chunks,
  }
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${chunks.length} chunks → ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
