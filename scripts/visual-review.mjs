import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const origin = process.env.PREVIEW_URL || 'http://127.0.0.1:4173/xunshu/'
const output = 'visual-review'
mkdirSync(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const failures = []
const findings = []

async function capture(page, filename, fullPage = true) {
  await page.screenshot({ path: path.join(output, filename), fullPage, animations: 'disabled' })
}

// Export compact desktop/mobile reference frames into log for remote visual review.
// The full-resolution PNG screenshots are retained separately as downloadable artifacts.
async function printReference(page, label) {
  const data = await page.screenshot({ type: 'jpeg', quality: 52, fullPage: false, animations: 'disabled' })
  const base64 = data.toString('base64')
  console.log('VISUAL_START:' + label)
  for (let i = 0; i < base64.length; i += 1600) console.log('VISUAL_PART:' + base64.slice(i, i + 1600))
  console.log('VISUAL_END:' + label)
}

for (const c of [
  { label: 'home-desktop', url: '', width: 1440, height: 900, mobile: false },
  { label: 'downloads-desktop', url: 'download/', width: 1440, height: 900, mobile: false },
  { label: 'home-mobile', url: '', width: 390, height: 844, mobile: true },
  { label: 'downloads-mobile', url: 'download/', width: 390, height: 844, mobile: true }
]) {
  const context = await browser.newContext({
    viewport: { width: c.width, height: c.height },
    deviceScaleFactor: 1,
    isMobile: c.mobile,
    hasTouch: c.mobile,
    reducedMotion: 'no-preference'
  })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', err => pageErrors.push(err.message))
  const response = await page.goto(new URL(c.url, origin).href, { waitUntil: 'networkidle', timeout: 45000 })
  await page.screenshot({ path: path.join(output, c.label + '.png'), fullPage: true, animations: 'disabled' })
  const check = await page.evaluate(() => ({
    title: document.title,
    heading: document.querySelector('h1')?.textContent?.trim(),
    overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    pageOpacity: getComputedStyle(document.querySelector('.VPContent') || document.body).opacity,
    hiddenReveal: document.querySelectorAll('.motion-reveal:not(.is-revealed)').length,
    navCount: document.querySelectorAll('.VPNavBarMenuLink').length
  }))
  if (!response?.ok()) failures.push(c.label + ': HTTP ' + response?.status())
  if (!check.heading) failures.push(c.label + ': missing h1')
  if (check.overflow > 2) failures.push(c.label + ': horizontal overflow ' + check.overflow + 'px')
  if (check.hiddenReveal) failures.push(c.label + ': content hidden by reveal animation')
  if (pageErrors.length) failures.push(c.label + ': JS exceptions ' + pageErrors.join(' | '))
  findings.push({ page: c.label, ...check, pageErrors })
  if (c.label === 'home-desktop') {
    const button = page.locator('.landing-hero .xs-button.primary').first()
    const before = await button.evaluate(el => ({ background: getComputedStyle(el).backgroundColor, transform: getComputedStyle(el).transform }))
    await button.hover()
    await page.waitForTimeout(220)
    const after = await button.evaluate(el => ({ background: getComputedStyle(el).backgroundColor, transform: getComputedStyle(el).transform }))
    if (before.background === after.background) failures.push('primary button hover has no visible color change')
    if (after.transform !== 'none') failures.push('primary button hover unexpectedly moves')
    await capture(page, 'home-hover-desktop.png')
    findings.push({ component: 'primary-hover', before, after })
  }
  if (c.label === 'downloads-desktop') {
    const link = page.getByRole('link', { name: /下载测试图片/ }).first()
    const href = await link.getAttribute('href')
    if (!href?.includes('/releases/download/test-download-v1/xunshu-test-download.png')) failures.push('test download link missing')
    const card = page.locator('.download-card').first()
    const transformBefore = await card.evaluate(el => getComputedStyle(el).transform)
    await card.hover()
    await page.waitForTimeout(220)
    const transformAfter = await card.evaluate(el => getComputedStyle(el).transform)
    if (transformBefore !== transformAfter) failures.push('non-clickable download card moves on hover')
    findings.push({ component: 'download-card', transformBefore, transformAfter, href })
    await capture(page, 'downloads-hover-desktop.png')
  }
  // 删除搜索后，不应出现搜索按钮、搜索弹窗或有宽度的搜索占位。
  const searchState = await page.evaluate(() => {
    const slot = document.querySelector('.VPNavBarSearch')
    return {
      buttonCount: document.querySelectorAll('.VPNavBarSearch button, .DocSearch-Button').length,
      dialogCount: document.querySelectorAll('.VPLocalSearchBox').length,
      slotVisible: !!slot && getComputedStyle(slot).display !== 'none',
      slotWidth: slot ? slot.getBoundingClientRect().width : 0
    }
  })
  if (searchState.buttonCount || searchState.dialogCount || searchState.slotVisible || searchState.slotWidth > 0)
    failures.push(c.label + ': search UI was not fully removed')
  findings.push({ test: 'search-removed-' + c.label, ...searchState })
  if (c.label === 'home-desktop') {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(180)
    if (await page.locator('.VPLocalSearchBox').count()) failures.push('desktop: Ctrl+K still opens search')
  }
  if (c.label === 'home-desktop') {
    // “关于”必须是链接，不能是悬浮即展开的下拉按钮。
    const about = page.locator('.VPNavBarMenu').getByRole('link', { name: '关于', exact: true })
    if (await about.count() !== 1) failures.push('desktop: 关于 is not a single link')
    else {
      await about.hover()
      await page.waitForTimeout(250)
      const groupCount = await page.locator('.VPNavBarMenuGroup').count()
      if (groupCount !== 0) failures.push('desktop: hovering about still opens a nav dropdown')
      await capture(page, 'about-nav-desktop-before-click.png', false)
      await about.click()
      await page.waitForURL(/\/xunshu\/about\/?(?:\.html)?$/, { timeout: 6000 })
      await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('关于迅树 MD'), null, { timeout: 8000 })
      const heading = await page.locator('h1').first().textContent()
      const acknowledgements = await page.getByRole('link', { name: '开源致谢' }).count()
      const licenses = await page.getByRole('link', { name: '第三方许可证' }).count()
      if (!heading?.includes('关于迅树 MD')) failures.push('desktop: about page heading is wrong')
      if (!acknowledgements || !licenses) failures.push('desktop: about page is missing related links')
      await capture(page, 'about-page-desktop.png')
      findings.push({ test: 'about-desktop', heading, acknowledgements, licenses, dropdownCount: groupCount })
    }
  }
  if (c.label === 'home-mobile') {
    const toggle = page.locator('.VPNavBarHamburger').first()
    await toggle.click()
    const link = page.locator('.VPNavScreen').getByRole('link', { name: '关于', exact: true })
    if (await link.count() !== 1) failures.push('mobile: 关于 is not a single link')
    else {
      await capture(page, 'about-nav-mobile-open.png', false)
      await link.click()
      await page.waitForURL(/\/xunshu\/about\/?(?:\.html)?$/, { timeout: 6000 })
      await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('关于迅树 MD'), null, { timeout: 8000 })
      const heading = await page.locator('h1').first().textContent()
      if (!heading?.includes('关于迅树 MD')) failures.push('mobile: about did not navigate')
      await capture(page, 'about-page-mobile.png')
      findings.push({ test: 'about-mobile', heading })
    }
  }
  if (c.label === 'home-desktop' || c.label === 'home-mobile') await printReference(page, c.label)
  if (c.label === 'downloads-desktop') await printReference(page, c.label)
  await context.close()
}

