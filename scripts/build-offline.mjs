import { readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const offlineSiteDir = path.join(projectRoot, 'offline-site')
const offlineHtmlPath = path.join(projectRoot, '双击打开版.html')

await rm(offlineSiteDir, { recursive: true, force: true })

const buildResult = await build({
  absWorkingDir: projectRoot,
  bundle: true,
  entryPoints: ['src/offline-entry.tsx'],
  format: 'iife',
  jsx: 'automatic',
  loader: {
    '.css': 'css',
    '.jpg': 'dataurl',
    '.jpeg': 'dataurl',
    '.png': 'dataurl',
    '.svg': 'text',
  },
  logLevel: 'info',
  minify: true,
  outdir: offlineSiteDir,
  platform: 'browser',
  splitting: false,
  target: ['chrome109', 'safari15'],
  write: false,
})

const jsFile = buildResult.outputFiles.find((file) => file.path.endsWith('.js'))
const cssFile = buildResult.outputFiles.find((file) => file.path.endsWith('.css'))

if (!jsFile || !cssFile) {
  throw new Error('Offline build missing JS or CSS output.')
}

const js = jsFile.text
const css = cssFile.text
const favicon = await readFile(
  path.join(projectRoot, 'public', 'favicon.svg'),
  'utf8',
)
const faviconDataUrl = `data:image/svg+xml,${encodeURIComponent(favicon)}`

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="邵扬帆 / NafYoung 的卡通风个人品牌站，聚焦 AI-native 的运营、产品表达与独立项目实践。"
    />
    <meta name="theme-color" content="#f6edd4" />
    <link rel="icon" type="image/svg+xml" href="${faviconDataUrl}" />
    <title>邵扬帆 / NafYoung - Cartoon Portfolio</title>
    <style>
${css}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
${js}
    </script>
  </body>
</html>
`

await writeFile(offlineHtmlPath, html, 'utf8')
