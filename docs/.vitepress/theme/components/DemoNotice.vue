<script setup lang="ts">
import { withBase } from 'vitepress'
import { MonitorPlay, HardDrive, RefreshCcw, ShieldOff, ArrowRight, NotebookPen, CheckSquare } from 'lucide-vue-next'
</script>
<template>
  <main class="page-design demo-page section-width">
    <div class="page-intro"><span class="eyebrow">Browser Demo</span><h1>在线体验迅树 MD</h1><p>正式部署后，这里将加载迅树 MD 现有的 React + Vditor Web Mock，而不是另做一套简化版编辑器。</p></div>
    <div class="demo-panel">
      <div class="demo-panel-top"><span><MonitorPlay :size="19"/> Web Mock 接入位置</span><span class="tag">未接入</span></div>
      <div class="demo-panel-body">
        <NotebookPen :size="44" stroke-width="1.25"/>
        <h2>等待接入现有 Web Mock 构建产物</h2>
        <p>当前提供的是官网界面源码，尚未包含迅树 MD 的 React 应用。将实际 Web Mock 的静态构建产物复制到 Pages 部署目录的 <code>demo/</code> 后，会取代此占位页面。</p>
        <a class="xs-button secondary" :href="withBase('/guide/')">先阅读使用文档 <ArrowRight :size="16"/></a>
      </div>
    </div>
    <div class="demo-rules"><div><HardDrive :size="22"/><h3>内存模拟</h3><p>不访问用户真实文件系统。</p></div><div><RefreshCcw :size="22"/><h3>刷新重置</h3><p>刷新页面回到预置测试数据。</p></div><div><ShieldOff :size="22"/><h3>同步仅模拟</h3><p>不执行真实设备配对或文件同步。</p></div></div>
  </main>
</template>
