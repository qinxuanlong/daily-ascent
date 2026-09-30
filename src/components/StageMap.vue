<template>
  <div class="card" v-if="line">
    <div class="card-title">🗺️ {{ LINE_ICONS[line] }} {{ line }} · 关卡路线</div>
    <div class="stage-track">
      <template v-for="(stage, idx) in stages" :key="stage.id">
        <div class="stage-node" :title="stage.desc">
          <div
            class="stage-circle"
            :class="{
              completed: idx < progress,
              current: idx === progress
            }"
          >
            {{ idx < progress ? '✓' : idx + 1 }}
          </div>
          <div class="stage-name">{{ stage.name }}</div>
        </div>
        <div
          v-if="idx < stages.length - 1"
          class="stage-connector"
          :class="{ completed: idx < progress }"
        ></div>
      </template>
    </div>

    <!-- 完成当前关卡按钮 -->
    <div v-if="progress < stages.length" style="margin-top: 14px; text-align: center;">
      <button class="btn btn-ghost" style="font-size: 13px;" @click="$emit('complete-stage')">
        🎯 标记完成第 {{ progress + 1 }} 关：「{{ stages[progress]?.name }}」
      </button>
    </div>
    <div v-else style="margin-top: 14px; text-align: center; color: #86efac; font-size: 13px; font-weight: 600;">
      🎉 该主线 6 大关卡已全部通关！
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
