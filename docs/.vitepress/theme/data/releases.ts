/**
 * 将发布状态与真实 GitHub Release 资源地址填入这里。
 * 空 URL 一律展示“尚未开放下载”，避免官网给出假下载入口。
 * Apple 平台需遵守实际签名与分发要求，不能假设可直接发 .ipa。
 */
export interface ReleasePlatform {
  name: string
  icon: 'monitor' | 'smartphone' | 'laptop' | 'tablet'
  description: string
  format: string
  status: '未开放' | '已发布'
  url: string
  version: string
}

export const releasePlatforms: ReleasePlatform[] = [
  { name: 'Windows', icon: 'monitor', description: '桌面安装程序', format: 'EXE / MSI', status: '未开放', url: '', version: '' },
  { name: 'Android', icon: 'smartphone', description: 'Android 安装包', format: 'APK', status: '未开放', url: '', version: '' },
  { name: 'macOS', icon: 'laptop', description: 'Mac 安装程序', format: 'DMG / PKG', status: '未开放', url: '', version: '' },
  { name: 'iOS / iPadOS', icon: 'tablet', description: '须符合 Apple 分发要求', format: '实际分发渠道待确定', status: '未开放', url: '', version: '' }
]

// 可填写自己的 Releases 页面网址；不要放占位的 OWNER/REPO URL
export const releasesPageUrl = 'https://github.com/Lee7017/xunshu/releases'

// 仅用于验证 GitHub Pages 官网到 GitHub Releases 的真实下载流程，不是软件安装包。
export const testDownloadUrl = 'https://github.com/Lee7017/xunshu/releases/download/test-download-v1/xunshu-test-download.png'
