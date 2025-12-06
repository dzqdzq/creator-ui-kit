<script setup lang="ts">
import { computed } from 'vue'
import { Editor } from './editor'
import type { BaseTarget, PropValue } from './types'

interface RichTextTarget extends BaseTarget {
  string: PropValue<string>
  horizontalAlign: PropValue
  fontSize: PropValue<number>
  font: PropValue
  fontFamily: PropValue<string>
  useSystemFont: PropValue<boolean>
  cacheMode: PropValue
  maxWidth: PropValue<number>
  lineHeight: PropValue<number>
  imageAtlas: PropValue
  handleTouchEvent: PropValue<boolean>
}

const props = defineProps<{
  target?: RichTextTarget
  multi?: boolean
}>()

const T = Editor.T

const isSystemFont = computed(() => {
  return props.target?.useSystemFont?.value ?? false
})
</script>

<template>
  <template v-if="target">
    <ui-prop v-prop="target.string" :multi-values="multi" />
    <ui-prop v-prop="target.horizontalAlign" :multi-values="multi" />
    <ui-prop v-prop="target.fontSize" :multi-values="multi" />
    <ui-prop v-prop="target.font" :multi-values="multi" />
    <ui-prop 
      v-prop="target.fontFamily" 
      v-show="isSystemFont" 
      :multi-values="multi" 
    />
    <ui-prop v-prop="target.useSystemFont" :multi-values="multi" />
    <ui-prop v-prop="target.cacheMode" :multi-values="multi" />
    <ui-prop v-prop="target.maxWidth" :multi-values="multi" />
    <ui-prop v-prop="target.lineHeight" :multi-values="multi" />
    <ui-prop v-prop="target.imageAtlas" :multi-values="multi" />
    <ui-prop v-prop="target.handleTouchEvent" :multi-values="multi" />
  </template>
</template>