// 全站一致性检查：包括深/浅色、首页/下载/演示/截图/文档/日志/关于/许可证，
// 以及三项不同操作在桌面和手机上是否具有相同的尺寸、圆角和对齐方式。
for (const c of [
  { label: 'home-dark-desktop', url: '', width: 1440, height: 900, theme: 'dark' },
  { label: 'home-light-desktop', url: '', width: 1440, height: 900, theme: 'light' },
  { label: 'home-dark-mobile', url: '', width: 390, height: 844, theme: 'dark' },
  { label: 'home-light-mobile', url: '', width: 390, height: 844, theme: 'light' },
  { label: 'home-light-tablet', url: '', width: 768, height: 1024, theme: 'light' },
  { label: 'download-dark-desktop', url: 'download/', width: 1440, height: 900, theme: 'dark' },
  { label: 'download-light-mobile', url: 'download/', width: 390, height: 844, theme: 'light' },
  { label: 'demo-dark-desktop', url: 'demo/', width: 1440, height: 900, theme: 'dark' },
  { label: 'demo-light-mobile', url: 'demo/', width: 390, height: 844, theme: 'light' },
  { label: 'screenshots-dark-desktop', url: 'screenshots/', width: 1440, height: 900, theme: 'dark' },
  { label: 'screenshots-light-mobile', url: 'screenshots/', width: 390, height: 844, theme: 'light' },
  { label: 'guide-dark-desktop', url: 'guide/', width: 1440, height: 900, theme: 'dark' },
  { label: 'guide-light-mobile', url: 'guide/', width: 390, height: 844, theme: 'light' },
  { label: 'changelog-dark-desktop', url: 'changelog/', width: 1440, height: 900, theme: 'dark' },
  { label: 'about-light-desktop', url: 'about/', width: 1440, height: 900, theme: 'light' },
  { label: 'acknowledgements-light-desktop', url: 'acknowledgements/', width: 1440, height: 900, theme: 'light' },
  { label: 'licenses-dark-desktop', url: 'licenses/', width: 1440, height: 900, theme: 'dark' },
  { label: 'faq-light-mobile', url: 'guide/faq.html', width: 390, height: 844, theme: 'light' }
]) {
  const context = await browser.newContext({
    viewport: { width: c.width, height: c.height },
    colorScheme: c.theme,
    deviceScaleFactor: 1,
    isMobile: c.width <= 390,
    hasTouch: c.width <= 390
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  const response = await page.goto(new URL(c.url, origin).href, { waitUntil: 'networkidle', timeout: 45000 })
  const metrics = await page.evaluate(() => {
    const el = document.documentElement
    const buttons = [...document.querySelectorAll('.xs-button')]
      .map(x => ({ text: x.textContent.trim(), width: x.getBoundingClientRect().width,
        height: x.getBoundingClientRect().height, radius: getComputedStyle(x).borderRadius }))
    return { title: document.title, heading: document.querySelector('h1')?.textContent?.trim(),
      overflow: Math.max(0, el.scrollWidth - window.innerWidth),
      buttons, theme: el.classList.contains('dark') ? 'dark' : 'light',
      searchVisible: !!document.querySelector('.VPNavBarSearch') && getComputedStyle(document.querySelector('.VPNavBarSearch')).display !== 'none',
      copyright: document.querySelector('.VPFooter .copyright')?.textContent?.trim() ?? '',
      footerVisible: !!document.querySelector('.VPFooter') && getComputedStyle(document.querySelector('.VPFooter')).display !== 'none'
    }
  })
  if (!response?.ok()) failures.push(c.label + ': HTTP ' + response?.status())
  if (!metrics.heading) failures.push(c.label + ': missing page title')
  if (metrics.overflow > 2) failures.push(c.label + ': horizontal overflow ' + metrics.overflow)
  if (metrics.searchVisible) failures.push(c.label + ': removed search is visible')
  if (!metrics.footerVisible || metrics.copyright !== 'Copyright © 2026 迅树 MD. All rights reserved.')
    failures.push(c.label + ': copyright footer missing, hidden, or incorrect')
  if (metrics.theme !== c.theme) failures.push(c.label + ': mismatched color theme ' + metrics.theme)
  if (errors.length) failures.push(c.label + ': JS errors ' + errors.join(' | '))
  for (const b of metrics.buttons) {
    if (b.height < 45 || b.height > 49) failures.push(c.label + ': button height inconsistent: ' + b.text + '=' + b.height)
    if (b.radius !== '12px') failures.push(c.label + ': button corner radius inconsistent: ' + b.text + '=' + b.radius)
  }
  if (c.label.startsWith('home')) {
    const cta = page.locator('.final-cta')
    const buttons = cta.locator('.hero-actions .xs-button')
    const count = await buttons.count()
    if (count !== 3) failures.push(c.label + ': expected 3 CTA buttons, got ' + count)
    else {
      const rects = await buttons.evaluateAll(els => els.map(el => {
        const rect = el.getBoundingClientRect()
        return { label: el.textContent?.trim(), width: rect.width, height: rect.height, x: rect.left, y: rect.top, radius: getComputedStyle(el).borderRadius }
      }))
      const widths = rects.map(x => x.width)
      if (Math.max(...widths) - Math.min(...widths) > 2) failures.push(c.label + ': CTA button widths are inconsistent')
      if (c.width > 680 && Math.max(...rects.map(x => x.y)) - Math.min(...rects.map(x => x.y)) > 2)
        failures.push(c.label + ': CTA buttons are not aligned horizontally')
      if (c.width <= 390 && Math.max(...rects.map(x => x.x)) - Math.min(...rects.map(x => x.x)) > 2)
        failures.push(c.label + ': mobile CTA buttons are not aligned vertically')
      findings.push({ page: c.label, test: 'cta-alignment', buttons: rects })
      await cta.screenshot({ path: path.join(output, c.label + '-final-cta.png'), animations: 'disabled' })
    }
  }
  if (c.label === 'download-dark-desktop') {
    const cards = page.locator('.download-card')
    const heights = await cards.evaluateAll(els => els.map(el => Math.round(el.getBoundingClientRect().height)))
    const actionRects = await page.locator('.download-action').evaluateAll(els => els.map(el => ({
      y: Math.round(el.getBoundingClientRect().top), height: Math.round(el.getBoundingClientRect().height)
    })))
    if (Math.abs(heights[0] - heights[1]) > 2 || Math.abs(actionRects[0].y - actionRects[1].y) > 2)
      failures.push('download-desktop: card actions not aligned')
    if (await page.locator('.test-download-note [style]').count()) failures.push('download: inline style remains on test download section')
    findings.push({ page: c.label, test: 'download-card-alignment', heights, actionRects })
  }
  if (['home-dark-desktop','home-light-mobile','download-dark-desktop','demo-dark-desktop',
    'screenshots-dark-desktop','guide-dark-desktop','changelog-dark-desktop'].includes(c.label))
    await capture(page, 'site-' + c.label + '.png', true)
  findings.push({ page: c.label, test: 'layout-review', heading: metrics.heading, overflow: metrics.overflow,
    buttons: metrics.buttons.length, theme: metrics.theme, footerVisible: metrics.footerVisible, copyright: metrics.copyright, pageErrors: errors })
  await context.close()
}

// 内测邀请码：仅显示发邮件说明，支持复制；不收集手机号、不触发 mailto。
for (const item of [
  { label: 'invite-desktop-light', width: 1440, height: 900, theme: 'light' },
  { label: 'invite-desktop-dark', width: 1440, height: 900, theme: 'dark' },
  { label: 'invite-mobile-light', width: 390, height: 844, theme: 'light' },
  { label: 'invite-mobile-dark', width: 390, height: 844, theme: 'dark' }
]) {
  const ctx = await browser.newContext({
    viewport: { width: item.width, height: item.height }, colorScheme: item.theme,
    isMobile: item.width < 500, hasTouch: item.width < 500,
    permissions: ['clipboard-read', 'clipboard-write']
  })
  const page = await ctx.newPage()
  const pageErrors = []
  page.on('pageerror', err => pageErrors.push(err.message))
  const response = await page.goto(new URL('invite/', origin).href, { waitUntil: 'networkidle' })
  if (!response?.ok()) failures.push(item.label + ': invite page HTTP ' + response?.status())
  const instructions = page.locator('.invite-panel')
  const content = await instructions.textContent()
  for (const word of ['昵称', '手机号', '3406521093@qq.com', '迅树 MD 内测邀请码申请', '使用自己的账号']) {
    if (!content?.includes(word)) failures.push(item.label + ': missing instruction ' + word)
  }
  if (await instructions.locator('form, input, [data-mailto], a[href^="mailto:"]').count())
    failures.push(item.label + ': legacy form or mailto still exists')
  const emailButton = page.getByRole('button', { name: '复制邮箱' })
  const subjectButton = page.getByRole('button', { name: '复制主题' })
  const bodyButton = page.getByRole('button', { name: '复制邮件正文' })
  await emailButton.click()
  const emailClipboard = await page.evaluate(() => navigator.clipboard.readText())
  if (emailClipboard !== '3406521093@qq.com') failures.push(item.label + ': email copy mismatch')
  await subjectButton.click()
  const subjectClipboard = await page.evaluate(() => navigator.clipboard.readText())
  if (subjectClipboard !== '迅树 MD 内测邀请码申请') failures.push(item.label + ': subject copy mismatch')
  await bodyButton.click()
  const bodyClipboard = await page.evaluate(() => navigator.clipboard.readText())
  if (!bodyClipboard.includes('昵称：请填写你的昵称') || !bodyClipboard.includes('手机号：请填写你的手机号'))
    failures.push(item.label + ': body template copy mismatch')
  const layout = await page.evaluate(() => ({
    overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    title: document.querySelector('h1')?.textContent?.trim(),
    buttons: [...document.querySelectorAll('.invite-panel .xs-button')].map(el => ({
      height: Math.round(el.getBoundingClientRect().height), corners: getComputedStyle(el).borderRadius
    })),
    footer: document.querySelector('.VPFooter .copyright')?.textContent?.trim()
  }))
  if (layout.overflow > 1) failures.push(item.label + ': horizontal overflow')
  if (layout.buttons.length !== 3 || layout.buttons.some(b => b.height !== 46 || b.corners !== '12px'))
    failures.push(item.label + ': copy button styling inconsistent')
  if (layout.footer !== 'Copyright © 2026 迅树 MD. All rights reserved.') failures.push(item.label + ': footer missing')
  if (pageErrors.length) failures.push(item.label + ': JS exceptions ' + pageErrors.join(' | '))
  findings.push({ test: 'invite-manual-email', variant: item.label, emailClipboard, subjectClipboard, bodyCopied: true, ...layout })
  await capture(page, item.label + '.png', true)
  await ctx.close()
}
for (const entry of [{label:'home',url:''},{label:'download',url:'download/'}]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(new URL(entry.url,origin).href, { waitUntil: 'networkidle' })
  const links = page.getByRole('link', { name: /申请邀请码/ })
  if (await links.count() === 0) failures.push(entry.label + ': no invite entry')
  else if (!(await links.first().getAttribute('href'))?.includes('/xunshu/invite/'))
    failures.push(entry.label + ': invite entry has wrong URL')
  await ctx.close()
}

// 文档右侧目录：检查活动标记必须留在卡片内，并与当前小标题居中对齐。
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const response = await page.goto(new URL('guide/faq.html', origin).href, { waitUntil: 'networkidle' })
  if (!response?.ok()) failures.push('faq: page did not load')
  const links = page.locator('.VPDocAsideOutline.has-outline .outline-link')
  if (await links.count() === 0) {
    failures.push('faq: outline links not found')
  } else {
    await links.last().click()
    await page.waitForTimeout(750)
    const geometry = await page.evaluate(() => {
      const aside = document.querySelector('.VPDocAsideOutline.has-outline')
      const marker = aside?.querySelector('.outline-marker')
      const selected = aside?.querySelector('.outline-link.active')
      if (!aside || !marker || !selected) return null
      const a = aside.getBoundingClientRect()
      const m = marker.getBoundingClientRect()
      const l = selected.getBoundingClientRect()
      return {
        activeText: selected.textContent?.trim(),
        opacity: getComputedStyle(marker).opacity,
        markerInside: m.left >= a.left + 8 && m.right < l.left,
        centerDifference: Math.round(Math.abs((m.top + m.height / 2) - (l.top + l.height / 2)) * 10) / 10,
        markerX: Math.round(m.left - a.left),
        linkX: Math.round(l.left - a.left),
        cardWidth: Math.round(a.width)
      }
    })
    if (!geometry) failures.push('faq: active outline marker missing')
    else {
      if (geometry.opacity === '0') failures.push('faq: active marker invisible')
      if (!geometry.markerInside) failures.push('faq: active marker outside card or after text')
      if (geometry.centerDifference > 4) failures.push('faq: outline marker misaligned by ' + geometry.centerDifference + 'px')
    }
    findings.push({ test: 'faq-outline-alignment', ...geometry })
    await capture(page, 'faq-outline-desktop.png', false)
    const aside = page.locator('.VPDocAsideOutline.has-outline').first()
    await aside.screenshot({ path: path.join(output, 'faq-outline-detail.png'), animations: 'disabled' })

    // 回归案例：从最后一项点回倒数第二项，不能仍高亮最后一项。
    const penultimate = links.nth((await links.count()) - 2)
    const penultimateHref = await penultimate.getAttribute('href')
    await penultimate.click()
    await page.waitForTimeout(900)
    const penultimateState = await page.evaluate(() => {
      const entries = [...document.querySelectorAll('.VPDocAsideOutline .outline-link')]
      const active = entries.findIndex(x => x.classList.contains('active'))
      const targetLink = entries[entries.length - 2]
      const id = targetLink?.getAttribute('href')?.slice(1)
      const target = id ? document.getElementById(decodeURIComponent(id)) : null
      const vpDoc = document.querySelector('.VPDoc')
      return {
        hash: decodeURIComponent(location.hash),
        activeIndex: active,
        expectedIndex: entries.length - 2,
        activeText: entries[active]?.textContent?.trim(),
        scrollY: Math.round(window.scrollY),
        maxScroll: document.documentElement.scrollHeight - window.innerHeight,
        headingTop: target ? Math.round(target.getBoundingClientRect().top) : null,
        docBottom: vpDoc ? Math.round(vpDoc.getBoundingClientRect().bottom) : null,
        viewportHeight: innerHeight
      }
    })
    findings.push({ test: 'faq-penultimate-after-last', ...penultimateState })
    await capture(page, 'faq-after-penultimate-click.png', false)
    if (penultimateState.hash !== decodeURIComponent(penultimateHref)) failures.push('faq: penultimate link failed to change URL hash')
    if (penultimateState.activeIndex !== penultimateState.expectedIndex) failures.push('faq: penultimate heading is not highlighted after click')

  }
  if (errors.length) failures.push('faq: JS exceptions: ' + errors.join(' | '))
  await context.close()
}

const reduced = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
const rmPage = await reduced.newPage()
await rmPage.goto(origin, { waitUntil: 'networkidle' })
const animation = await rmPage.locator('.VPMenu').count()
findings.push({ test: 'prefers-reduced-motion', menuCount: animation })
await capture(rmPage, 'home-reduced-motion.png')
await reduced.close()
await browser.close()
console.log('VISUAL_FINDINGS ' + JSON.stringify(findings))
if (failures.length) {
  console.error('VISUAL_FAILURES ' + JSON.stringify(failures))
  process.exitCode = 1
} else console.log('VISUAL_REVIEW_PASSED')
