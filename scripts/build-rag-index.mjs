#!/usr/bin/env node
/**
 * Build a static RAG corpus from public GitHub repos + siteContent.
 * Output: public/rag/index.json
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import esbuild from 'esbuild'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outPath = join(root, 'public/rag/index.json')
const owner = 'NafYoung'
const ghHeaders = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'nafyoung-rag-indexer',
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
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
      text: [item.period, item.title, item.subtitle, item.description]
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
    (r) => !r.private && !r.fork && !r.archived && !String(r.description || '').includes('[DEPRECATED]'),
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
  console.log('Fetching public GitHub repos…')
  const docs = [...docsFromSite(site), ...(await docsFromGithub())]
  const chunks = toChunks(docs)
  const payload = {
    version: 1,
    builtAt: new Date().toISOString(),
    owner,
    chunkCount: chunks.length,
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
