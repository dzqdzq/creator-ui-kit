<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue?: number
  min?: number
  max?: number
  step?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const focused = ref(false)

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  const val = parseFloat(target.value)
  if (!isNaN(val)) {
    emit('update:modelValue', val)
  }
}
</script>

<template>
  <div 
    class="ui-num-input" 
    :class="{ focused }"
  >
    <input 
      type="text"
      :value="modelValue"
      @input="handleInput"
      @focus="focused = true"
      @blur="focused = false"
    />
  </div>
</template>

<style scoped>
.ui-num-input {
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  width: auto;
  margin: 0 0.25em 0 0;
  outline: 0;
  cursor: default;
  overflow: hidden;
  border-radius: 3px;
  border: 1px solid #171717;
}

.ui-num-input:last-child {
  margin-right: 0;
}

.ui-num-input:hover {
  border-color: #888;
}

.ui-num-input.focused {
  border-color: #fd942b;
}

input {
  font-family: inherit;
  font-size: 1rem;
  height: 19px;
  border: none;
  margin: 0;
  padding: 0.16666667em 0.5em;
  width: 100%;
  display: inline-block;
  outline: 0;
  background: #262626;
  color: #fd942b;
  text-align: right;
}

input::-webkit-input-placeholder {
  font-style: italic;
  color: #595959;
}

input::selection {
  color: #fff;
  background: #09f;
}
</style>

