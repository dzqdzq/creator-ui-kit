<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue?: string
  placeholder?: string
  tooltip?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const focused = ref(false)
</script>

<template>
  <div 
    class="ui-input" 
    :class="{ focused }"
    :title="tooltip"
  >
    <input 
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="focused = true"
      @blur="focused = false"
    />
  </div>
</template>

<style scoped>
.ui-input {
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

.ui-input:last-child {
  margin-right: 0;
}

.ui-input:hover {
  border-color: #888;
}

.ui-input.focused {
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

