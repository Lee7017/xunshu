<script setup lang="ts">
import { Image, Monitor, Smartphone, Tablet, ArrowRight } from 'lucide-vue-next'
import { withBase } from 'vitepress'
const slots = [
  { title: '桌面端主界面', desc: '首页文件树、Markdown 编辑与多笔记管理', Icon: Monitor },
  { title: '平板与手写', desc: '展示中等屏幕的手写、阅读与操作布局', Icon: Tablet },
  { title: '移动端界面', desc: '展示小屏笔记管理与适配效果', Icon: Smartphone }
]
</script>
<template>
  <main class="page-design section-width screenshots-page">
    <div class="page-intro"><span class="eyebrow">Screenshots</span><h1>软件截图</h1><p>此版本保留了截图布局位置，正式发布前替换为实际应用截图，不使用假造的软件界面冒充真实运行效果。</p></div>
    <div class="screenshots-grid"><section v-for="slot in slots" :key="slot.title"><div class="screenshot-placeholder"><component :is="slot.Icon" :size="40" stroke-width="1.35"/><span>待放置真实截图</span></div><h2>{{ slot.title }}</h2><p>{{ slot.desc }}</p></section></div>
    <a class="text-link" :href="withBase('/')">返回产品首页 <ArrowRight :size="17"/></a>
  </main>
</template>
