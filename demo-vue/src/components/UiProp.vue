<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  name?: string
  tooltip?: string
  foldable?: boolean
  indent?: number
  autoHeight?: boolean
  fixedLabel?: boolean
  subset?: boolean
}>()

const folded = ref(false)
const hovering = ref(false)

const indentStyle = computed(() => {
  if (props.indent) {
    return { paddingLeft: `${props.indent * 16}px` }
  }
  return {}
})

const hasChild = computed(() => {
  return props.foldable
})
</script>

<template>
  <div 
    class="ui-prop"
    :class="{ 
      hovering, 
      foldable,
      folded,
      'auto-height': autoHeight,
      'fixed-label': fixedLabel || subset
    }"
    :title="tooltip"
  >
    <div class="wrapper" :style="indentStyle">
      <div 
        v-if="name" 
        class="label"
        @mouseenter="hovering = true"
        @mouseleave="hovering = false"
      >
        <span 
          v-if="foldable" 
          class="fold" 
          @click="folded = !folded"
        >
          {{ folded ? '▶' : '▼' }}
        </span>
        <span class="text">{{ name }}</span>
      </div>
      <div class="wrapper-content">
        <slot></slot>
      </div>
    </div>
    <div v-if="hasChild && !folded" class="child-content">
      <slot name="child"></slot>
    </div>
  </div>
</template>

<style scoped>
.ui-prop {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  outline: 0;
  min-width: 220px;
}

.wrapper {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 23px;
  max-height: 23px;
  margin: 2px 0;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  color: #bdbdbd;
}

.wrapper-content {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
}

.label {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: baseline;
  justify-content: flex-start;
  margin-right: 5px;
  flex-shrink: 0;
  font-size: 1em;
  width: 35%;
  min-width: 70px;
  white-space: nowrap;
}

.label > * {
  margin-right: 3px;
}

.label > *:last-child {
  margin-right: 0;
}

.text {
  overflow: hidden;
  text-overflow: ellipsis;
}

.fold {
  font-size: 8px;
  cursor: pointer;
  visibility: hidden;
  width: 12px;
}

.ui-prop.foldable .fold {
  visibility: visible;
}

.ui-prop.hovering .wrapper {
  color: #09f;
}

.ui-prop:focus-within .wrapper {
  color: #fd942b;
}

/* auto-height 样式 */
.ui-prop.auto-height .wrapper {
  align-items: flex-start;
  max-height: none;
}

.ui-prop.auto-height .label {
  margin-top: 3px;
}

/* fixed-label 样式 */
.ui-prop.fixed-label .label {
  width: auto;
  min-width: auto;
}

.ui-prop.fixed-label .fold {
  display: none;
}

/* 子属性容器 */
.child-content {
  display: flex;
  flex-direction: column;
}

/* 子属性样式 */
:deep(.ui-prop) {
  margin-right: 10px;
  min-width: auto;
}

:deep(.ui-prop:last-child) {
  margin-right: 0;
}
</style>

