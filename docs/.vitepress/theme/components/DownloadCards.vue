<script setup lang="ts">
import { withBase } from 'vitepress'
import { Download, Monitor, Smartphone, Laptop, Tablet, Github, ShieldCheck, Info, ArrowRight } from 'lucide-vue-next'
import { releasePlatforms, releasesPageUrl, testDownloadUrl } from '../data/releases'
const iconMap = { monitor: Monitor, smartphone: Smartphone, laptop: Laptop, tablet: Tablet }
</script>

<template>
  <main class="page-design download-page section-width">
    <div class="page-intro">
      <span class="eyebrow">软件下载</span>
      <h1>下载迅树 MD</h1>
      <p>选择适合你设备的安装版本。页面只提供实际发布的 GitHub Releases 资源。</p>
    </div>
    <section class="invite-banner" aria-labelledby="download-invite-title">
      <div>
        <h2 id="download-invite-title">申请内测邀请码</h2>
        <p>希望提前体验？填写手机号，用你自己的邮箱发送申请，我们通过邮件回复。</p>
      </div>
      <a class="xs-button secondary" :href="withBase('/invite/')">申请邀请码 <ArrowRight :size="17" /></a>
    </section>
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
    <div class="download-note test-download-note">
      <Info :size="23"/>
      <div>
        <strong>下载链路测试 · PNG 图片</strong>
        <p>这是用于测试官网下载是否正常的迅树 MD 软件图标，不是真实安装包。点击下方按钮将从 GitHub Releases 下载 PNG 文件。</p>
        <a class="xs-button secondary download-test-action" :href="testDownloadUrl" target="_blank" rel="noopener noreferrer"><Download :size="16"/>下载测试图片（PNG）</a>
      </div>
    </div>
    <div class="download-note">
      <Github :size="23"/>
      <div><strong>统一使用 GitHub Releases 发布安装包</strong><p>123 云盘只规划用于软件内部云端同步，不是下载渠道。发布新版本后，在 <code>releases.ts</code> 填入真实资源地址并修改状态。</p>
      <a v-if="releasesPageUrl" class="text-link" :href="releasesPageUrl" target="_blank" rel="noopener noreferrer">查看所有历史版本 <ArrowRight :size="17"/></a></div>
    </div>
    <div class="download-support"><ShieldCheck :size="18"/><span>正式下载前请核对发行者、版本号和文件来源。Apple 平台须按实际签名及分发流程处理。</span></div>
    <div class="subpage-actions"><a class="xs-button secondary" :href="withBase('/changelog/')">阅读更新日志 <ArrowRight :size="17"/></a><a class="xs-button secondary" :href="withBase('/guide/install.html')">查看安装教程 <ArrowRight :size="17"/></a></div>
  </main>
</template>
