/**
 * Optional: DEMO_DIST=/absolute/path/to/real-web-mock-dist npm run build:with-demo
 * This copies an already-built REAL Web Mock application to the site's /demo/ path.
 * It does not build the React/Tauri app, nor silently change Native builds.
 */
import { stat, readdir, cp, rm, access } from 'node:fs/promises'
import { resolve, join } from 'node:path'

const sourceSetting = process.env.DEMO_DIST
if (!sourceSetting) {
  console.log('[demo] DEMO_DIST 未配置：保留官网 /demo/ 待接入说明页。')
  process.exit(0)
}
const source = resolve(sourceSetting)
const dest = resolve('docs/.vitepress/dist/demo')
if (source === dest || dest.startsWith(source + '/')) {
  throw new Error('DEMO_DIST 不能指向官网构建产物或其父目录')
}
await access(join(source, 'index.html'))
const statResult = await stat(source)
if (!statResult.isDirectory()) throw new Error('DEMO_DIST 不是目录')
await rm(dest, { recursive: true, force: true })
await cp(source, dest, { recursive: true })
console.log(`[demo] 已复制真实 Web Mock 静态产物：${source} -> ${dest}`)
console.log('[demo] 请确保 Web Mock 构建所用 Vite base 与 /demo/ 最终部署路径一致。')
