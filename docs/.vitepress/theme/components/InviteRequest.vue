<script setup lang="ts">
import { ref } from 'vue'
import { Mail, Copy, Check, ShieldCheck } from 'lucide-vue-next'

const applicationEmail = '3406521093@qq.com'
const applicationSubject = '迅树 MD 内测邀请码申请'
const applicationTemplate = [
  '昵称：请填写你的昵称',
  '手机号：请填写你的手机号',
  '',
  '我想申请迅树 MD 内测邀请码，请通过本邮件回复。'
].join('\n')
const copied = ref('')
const copyNotice = ref('')

async function copyText(key: string, value: string) {
  try {
    await navigator.clipboard.writeText(value)
    copied.value = key
    copyNotice.value = '已复制，请粘贴到你自己的邮件中。'
  } catch {
    copied.value = ''
    copyNotice.value = '无法自动复制，请长按或选中文字，手动复制。'
  }
}
</script>

<template>
  <main class="page-design invite-page section-width">
    <div class="page-intro">
      <span class="eyebrow">邀请内测</span>
      <h1>申请迅树 MD 内测邀请码</h1>
      <p>请使用你自己的邮箱发送申请邮件，写明昵称和手机号。我们会通过邮件回复邀请码。</p>
    </div>

    <section class="invite-panel" aria-labelledby="invite-instructions-title">
      <div class="invite-panel-heading">
        <span class="invite-panel-icon"><Mail :size="24" /></span>
        <div>
          <h2 id="invite-instructions-title">通过邮件申请</h2>
          <p>无需在官网填写表单，也无需提供邮箱密码。</p>
        </div>
      </div>

      <ol class="invite-steps">
        <li>打开你常用的邮箱（例如 QQ 邮箱、163 邮箱或 Gmail），使用自己的账号写一封新邮件。</li>
        <li>将下面的收件邮箱和邮件主题填入邮件。</li>
        <li>在正文写明<strong>昵称和手机号（均必填）</strong>，确认后由你自己点击「发送」。</li>
      </ol>

      <div class="invite-copy-section">
        <div class="invite-copy-heading"><strong>收件邮箱</strong><span>发往迅树 MD</span></div>
        <div class="invite-copy-row">
          <span class="invite-copy-value">{{ applicationEmail }}</span>
          <button class="xs-button secondary invite-copy-button" type="button" @click="copyText('email', applicationEmail)">
            <Check v-if="copied === 'email'" :size="16" /><Copy v-else :size="16" />
            {{ copied === 'email' ? '已复制' : '复制邮箱' }}
          </button>
        </div>
      </div>

      <div class="invite-copy-section">
        <div class="invite-copy-heading"><strong>邮件主题</strong></div>
        <div class="invite-copy-row">
          <span class="invite-copy-value">{{ applicationSubject }}</span>
          <button class="xs-button secondary invite-copy-button" type="button" @click="copyText('subject', applicationSubject)">
            <Check v-if="copied === 'subject'" :size="16" /><Copy v-else :size="16" />
            {{ copied === 'subject' ? '已复制' : '复制主题' }}
          </button>
        </div>
      </div>

      <div class="invite-copy-section">
        <div class="invite-copy-heading"><strong>邮件正文示例</strong><span>将提示文字替换为你的真实信息</span></div>
        <pre class="invite-mail-example">{{ applicationTemplate }}</pre>
        <button class="xs-button secondary invite-template-button" type="button" @click="copyText('template', applicationTemplate)">
          <Check v-if="copied === 'template'" :size="16" /><Copy v-else :size="16" />
          {{ copied === 'template' ? '已复制' : '复制邮件正文' }}
        </button>
      </div>

      <p class="invite-copy-notice" role="status" aria-live="polite">{{ copyNotice }}</p>
      <p class="invite-privacy"><ShieldCheck :size="16" /> 官网不收集昵称、手机号或邮箱密码。只有你自己发送邮件后，收件人才会收到你的申请信息。</p>
    </section>
  </main>
</template>
