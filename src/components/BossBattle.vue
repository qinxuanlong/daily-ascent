<template>
  <div>
    <!-- 纯爽乐趣锚点 -->
    <div class="clean-card" style="border-color: rgba(245, 158, 11, 0.2); background: rgba(245, 158, 11, 0.03);">
      <div class="card-header">
        <span class="card-title-text" style="color: var(--warning);">🎉 周六纯爽锚点</span>
      </div>
      <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
        今天必须做一件毫无功利心、纯粹让自己开心的事！
      </p>
      <input
        v-model="funInput"
        class="input-box"
        placeholder="记录这件纯爽的事（打游戏、吃大餐、散步...）"
        @keyup.enter="saveFun"
      />
      <button
        v-if="funInput.trim()"
        class="clean-btn"
        style="width: 100%;"
        @click="saveFun"
      >
        ✨ 记录我的纯爽时刻
      </button>
    </div>

    <!-- Boss 战卡片 -->
    <div class="clean-card">
      <div class="card-header">
        <span class="card-title-text">👹 周六闭环 Boss 战</span>
      </div>

      <div v-if="bossDefeated" class="done-banner">
        <div class="done-icon">⚔️</div>
        <div class="done-title">Boss 已击杀！+2⭐ 经验已入账</div>
        <div v-if="bossOutputText" class="done-desc">
          闭环成果：{{ bossOutputText }}
        </div>
      </div>

      <template v-else>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
          周六完成本周的小闭环产出，即可击杀 Boss 获得双倍经验。
        </p>
        <textarea
          v-model="bossOutput"
          class="input-box"
          placeholder="本周完成了什么闭环成果？"
        ></textarea>
        <button
          class="btn-primary-block"
          style="background: #10b981;"
          :disabled="!bossOutput.trim()"
          @click="killBoss"
        >
          ⚔️ 一键击杀 Boss (+2⭐ 经验)
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  bossDefeated: { type: Boolean, default: false },
  bossOutputText: { type: String, default: '' }
})

const emit = defineEmits(['kill', 'fun'])
const bossOutput = ref('')
const funInput = ref('')

function killBoss() {
  if (!bossOutput.value.trim()) return
  emit('kill', bossOutput.value.trim())
  if (funInput.value.trim()) {
    emit('fun', funInput.value.trim())
  }
  bossOutput.value = ''
}

function saveFun() {
  if (funInput.value.trim()) {
    emit('fun', funInput.value.trim())
    funInput.value = ''
  }
}
</script>
