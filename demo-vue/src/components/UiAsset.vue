<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  type?: string
  empty?: boolean
}>()

const focused = ref(false)
</script>

<template>
  <div 
    class="ui-asset" 
    :class="{ focused, empty }"
    @focus="focused = true"
    @blur="focused = false"
    tabindex="0"
  >
    <span class="icon">📄</span>
    <span class="text" v-if="!empty">{{ type || 'Asset' }}</span>
    <span class="placeholder" v-else>None</span>
  </div>
</template>

<style scoped>
.ui-asset {
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
  padding: 2px 8px;
  gap: 6px;
  height: 23px;
}

.ui-asset:last-child {
  margin-right: 0;
}

.ui-asset:hover {
  border-color: #888;
}

.ui-asset.focused {
  border-color: #fd942b;
}

.icon {
  font-size: 12px;
  flex-shrink: 0;
}

.text {
  font-size: 11px;
  color: #bdbdbd;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder {
  font-size: 11px;
  color: #595959;
  font-style: italic;
}

.ui-asset.empty {
  border-style: dashed;
}
</style>

