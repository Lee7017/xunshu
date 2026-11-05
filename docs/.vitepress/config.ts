import { defineConfig } from 'vitepress'
import { createChangelogSidebar } from './changelogSidebar'

const base = process.env.SITE_BASE || '/'

export default defineConfig({
  lang: 'zh-CN',
  title: '迅树 MD',
  description: '迅树 MD — 局域网同步、文件树管理与 Super MarkDown',
  base,
  // GitHub Pages 无法保证扩展名省略后的直访行为，使用 .html 文档路由
  cleanUrls: false,
  lastUpdated: true,
  ...(process.env.SITE_URL ? { sitemap: { hostname: process.env.SITE_URL } } : {}),
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: `${base}apple-touch-icon.png` }],
    ['meta', { name: 'theme-color', content: '#f1f2f5' }],
    ['meta', { name: 'description', content: '迅树 MD — 本地优先的 Markdown 笔记与资料管理工具' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: '迅树 MD',
    nav: [
      { text: '首页', link: '/' },
      { text: '下载', link: '/download/' },
      { text: '使用文档', link: '/guide/' },
      { text: '在线体验', link: '/demo/' },
      { text: '更新日志', link: '/changelog/' },
      { text: '关于', link: '/about/' }
    ],
    sidebar: {
      '/guide/': [
        { text: '快速开始', items: [
          { text: '使用文档首页', link: '/guide/' },
          { text: '下载安装', link: '/guide/install.html' },
          { text: '创建第一篇笔记', link: '/guide/getting-started.html' }
        ] },
        { text: '笔记编辑', items: [
          { text: 'Markdown 编辑', link: '/guide/markdown.html' },
          { text: '手写与多格式附件', link: '/guide/attachments.html' },
          { text: '文件树管理', link: '/guide/folders.html' }
        ] },
        { text: '数据与同步', items: [
          { text: '本地保存', link: '/guide/saving.html' },
          { text: '局域网同步', link: '/guide/sync.html' }
        ] },
        { text: '帮助', items: [
          { text: '常见问题', link: '/guide/faq.html' }
        ] }
      ],
      // 更新日志使用独立侧边栏；版本列表由实际已发布的 Markdown 文件自动生成。
      '/changelog/': createChangelogSidebar()
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换为浅色模式',
    darkModeSwitchTitle: '切换为深色模式',
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '目录',
    footer: { copyright: 'Copyright © 2026 迅树 MD. All rights reserved.' }
  }
})
