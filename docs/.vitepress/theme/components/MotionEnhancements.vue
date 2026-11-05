<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const selectors = [
  '.landing .preview-section',
  '.landing .section-intro',
  '.landing .feature-section',
  '.landing .final-cta',
  '.page-design .page-intro',
  '.download-page .download-card',
  '.download-page .download-note',
  '.demo-page .demo-panel',
  '.demo-page .demo-rules > div',
  '.screenshots-page .screenshots-grid > section',
  '.VPDoc .content-container'
].join(', ')

let observer: IntersectionObserver | undefined
let frame = 0
let reducedMotion = false

function revealWhenVisible(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue
    entry.target.classList.add('is-revealed')
    observer?.unobserve(entry.target)
  }
}

function scanContent() {
  // 不隐藏当前已显示的区域，避免后退/深链接时页面闪烁。
  const items = document.querySelectorAll<HTMLElement>(selectors)
  let number = 0
  for (const item of items) {
    if (item.dataset.motionReady) continue
    item.dataset.motionReady = 'true'
    if (!observer || item.getBoundingClientRect().top < window.innerHeight - 20) continue
    item.classList.add('motion-reveal')
    item.style.setProperty('--motion-delay', `${(number++ % 3) * 75}ms`)
    observer.observe(item)
  }
}

function activatePage() {
  const page = document.querySelector<HTMLElement>('.VPContent')
  if (!reducedMotion && page) {
    page.classList.remove('motion-route-enter')
    // 触发新页面的进入动画；不修改 VitePress 路由或布局结构。
    void page.offsetWidth
    page.classList.add('motion-route-enter')
  }
  scanContent()
}

function scheduleScan() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(activatePage)
  })
}

function onPointerDown(event: PointerEvent) {
  if (reducedMotion || !(event.target instanceof Element)) return
  const anchor = event.target.closest<HTMLElement>('a.xs-button:not(.disabled)')
  if (!anchor) return
  const rect = anchor.getBoundingClientRect()
  const diameter = Math.max(rect.width, rect.height) * 2.3
  const wave = document.createElement('span')
  wave.className = 'xs-click-wave'
  wave.style.width = `${diameter}px`
  wave.style.height = `${diameter}px`
  wave.style.left = `${event.clientX - rect.left - diameter / 2}px`
  wave.style.top = `${event.clientY - rect.top - diameter / 2}px`
  wave.addEventListener('animationend', () => wave.remove(), { once: true })
  anchor.appendChild(wave)
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reducedMotion && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(revealWhenVisible, { rootMargin: '0px 0px -55px 0px', threshold: .08 })
  }
  document.addEventListener('pointerdown', onPointerDown, { passive: true })
  scheduleScan()
})

watch(() => route.path, async () => {
  await nextTick()
  scheduleScan()
})

onUnmounted(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
  document.removeEventListener('pointerdown', onPointerDown)
})
</script>

<template>
  <!-- 只管理动画，不占用布局，不改变现有页面交互 -->
</template>
