<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title?: string
}>()

const folded = ref(false)
const hovering = ref(false)
</script>

<template>
  <div 
    class="ui-section"
    :class="{ folded, hovering }"
  >
    <div 
      class="wrapper"
      @click="folded = !folded"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <span class="fold" :class="folded ? 'icon-right-dir' : 'icon-down-dir'">
        {{ folded ? '▶' : '▼' }}
      </span>
      <slot name="header">
        <span class="title">{{ title }}</span>
      </slot>
    </div>
    <div class="content" v-show="!folded">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.ui-section {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: center;
  margin-bottom: 10px;
  position: relative;
  box-sizing: border-box;
  outline: 0;
}

.ui-section:last-child {
  margin-bottom: 0;
}

.wrapper {
  position: relative;
  box-sizing: border-box;
  outline: 0;
  width: 100%;
  min-height: 24px;
  max-height: 24px;
  margin: 5px 0;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  color: #bdbdbd;
  font-weight: 700;
  border-bottom: 1px solid #666;
  cursor: pointer;
}

.wrapper > * {
  margin-right: 3px;
}

.wrapper > *:last-child {
  margin-right: 0;
}

.fold {
  font-size: 8px;
  color: inherit;
  width: 12px;
}

.title {
  flex: 1;
}

.ui-section.hovering .wrapper {
  color: #09f;
}

.ui-section:focus-within .wrapper {
  color: #fd942b;
}

.content {
  display: flex;
  flex-direction: column;
}

/* 为 slot header 提供样式 */
:slotted([slot="header"]) {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
}
</style>

