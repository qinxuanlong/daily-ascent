<template>
  <div class="todo-list-view">
    <!-- 1. 顶部操作栏与快速新增入口 -->
    <div class="todo-top-toolbar">
      <div class="toolbar-title-group">
        <h2 class="view-title">待办任务规划</h2>
        <span class="view-subtitle">{{ completedTodos.length }}/{{ todos.length }} 已完成</span>
      </div>
      <button class="add-todo-btn" @click="showAddModal = true">
        <AppIcon name="plus" :size="16" />
        <span>添加待办</span>
      </button>
    </div>

    <!-- 2. 分类筛选胶囊 -->
    <div class="filter-capsules">
      <button
        class="filter-tab"
        :class="{ active: currentFilter === 'all' }"
        @click="currentFilter = 'all'"
      >
        全部 ({{ todos.length }})
      </button>
      <button
        class="filter-tab"
        :class="{ active: currentFilter === 'habit' }"
        @click="currentFilter = 'habit'"
      >
        每日习惯 ({{ habitCount }})
      </button>
      <button
        class="filter-tab"
        :class="{ active: currentFilter === 'once' }"
        @click="currentFilter = 'once'"
      >
        临时待办 ({{ onceCount }})
      </button>
    </div>

    <!-- 3. 待办任务列表 -->
    <div class="tasks-container">
      <div v-if="filteredTodos.length === 0" class="empty-state">
        <span class="empty-icon">✦</span>
        <p class="empty-tip">暂无待办任务，点击上方按钮规划今日旅程</p>
      </div>

      <div
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="todo-item-card"
        :class="{ 'is-completed': todo.completed }"
      >
        <!-- 左侧勾选打卡圆环按钮 -->
        <button
          class="check-circle-btn"
          :class="{ checked: todo.completed }"
          :title="todo.completed ? '撤销打卡' : '标记打卡完成'"
          @click="handleToggle(todo)"
        >
          <AppIcon v-if="todo.completed" name="check" :size="14" />
        </button>

        <!-- 中部任务信息 -->
        <div class="todo-info">
          <div class="todo-header-line">
            <span class="item-title" :class="{ strikethrough: todo.completed }">
              {{ todo.title }}
            </span>
            <span class="type-pill" :class="todo.type">
              {{ todo.type === 'habit' ? '习惯' : '单次' }}
            </span>
          </div>

          <div class="todo-sub-meta">
            <span v-if="todo.time" class="meta-time">
              <AppIcon name="clock" :size="12" />
              <span>{{ todo.time }}</span>
            </span>
            <span v-if="todo.type === 'habit' && todo.streak && todo.streak > 0" class="meta-streak">
              <AppIcon name="flame" :size="12" />
              <span>{{ todo.streak }} 天连击</span>
            </span>
            <span v-if="todo.note" class="meta-note" :title="todo.note">
              心得: {{ todo.note }}
            </span>
          </div>
        </div>

        <!-- 右侧操作选项 -->
        <div class="todo-actions">
          <button class="action-icon-btn" title="编辑任务" @click="handleEdit(todo)">
            <AppIcon name="edit" :size="15" />
          </button>
          <button class="action-icon-btn delete-btn" title="删除任务" @click="handleDelete(todo.id)">
            <AppIcon name="trash" :size="15" />
          </button>
        </div>
      </div>
    </div>

    <!-- 4. 新增/编辑任务弹窗 -->
    <transition name="modal-fade">
      <div v-if="showAddModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>{{ editingTodoId ? '编辑待办任务' : '新增待办任务' }}</h3>
            <button class="close-btn" @click="closeModal">
              <AppIcon name="x" :size="16" />
            </button>
          </div>

          <div class="modal-body">
            <!-- 标题输入 -->
            <div class="form-group">
              <label class="form-label">任务标题</label>
              <input
                v-model="formTitle"
                type="text"
                class="form-input"
                placeholder="例如：复习网文大纲 30 分钟"
                maxlength="50"
                @keyup.enter="handleSave"
              />
            </div>

            <!-- 任务属性 -->
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">任务属性</label>
                <div class="radio-group">
                  <button
                    type="button"
                    class="radio-btn"
                    :class="{ active: formType === 'habit' }"
                    @click="formType = 'habit'"
                  >
                    每日习惯
                  </button>
                  <button
                    type="button"
                    class="radio-btn"
                    :class="{ active: formType === 'once' }"
                    @click="formType = 'once'"
                  >
                    临时单次
                  </button>
                </div>
              </div>

              <!-- 计划执行时间 -->
              <div class="form-group">
                <label class="form-label">计划时间 (选填)</label>
                <input
                  v-model="formTime"
                  type="time"
                  class="form-input time-input"
                />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">取消</button>
            <button class="btn-submit" :disabled="!formTitle.trim()" @click="handleSave">
              保存
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TodoItem, TodoType } from '../types'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  todos: TodoItem[]
}>()

const emit = defineEmits<{
  (e: 'add-todo', todo: Omit<TodoItem, 'id' | 'order' | 'updatedAt' | 'completed'>): void
  (e: 'update-todo', id: string, updates: Partial<TodoItem>): void
  (e: 'delete-todo', id: string): void
  (e: 'toggle-todo', todo: TodoItem): void
}>()

const currentFilter = ref<'all' | 'habit' | 'once'>('all')

const completedTodos = computed(() => props.todos.filter((t) => t.completed))
const habitCount = computed(() => props.todos.filter((t) => t.type === 'habit').length)
const onceCount = computed(() => props.todos.filter((t) => t.type === 'once').length)

