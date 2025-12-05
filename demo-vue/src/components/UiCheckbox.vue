<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: boolean
  tooltip?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checked = computed({
  get: () => props.modelValue ?? false,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <label class="ui-checkbox" :title="tooltip">
    <input 
      type="checkbox" 
      v-model="checked"
    />
    <span class="checkmark" :class="{ checked }">
      <svg v-if="checked" viewBox="0 0 12 12" fill="none">
        <path d="M2 6L5 9L10 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </label>
</template>

<style scoped>
.ui-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  margin: 0 0.25em 0 0;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.ui-checkbox:last-child {
  margin-right: 0;
}

input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  width: 14px;
  height: 14px;
  background: #262626;
  border: 1px solid #171717;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.checkmark:hover {
  border-color: #888;
}

.checkmark.checked {
  background: #4281b6;
  border-color: #4281b6;
}

.checkmark svg {
  width: 10px;
  height: 10px;
  color: #fff;
}
</style>

