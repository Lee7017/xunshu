<script setup lang="ts">
import { withBase } from 'vitepress'
import { Download, Monitor, Smartphone, Laptop, Tablet, Github, ShieldCheck, Info } from 'lucide-vue-next'
import { releasePlatforms, releasesPageUrl } from '../data/releases'
const iconMap = { monitor: Monitor, smartphone: Smartphone, laptop: Laptop, tablet: Tablet }
</script>

<template>
  <main class="page-design download-page section-width">
    <div class="page-intro">
      <span class="eyebrow">Download</span>
      <h1>下载迅树 MD</h1>
      <p>选择适合你设备的安装版本。页面只提供实际发布的 GitHub Releases 资源。</p>
    </div>
    <div class="download-grid">
      <article v-for="item in releasePlatforms" :key="item.name" class="download-card">
        <div class="platform-icon"><component :is="iconMap[item.icon]" :size="30" stroke-width="1.55"/></div>
        <div class="download-card-heading"><h2>{{ item.name }}</h2><span :class="item.status === '已发布' ? 'tag live' : 'tag'">{{ item.status }}</span></div>
        <p>{{ item.description }}</p>
        <div class="download-meta">{{ item.format }}<template v-if="item.version"> · {{ item.version }}</template></div>
        <a v-if="item.status === '已发布' && item.url" class="xs-button primary download-action" :href="item.url" target="_blank" rel="noopener noreferrer"><Download :size="16"/>下载 {{ item.name }}</a>
        <span v-else class="xs-button disabled download-action" aria-disabled="true">尚未开放下载</span>
      </article>
    </div>
    <div class="download-note">
      <Github :size="23"/>
      <div><strong>统一使用 GitHub Releases 发布安装包</strong><p>123 云盘只规划用于软件内部云端同步，不是下载渠道。发布新版本后，在 <code>releases.ts</code> 填入真实资源地址并修改状态。</p>
      <a v-if="releasesPageUrl" class="text-link" :href="releasesPageUrl" target="_blank" rel="noopener noreferrer">查看所有历史版本 →</a></div>
    </div>
    <div class="download-support"><ShieldCheck :size="18"/><span>正式下载前请核对发行者、版本号和文件来源。Apple 平台须按实际签名及分发流程处理。</span></div>
    <div class="subpage-actions"><a :href="withBase('/changelog/')">阅读更新日志 →</a><a :href="withBase('/guide/install.html')">查看安装教程 →</a></div>
  </main>
</template>