// 排序：未完成在前，按时间/顺序排；已完成沉底
const filteredTodos = computed(() => {
  let list = props.todos
  if (currentFilter.value === 'habit') {
    list = list.filter((t) => t.type === 'habit')
  } else if (currentFilter.value === 'once') {
    list = list.filter((t) => t.type === 'once')
  }

  return [...list].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    return a.order - b.order
  })
})

// 弹窗表单状态
const showAddModal = ref(false)
const editingTodoId = ref<string | null>(null)
const formTitle = ref('')
const formType = ref<TodoType>('habit')
const formTime = ref('')

function handleToggle(todo: TodoItem) {
  emit('toggle-todo', todo)
}

function handleEdit(todo: TodoItem) {
  editingTodoId.value = todo.id
  formTitle.value = todo.title
  formType.value = todo.type
  formTime.value = todo.time || ''
  showAddModal.value = true
}

function handleDelete(id: string) {
  if (window.confirm('确定删除该待办任务吗？')) {
    emit('delete-todo', id)
  }
}

function closeModal() {
  showAddModal.value = false
  editingTodoId.value = null
  formTitle.value = ''
  formType.value = 'habit'
  formTime.value = ''
}

function handleSave() {
  if (!formTitle.value.trim()) return

  if (editingTodoId.value) {
    emit('update-todo', editingTodoId.value, {
      title: formTitle.value.trim(),
      type: formType.value,
      time: formTime.value || undefined,
      updatedAt: Date.now()
    })
  } else {
    emit('add-todo', {
      title: formTitle.value.trim(),
      type: formType.value,
      time: formTime.value || undefined,
      streak: 1
    })
  }

  closeModal()
}
</script>

<style scoped>
.todo-list-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.todo-top-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.toolbar-title-group {
  display: flex;
  flex-direction: column;
}

.view-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.view-subtitle {
  font-size: 12px;
  color: #9ab2d5;
}

.add-todo-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #b88628, #f3d882);
  border: none;
  border-radius: 14px;
  color: #0b152d;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(243, 216, 130, 0.3);
}

.add-todo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(243, 216, 130, 0.45);
}

/* 过滤胶囊 */
.filter-capsules {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
}

.filter-tab {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #9ab2d5;
  font-size: 12px;
  padding: 6px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab.active {
  background: rgba(243, 216, 130, 0.18);
  border-color: rgba(243, 216, 130, 0.5);
  color: #fff0bd;
  font-weight: 600;
}

/* 列表容器 */
.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 240px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #657b9e;
  gap: 8px;
}

.empty-icon {
  font-size: 24px;
  color: #f3d882;
  opacity: 0.5;
}

.empty-tip {
  font-size: 13px;
}

.todo-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(14, 25, 52, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 12px 14px;
  backdrop-filter: blur(12px);
  transition: all 0.2s ease;
}

.todo-item-card:hover {
  border-color: rgba(243, 216, 130, 0.35);
  background: rgba(16, 29, 60, 0.85);
}

.todo-item-card.is-completed {
  opacity: 0.65;
  background: rgba(10, 18, 38, 0.6);
  border-color: rgba(94, 234, 212, 0.2);
}

.check-circle-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid rgba(243, 216, 130, 0.5);
  background: transparent;
  color: #5eead4;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.check-circle-btn.checked {
  background: rgba(94, 234, 212, 0.2);
  border-color: #5eead4;
}

.todo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.todo-header-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-title.strikethrough {
  text-decoration: line-through;
  color: #9ab2d5;
}

.type-pill {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
}

.type-pill.habit {
  background: rgba(94, 234, 212, 0.15);
  color: #5eead4;
}

.type-pill.once {
  background: rgba(243, 216, 130, 0.15);
  color: #f3d882;
}

.todo-sub-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #657b9e;
}

.meta-time,
.meta-streak {
  display: flex;
  align-items: center;
  gap: 3px;
}

.meta-streak {
  color: #fca5a5;
}

.meta-note {
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #9ab2d5;
}

.todo-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-icon-btn {
  background: transparent;
  border: none;
  color: #9ab2d5;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.action-icon-btn.delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

/* 模态框 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 9, 22, 0.75);
  backdrop-filter: blur(8px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-dialog {
  width: 100%;
  max-width: 380px;
  background: linear-gradient(165deg, #132448 0%, #0c1630 100%);
  border: 1px solid rgba(243, 216, 130, 0.4);
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #fff0bd;
}

.close-btn {
  background: transparent;
  border: none;
  color: #9ab2d5;
  cursor: pointer;
  padding: 4px;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

.form-label {
  font-size: 12px;
  color: #9ab2d5;
  font-weight: 600;
}

.form-input {
  background: rgba(8, 16, 36, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 10px 12px;
  color: #ffffff;
  font-size: 13px;
  outline: none;
}

.form-input:focus {
  border-color: #f3d882;
  box-shadow: 0 0 10px rgba(243, 216, 130, 0.3);
}

.radio-group {
  display: flex;
  gap: 6px;
}

.radio-btn {
  flex: 1;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ab2d5;
  font-size: 12px;
  cursor: pointer;
}

.radio-btn.active {
  background: rgba(243, 216, 130, 0.18);
  border-color: #f3d882;
  color: #fff0bd;
  font-weight: 700;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel,
.btn-submit {
  padding: 9px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #9ab2d5;
}

.btn-submit {
  background: linear-gradient(135deg, #b88628, #f3d882);
  border: none;
  color: #0b152d;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
