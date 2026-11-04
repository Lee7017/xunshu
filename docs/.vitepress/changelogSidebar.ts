import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { DefaultTheme } from 'vitepress'

// 仅将真实存在的版本 Markdown 文档展示在侧边栏，不虚构发布版本。
// 文件命名：YYYY-MM-DD-v1.2.3.md，例如 2026-11-02-v1.0.0.md
const releaseDirectory = fileURLToPath(new URL('../changelog/releases/', import.meta.url))
const filenamePattern = /^(\d{4})-(\d{2})-(\d{2})-(v[0-9][a-zA-Z0-9.+_-]*)\.md$/

type Release = { year: string; date: string; version: string; filename: string }

export function createChangelogSidebar(): DefaultTheme.SidebarItem[] {
  const releases: Release[] = existsSync(releaseDirectory)
    ? readdirSync(releaseDirectory)
        .map((filename): Release | null => {
          const match = filename.match(filenamePattern)
          if (!match) return null
          const [, year, month, day, version] = match
          return { year, date: `${year}-${month}-${day}`, version, filename }
        })
        .filter((entry): entry is Release => entry !== null)
        .sort((a, b) => b.date.localeCompare(a.date) || b.version.localeCompare(a.version))
    : []

  const overview: DefaultTheme.SidebarItem = {
    text: '更新日志',
    items: [{ text: '全部更新', link: '/changelog/' }],
  }

  if (releases.length === 0) {
    return [overview, { text: '版本历史', items: [{ text: '暂无已发布版本' }] }]
  }

  const years = [...new Set(releases.map((release) => release.year))]
  return [
    overview,
    ...years.map((year): DefaultTheme.SidebarItem => ({
      text: `${year} 年`,
      items: releases
        .filter((release) => release.year === year)
        .map((release) => ({
          text: `${release.version} · ${release.date}`,
          link: `/changelog/releases/${release.filename.replace(/\.md$/, '.html')}`,
        })),
    })),
  ]
}
