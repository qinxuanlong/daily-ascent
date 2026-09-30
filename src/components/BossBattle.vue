<template>
  <div>
    <!-- 乐趣锚点 -->
    <div class="fun-banner">
      <div class="fun-emoji">🎉</div>
      <div class="fun-text">今天记得做一件纯爽的事！</div>
      <div class="form-group" style="margin-bottom: 0;">
        <input
          v-model="funInput"
          class="form-input"
          placeholder="打了一局游戏 / 吃了顿大餐 / 看了部电影..."
          style="text-align: center;"
          @keyup.enter="saveFun"
        />
      </div>
      <button
        v-if="funInput.trim()"
        class="btn btn-ghost"
        style="margin-top: 8px; font-size: 12px; padding: 6px 14px;"
        @click="saveFun"
      >
        ✨ 记录乐趣瞬间
      </button>
    </div>

    <!-- Boss 战 -->
    <div class="card">
      <div class="card-title">👹 周六 Boss 战</div>

      <div v-if="bossDefeated" class="checked-in-banner">
        <div class="check-icon">⚔️</div>
        <div class="check-text">Boss 已击杀！+2 经验已获得</div>
        <div v-if="bossOutputText" style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">
          🏆 闭环产出：{{ bossOutputText }}
        </div>
      </div>

      <template v-else>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
          完成本周闭环产出，击杀 Boss！(+2 经验值)
        </p>
        <div class="form-group">
          <label>本周闭环产出</label>
          <textarea
            v-model="bossOutput"
            class="form-input"
            placeholder="本周完成了什么闭环成果？例如：闲鱼跑通发布与发货、第一章精修完稿..."
          ></textarea>
        </div>
        <button
          class="btn btn-success"
          style="width: 100%;"
          @click="killBoss"
          :disabled="!bossOutput.trim()"
        >
          ⚔️ 击杀 Boss
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

// 击杀 Boss
function killBoss() {
  if (!bossOutput.value.trim()) return
  emit('kill', bossOutput.value.trim())
  if (funInput.value.trim()) {
    emit('fun', funInput.value.trim())
  }
  bossOutput.value = ''
}

// 记录乐趣
function saveFun() {
  if (funInput.value.trim()) {
    emit('fun', funInput.value.trim())
    funInput.value = ''
  }
}
</script>
