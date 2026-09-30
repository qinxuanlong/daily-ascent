<template>
  <div class="clean-card" v-if="line">
    <div class="card-header">
      <span class="card-title-text">🗺️ 关卡路线</span>
      <span class="tag-badge">{{ LINE_ICONS[line] }} {{ line }} ({{ progress }}/6)</span>
    </div>

    <!-- 极简进度条 -->
    <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 999px; margin-bottom: 16px; overflow: hidden;">
      <div
        style="height: 100%; background: #3b82f6; border-radius: 999px; transition: width 0.3s ease;"
        :style="{ width: `${(progress / 6) * 100}%` }"
      ></div>
    </div>

    <!-- 6大关卡列表 -->
    <div class="stage-step-list">
      <div
        v-for="(stage, idx) in stages"
        :key="stage.id"
        class="stage-step-row"
        :class="{ current: idx === progress }"
      >
        <div
          class="stage-dot"
          :class="{
            completed: idx < progress,
            current: idx === progress
          }"
        >
          {{ idx < progress ? '✓' : idx + 1 }}
        </div>
        <div class="stage-info">
          <div class="stage-title">{{ stage.name }}</div>
          <div class="stage-desc">{{ stage.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 通关操作按钮 -->
    <div style="margin-top: 14px;">
      <button
        v-if="progress < stages.length"
        class="btn-primary-block"
        style="background: rgba(255,255,255,0.06); color: var(--text-main); font-size: 13px;"
        @click="$emit('complete-stage')"
      >
        🎯 标记完成第 {{ progress + 1 }} 关：「{{ stages[progress]?.name }}」
      </button>
      <div v-else style="text-align: center; color: var(--success); font-size: 13px; font-weight: 600; padding: 6px 0;">
        🎉 本主线 6 关已全部通关！
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { STAGES, LINE_ICONS } from '../data/stages.js'

const props = defineProps({
  line: { type: String, default: '' },
  progress: { type: Number, default: 0 }
})

defineEmits(['complete-stage'])

const stages = computed(() => STAGES[props.line] || [])
</script>
