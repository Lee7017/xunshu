<script setup lang="ts">
import { withBase } from 'vitepress'
import {
  ArrowRight, ArrowLeftRight, Download, Play, Folder, FolderOpen, FileText,
  NotebookPen, HardDrive, Monitor, Tablet, Smartphone, Network, FileAudio,
  FileVideo, FileSpreadsheet, Presentation, FileType, PencilLine, Check,
  ChevronDown, ChevronRight, PanelLeft, MoreHorizontal, CheckSquare,
  Circle, FilePlus2, FolderPlus, Layers3, Maximize2, Square
} from 'lucide-vue-next'
</script>

<template>
  <main class="landing">
    <section class="landing-hero section-width">
      <p class="eyebrow"><span class="status-dot" /> 本地优先 · 自由记录 · 多端整理</p>
      <h1>让每份记录，<br class="mobile-only" />成为自己的资产</h1>
      <p class="hero-lead">以 Markdown 为基础，融合首页文件树、多格式附件与局域网同步。<br class="desktop-only" />在自己的设备中，建立清晰而自由的个人资料库。</p>
      <div class="hero-actions">
        <a class="xs-button primary" :href="withBase('/download/')"><Download :size="17" />下载迅树 MD</a>
        <a class="xs-button secondary" :href="withBase('/demo/')"><Play :size="17" />在线体验</a>
      </div>
      <p class="platform-caption">面向 Windows / macOS / Android / iOS / iPadOS · 实际开放平台以发布信息为准</p>
    </section>

    <section class="section-width preview-section" aria-label="软件界面布局示意">
      <div class="preview-browser">
        <div class="browser-top">
          <span class="browser-dots"><i /><i /><i /></span>
          <span>迅树 MD · 工作区界面</span>
          <PanelLeft :size="16" />
        </div>
        <div class="preview-workspace">
          <div class="preview-files">
            <div class="preview-files-title"><FolderOpen :size="16" /> 我的笔记 <span class="preview-actions"><FilePlus2 :size="14"/><FolderPlus :size="14"/></span></div>
            <div class="preview-file-row"><ChevronDown :size="14"/><Folder :size="15"/>个人资料</div>
            <div class="preview-file-row inset"><FileText :size="14"/>日常记录.md</div>
            <div class="preview-file-row inset"><FileText :size="14"/>读书笔记.md</div>
            <div class="preview-file-row"><ChevronDown :size="14"/><Folder :size="15"/>学习与工作</div>
            <div class="preview-file-row inset current"><FileText :size="14"/>项目计划.md</div>
            <div class="preview-file-row"><ChevronRight :size="14"/><Folder :size="15"/>资料归档</div>
            <div class="preview-storage"><HardDrive :size="15"/>本地资料库</div>
          </div>
          <div class="preview-note">
            <div class="note-location">学习与工作 / 项目计划.md <MoreHorizontal :size="17"/></div>
            <h2>项目计划</h2>
            <p>Markdown 让记录与管理更直接。</p>
            <h3>本周重点</h3>
            <div class="task-line"><CheckSquare :size="17" class="complete" />整理笔记与项目资料</div>
            <div class="task-line"><Square :size="17"/>完善学习记录</div>
            <div class="drawing-card">
              <div class="drawing-top"><PencilLine :size="16"/>手写内容<Maximize2 :size="15" class="right"/></div>
              <svg aria-label="手写画布占位示意" viewBox="0 0 660 135" preserveAspectRatio="xMidYMid meet">
                <path d="M30 96 C76 8 125 105 164 57 S258 23 295 69 S368 111 411 37 S500 70 550 45 S606 66 632 36" fill="none" stroke="currentColor" stroke-width="3.6" stroke-opacity=".64" stroke-linecap="round"/>
                <path d="M78 115 L177 115 L215 95 L331 95 L387 113 L552 113" fill="none" stroke="currentColor" stroke-dasharray="6 8" stroke-opacity=".17" stroke-width="2"/>
                <circle cx="297" cy="69" r="6" fill="currentColor" fill-opacity=".48"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <p class="figure-caption">界面布局示意 · 正式发布时替换为经过验收的真实应用截图 · <a :href="withBase('/screenshots/')">查看截图页面</a></p>
    </section>

    <section class="section-intro section-width">
      <span class="eyebrow">三大核心亮点</span>
      <h2>专注记录，兼顾更多可能</h2>
      <p>同步、管理、内容扩展。构成迅树 MD 的核心体验。</p>
    </section>

    <section class="feature-section section-width">
      <div class="feature-copy">
        <p class="feature-index">01 <span>/</span> 局域网同步</p>
        <h2>数据局域网同步，<br/>打造你的个人资产。</h2>
        <p>数据存储在自己的设备中，通过局域网进行手动同步。面向五端，让桌面、平板、手机各有优势，跨屏整理更方便。</p>
        <a class="text-link" :href="withBase('/guide/sync.html')">了解局域网同步 <ArrowRight :size="17"/></a>
      </div>
      <div class="feature-visual visual-sync">
        <div class="sync-devices">
          <div class="sync-device"><Monitor :size="38"/><strong>大屏</strong><span>集中整理</span></div>
          <div class="sync-device"><Tablet :size="38"/><strong>中屏</strong><span>阅读与手写</span></div>
          <div class="sync-device"><Smartphone :size="38"/><strong>小屏</strong><span>随手记录</span></div>
        </div>
        <div class="sync-connection"><ArrowLeftRight :size="19" /><span>局域网 P2P · 用户主动同步</span><ArrowLeftRight :size="19"/></div>
        <div class="visual-caption"><Network :size="15"/>不依赖中心云存储来完成局域网文件同步</div>
      </div>
    </section>

    <section class="feature-section section-width reverse">
      <div class="feature-copy">
        <p class="feature-index">02 <span>/</span> 文件树管理</p>
        <h2>首页文件树，<br/>多笔记管理一目了然。</h2>
        <p>目录层级清晰、文件组织直观。日常记录、学习资料与工作文档各归其位，洁癖与强迫症的福音。</p>
        <a class="text-link" :href="withBase('/guide/folders.html')">了解笔记管理 <ArrowRight :size="17"/></a>
      </div>
      <div class="feature-visual visual-tree">
        <div class="tree-card">
          <div class="tree-heading"><FolderOpen :size="19"/><strong>我的文件</strong><span><FolderPlus :size="16"/><FilePlus2 :size="16"/></span></div>
          <div class="tree-list">
            <div class="tree-line"><ChevronDown :size="16"/><Folder :size="18"/>学习资料</div>
            <div class="tree-line l1"><ChevronDown :size="16"/><FolderOpen :size="18"/>读书摘录</div>
            <div class="tree-line l2"><FileText :size="17"/>第一章.md</div>
            <div class="tree-line l2 selected"><FileText :size="17"/>第二章.md</div>
            <div class="tree-line l1"><ChevronRight :size="16"/><Folder :size="18"/>课程笔记</div>
            <div class="tree-line"><ChevronRight :size="16"/><Folder :size="18"/>工作项目</div>
            <div class="tree-line"><ChevronRight :size="16"/><Folder :size="18"/>个人生活</div>
          </div>
        </div>
      </div>
    </section>

    <section class="feature-section section-width">
      <div class="feature-copy">
        <p class="feature-index">03 <span>/</span> Super MarkDown</p>
        <h2>Super MarkDown，<br/>让一篇笔记容纳更多内容。</h2>
        <p>在 Markdown 基础上扩展手写、音频、视频和 Word、Excel、PPT、PDF 等附件。Office 文档仅渲染查看，未来还将支持更多附件格式。</p>
        <a class="text-link" :href="withBase('/guide/attachments.html')">了解多格式附件 <ArrowRight :size="17"/></a>
      </div>
      <div class="feature-visual visual-super">
        <div class="super-document">
          <div class="super-title"><FileText :size="19"/><strong>学习笔记.md</strong><MoreHorizontal :size="17" class="right"/></div>
          <h3># 今天的学习资料</h3>
          <p>在正文中组织不同类型的内容。</p>
          <div class="super-cards">
            <div><PencilLine :size="22"/><strong>手写 / 绘图</strong><span>可编辑画布</span></div>
            <div><FileVideo :size="22"/><strong>音频 / 视频</strong><span>媒体内容</span></div>
          </div>
          <div class="formats">
            <span><FileText :size="15"/>Word</span>
            <span><FileSpreadsheet :size="15"/>Excel</span>
            <span><Presentation :size="15"/>PPT</span>
            <span><FileType :size="15"/>PDF</span>
          </div>
          <small>Office 文档仅渲染 · 不直接编辑</small>
        </div>
      </div>
    </section>

    <section class="final-cta section-width">
      <span class="eyebrow">从这里开始</span>
      <h2>开始使用迅树 MD</h2>
      <p>下载软件，或者在浏览器中探索交互界面。</p>
      <div class="hero-actions">
        <a class="xs-button primary" :href="withBase('/download/')"><Download :size="17"/>软件下载</a>
        <a class="xs-button secondary" :href="withBase('/demo/')"><Play :size="17"/>在线体验</a>
        <a class="xs-button plain" :href="withBase('/guide/')">阅读教程 <ArrowRight :size="17"/></a>
      </div>
    </section>
  </main>
</template>
