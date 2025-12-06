<script setup lang="ts">
import { computed } from 'vue'
import { Editor } from './editor'
import type { BaseTarget, PropValue } from './types'

interface LabelTarget extends BaseTarget {
  string: PropValue<string>
  horizontalAlign: PropValue
  verticalAlign: PropValue
  actualFontSize: PropValue<number>
  fontSize: PropValue<number>
  _bmFontOriginalSize: PropValue<number>
  lineHeight: PropValue<number>
  spacingX: PropValue<number>
  overflow: PropValue<number>
  enableWrapText: PropValue<boolean>
  font: PropValue
  fontFamily: PropValue<string>
  enableBold: PropValue<boolean>
  enableItalic: PropValue<boolean>
  enableUnderline: PropValue<boolean>
  underlineHeight: PropValue<number>
  cacheMode: PropValue
  useSystemFont: PropValue<boolean>
  materials: PropValue
}

const props = defineProps<{
  target?: LabelTarget
  multi?: boolean
}>()

const T = Editor.T

const isBMFont = computed(() => {
  return (props.target?._bmFontOriginalSize?.value ?? 0) > 0
})

const isSystemFont = computed(() => {
  return props.target?.useSystemFont?.value ?? false
})

const hiddenWrapText = computed(() => {
  const overflow = props.target?.overflow?.value
  return overflow === 0 || overflow === 3
})

const hiddenActualFontSize = computed(() => {
  return props.target?.overflow?.value !== 2
})

const showUnderlineHeight = computed(() => {
  return !isBMFont.value && props.target?.enableUnderline?.value === true
})
</script>

<template>
  <template v-if="target">
    <ui-prop v-prop="target.string" :multi-values="multi" />
    <ui-prop v-prop="target.horizontalAlign" :multi-values="multi" />
    <ui-prop v-prop="target.verticalAlign" :multi-values="multi" />
    
    <ui-prop
      v-prop="target.actualFontSize"
      v-show="!hiddenActualFontSize"
      :multi-values="multi"
    />
    <ui-prop
      type="number"
      v-prop="target.fontSize"
      :multi-values="multi"
    />
    <ui-prop
      v-prop="target._bmFontOriginalSize"
      v-show="isBMFont"
      :multi-values="multi"
    />
    
    <ui-prop v-prop="target.lineHeight" :multi-values="multi" />
    <ui-prop
      v-prop="target.spacingX"
      v-show="isBMFont"
      :multi-values="multi"
    />
    <ui-prop v-prop="target.overflow" :multi-values="multi" />
    <ui-prop
      v-prop="target.enableWrapText"
      v-show="!hiddenWrapText"
      :multi-values="multi"
    />
    <ui-prop v-prop="target.font" :multi-values="multi" />
    <ui-prop
      v-prop="target.fontFamily"
      v-show="isSystemFont"
      :multi-values="multi"
    />
    <ui-prop
      v-prop="target.enableBold"
      v-show="!isBMFont"
      :multi-values="multi"
    />
    <ui-prop
      v-prop="target.enableItalic"
      v-show="!isBMFont"
      :multi-values="multi"
    />
    <ui-prop
      v-prop="target.enableUnderline"
      v-show="!isBMFont"
      :multi-values="multi"
    />
    <ui-prop
      v-prop="target.underlineHeight"
      v-show="showUnderlineHeight"
      :indent="1"
      :multi-values="multi"
    />
    <ui-prop
      v-prop="target.cacheMode"
      v-show="!isBMFont"
      :multi-values="multi"
    />
    <ui-prop v-prop="target.useSystemFont" :multi-values="multi" />
    
    <cc-blend-section :target="target" />
    <cc-array-prop :target="target.materials" />
  </template>
</template>

