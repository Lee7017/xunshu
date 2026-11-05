import type { Theme } from 'vitepress'
import { Fragment, h } from 'vue'
import MotionEnhancements from './components/MotionEnhancements.vue'
import DefaultTheme from 'vitepress/theme'
import HomeLanding from './components/HomeLanding.vue'
import DownloadCards from './components/DownloadCards.vue'
import DemoNotice from './components/DemoNotice.vue'
import ScreenshotPage from './components/ScreenshotPage.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(Fragment, [h(DefaultTheme.Layout), h(MotionEnhancements)]),
  enhanceApp({ app }) {
    app.component('HomeLanding', HomeLanding)
    app.component('DownloadCards', DownloadCards)
    app.component('DemoNotice', DemoNotice)
    app.component('ScreenshotPage', ScreenshotPage)
  }
} satisfies Theme
