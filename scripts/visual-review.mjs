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
  if (c.label === 'home-desktop') {
    // 搜索放在导航链接后面；点击/快捷键都使用 VitePress 原生弹窗。
    const search = page.locator('.VPNavBarSearch .DocSearch-Button').first()
    const about = page.locator('.VPNavBarMenu').getByRole('link', { name: '关于', exact: true })
    const positions = await page.evaluate(() => {
      const s = document.querySelector('.VPNavBarSearch .DocSearch-Button')?.getBoundingClientRect()
      const a = [...document.querySelectorAll('.VPNavBarMenu a')].find(x => x.textContent?.trim() === '关于')?.getBoundingClientRect()
      return s && a ? { searchLeft: s.left, searchWidth: s.width, aboutRight: a.right } : null
    })
    if (!positions || positions.searchLeft < positions.aboutRight - 1) failures.push('desktop: search button should be to the right of 关于')
    await capture(page, 'search-navbar-desktop.png', false)
    await search.click()
    await page.locator('.VPLocalSearchBox .search-input').waitFor({ state: 'visible' })
    await page.locator('.VPLocalSearchBox .search-input').fill('Markdown')
    const modalStyling = await page.evaluate(() => {
      const shell = document.querySelector('.VPLocalSearchBox .shell')
      const input = document.querySelector('.VPLocalSearchBox .search-input')
      const bar = document.querySelector('.VPLocalSearchBox .search-bar')
      const firstResult = document.querySelector('.VPLocalSearchBox .result')
      if (!shell || !input || !bar) return null
      return {
        width: Math.round(shell.getBoundingClientRect().width),
        inputOutline: getComputedStyle(input).outlineStyle,
        barRadius: getComputedStyle(bar).borderRadius,
        firstBorderWidth: firstResult && getComputedStyle(firstResult).borderTopWidth
      }
    })
    if (!modalStyling) failures.push('search modal missing required elements')
    else {
      if (modalStyling.inputOutline !== 'none') failures.push('search input has nested outline')
      if (modalStyling.firstBorderWidth && parseFloat(modalStyling.firstBorderWidth) > 1) failures.push('search result border too thick')
    }
    if (modalStyling && modalStyling.width > 680) failures.push('desktop: search modal width exceeds 680px')
    await page.waitForTimeout(650)
    const matches = await page.locator('.VPLocalSearchBox .result').count()
    if (matches === 0) failures.push('desktop: Markdown search returned no results')
    await capture(page, 'search-dialog-desktop.png', false)
    await page.keyboard.press('Escape')
    await page.locator('.VPLocalSearchBox').waitFor({ state: 'detached' })
    findings.push({ test: 'search-desktop', positions, matches, modalStyling, closedByEscape: true })
  }
  if (c.label === 'home-mobile') {
    const search = page.locator('.VPNavBarSearch .DocSearch-Button').first()
    await search.click()
    await page.locator('.VPLocalSearchBox .search-input').waitFor({ state: 'visible' })
    await page.locator('.VPLocalSearchBox .search-input').fill('同步')
    const modalStyling = await page.evaluate(() => {
      const shell = document.querySelector('.VPLocalSearchBox .shell')
      const input = document.querySelector('.VPLocalSearchBox .search-input')
      const bar = document.querySelector('.VPLocalSearchBox .search-bar')
      const firstResult = document.querySelector('.VPLocalSearchBox .result')
      if (!shell || !input || !bar) return null
      return {
        width: Math.round(shell.getBoundingClientRect().width),
        inputOutline: getComputedStyle(input).outlineStyle,
        barRadius: getComputedStyle(bar).borderRadius,
        firstBorderWidth: firstResult && getComputedStyle(firstResult).borderTopWidth
      }
    })
    if (!modalStyling) failures.push('search modal missing required elements')
    else {
      if (modalStyling.inputOutline !== 'none') failures.push('search input has nested outline')
      if (modalStyling.firstBorderWidth && parseFloat(modalStyling.firstBorderWidth) > 1) failures.push('search result border too thick')
    }
    if (modalStyling && modalStyling.width > 390) failures.push('mobile: search modal extends beyond viewport')
    await page.waitForTimeout(650)
    const matches = await page.locator('.VPLocalSearchBox .result').count()
    if (matches === 0) failures.push('mobile: search 同步 returned no results')
    await capture(page, 'search-dialog-mobile.png', false)
    const back = page.locator('.VPLocalSearchBox .back-button')
    await back.click()
    await page.locator('.VPLocalSearchBox').waitFor({ state: 'detached' })
    findings.push({ test: 'search-mobile', matches, modalStyling, closedByBack: true })
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
