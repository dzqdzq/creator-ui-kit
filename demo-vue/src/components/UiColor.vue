<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const focused = ref(false)
const color = ref(props.modelValue || '#ffffff')

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  color.value = target.value
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div 
    class="ui-color" 
    :class="{ focused }"
  >
    <div class="color-preview" :style="{ backgroundColor: color }"></div>
    <input 
      type="color"
      :value="color"
      @input="handleInput"
      @focus="focused = true"
      @blur="focused = false"
    />
    <span class="color-text">{{ color.toUpperCase() }}</span>
  </div>
</template>

<style scoped>
.ui-color {
  display: inline-flex;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  width: auto;
  margin: 0 0.25em 0 0;
  outline: 0;
  cursor: pointer;
  overflow: hidden;
  border-radius: 3px;
  border: 1px solid #171717;
  background: #262626;
  padding: 2px 6px;
  gap: 6px;
  height: 23px;
}

.ui-color:last-child {
  margin-right: 0;
}

.ui-color:hover {
  border-color: #888;
}

.ui-color.focused {
  border-color: #fd942b;
}

.color-preview {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

input[type="color"] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  top: 0;
  left: 0;
}

.color-text {
  font-size: 11px;
  color: #bdbdbd;
  font-family: monospace;
}
</style>

