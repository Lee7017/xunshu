<script setup lang="ts">
import { computed, ref } from 'vue'
import { Mail, ArrowRight, ShieldCheck } from 'lucide-vue-next'

const applicationEmail = '3406521093@qq.com'
const nickname = ref('')
const phone = ref('')
const nicknameValid = computed(() => {
  const input = nickname.value.trim()
  return input.length >= 2 && input.length <= 30
})
const digits = computed(() => phone.value.replace(/\D/g, ''))
const phoneValid = computed(() => {
  const input = phone.value.trim()
  return /^\+?[\d\s()-]+$/.test(input) && digits.value.length >= 7 && digits.value.length <= 15
})
const mailtoUrl = computed(() => {
  const subject = '迅树 MD 内测邀请码申请'
  const body = [
    '你好！',
    '',
    '我想申请迅树 MD 的内测邀请码。',
    '昵称：' + nickname.value.trim(),
    '手机号：' + phone.value.trim(),
    '',
    '请直接回复这封邮件，把邀请码发送给我。谢谢！'
  ].join('\n')
  return 'mailto:' + applicationEmail
    + '?subject=' + encodeURIComponent(subject)
    + '&body=' + encodeURIComponent(body)
})

function openEmail() {
  if (!nicknameValid.value || !phoneValid.value) return
  // 仅唤起用户自己的邮件处理程序；不上传昵称或手机号、不代替用户发送邮件。
  window.location.href = mailtoUrl.value
}
</script>

<template>
  <main class="page-design invite-page section-width">
    <div class="page-intro">
      <span class="eyebrow">邀请内测</span>
      <h1>申请迅树 MD 内测邀请码</h1>
      <p>填写昵称和手机号后，使用你自己的邮箱发送申请。我们会通过邮件回复邀请码。</p>
    </div>

    <section class="invite-panel" aria-labelledby="invite-form-title">
      <div class="invite-panel-heading">
        <span class="invite-panel-icon"><Mail :size="24" /></span>
        <div>
          <h2 id="invite-form-title">发送内测申请</h2>
          <p>不需要在官网登录邮箱，更不需要提供邮箱密码。</p>
        </div>
      </div>

      <form class="invite-form" @submit.prevent="openEmail">
        <label for="invite-nickname">昵称 <span aria-hidden="true">*</span></label>
        <input
          id="invite-nickname"
          v-model="nickname"
          name="nickname"
          type="text"
          autocomplete="nickname"
          placeholder="请输入昵称"
          minlength="2"
          maxlength="30"
          required
          :aria-invalid="nickname.length > 0 && !nicknameValid"
          aria-describedby="invite-nickname-hint"
        />
        <p id="invite-nickname-hint" class="invite-hint">必填，请填写 2～30 个字符。</p>
        <label for="invite-phone">手机号 <span aria-hidden="true">*</span></label>
        <input
          id="invite-phone"
          v-model="phone"
          name="phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="例如 +86 138 0012 3456"
          required
          :aria-invalid="phone.length > 0 && !phoneValid"
          aria-describedby="invite-phone-hint"
        />
        <p id="invite-phone-hint" class="invite-hint">必填。支持国际区号、空格、横线；请输入 7～15 位数字。</p>
        <button class="xs-button primary invite-submit" type="submit" :disabled="!nicknameValid || !phoneValid" :data-mailto="nicknameValid && phoneValid ? mailtoUrl : undefined">
          <Mail :size="17" /> 打开自己的邮箱写信 <ArrowRight :size="17" />
        </button>
      </form>

      <div class="invite-details">
        <p><strong>收件邮箱：</strong><span class="invite-address">{{ applicationEmail }}</span></p>
        <p><strong>如何发送：</strong>点击按钮会打开设备默认的邮箱应用或邮件处理程序，自动填好收件人、标题、昵称和手机号。你需要使用自己的邮箱账号，检查内容并亲自点击「发送」。</p>
        <p><strong>如果没有打开邮箱：</strong>请登录你常用的邮箱，手动发给上面的地址，主题写「迅树 MD 内测邀请码申请」，正文写明昵称和手机号。</p>
      </div>
      <p class="invite-privacy"><ShieldCheck :size="16" /> 昵称和手机号仅用于生成你本地的邮件草稿，不会提交到官网服务器。邮件发送后，收件人会收到你提供的昵称和手机号。</p>
    </section>
  </main>
</template>
