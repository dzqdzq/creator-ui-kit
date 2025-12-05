<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue?: string
  placeholder?: string
  rows?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const focused = ref(false)
</script>

<template>
  <div 
    class="ui-textarea" 
    :class="{ focused }"
  >
    <textarea 
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows ?? 3"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @focus="focused = true"
      @blur="focused = false"
    ></textarea>
  </div>
</template>

<style scoped>
.ui-textarea {
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

.ui-textarea:last-child {
  margin-right: 0;
}

.ui-textarea:hover {
  border-color: #888;
}

.ui-textarea.focused {
  border-color: #fd942b;
}

textarea {
  font-family: inherit;
  font-size: 1rem;
  min-height: 60px;
  border: none;
  margin: 0;
  padding: 0.5em;
  width: 100%;
  display: block;
  outline: 0;
  background: #262626;
  color: #fd942b;
  resize: vertical;
}

textarea::-webkit-input-placeholder {
  font-style: italic;
  color: #595959;
}

textarea::selection {
  color: #fff;
  background: #09f;
}
</style>

