<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue?: string | number
  options: { value: string | number; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const focused = ref(false)

function handleChange(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div 
    class="ui-select" 
    :class="{ focused }"
  >
    <select 
      :value="modelValue"
      @change="handleChange"
      @focus="focused = true"
      @blur="focused = false"
    >
      <option 
        v-for="opt in options" 
        :key="opt.value" 
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>
    <span class="arrow">▾</span>
  </div>
</template>

<style scoped>
.ui-select {
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
}

.ui-select:last-child {
  margin-right: 0;
}

.ui-select:hover {
  border-color: #888;
}

.ui-select.focused {
  border-color: #fd942b;
}

select {
  font-family: inherit;
  font-size: 1rem;
  height: 19px;
  border: none;
  margin: 0;
  padding: 0 1.5em 0 0.5em;
  width: 100%;
  display: inline-block;
  outline: 0;
  background: transparent;
  color: #bdbdbd;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}

option {
  background: #262626;
  color: #bdbdbd;
}

.arrow {
  position: absolute;
  right: 6px;
  pointer-events: none;
  color: #888;
  font-size: 10px;
}
</style>

