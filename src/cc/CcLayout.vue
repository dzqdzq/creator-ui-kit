<script setup lang="ts">
import { computed } from 'vue'
import { Editor } from './editor'
import type { BaseTarget, PropValue } from './types'

interface LayoutTarget extends BaseTarget {
  type: PropValue<number>
  resizeMode: PropValue<number>
  cellSize: PropValue
  startAxis: PropValue
  paddingLeft: PropValue<number>
  paddingRight: PropValue<number>
  paddingTop: PropValue<number>
  paddingBottom: PropValue<number>
  spacingX: PropValue<number>
  spacingY: PropValue<number>
  verticalDirection: PropValue
  horizontalDirection: PropValue
  affectedByScale: PropValue<boolean>
}

const props = defineProps<{
  target?: LayoutTarget
  multi?: boolean
}>()

const T = Editor.T

// 辅助函数
function checkValues(values: any[] | undefined, expectedValue: number, shouldEqual: boolean): boolean {
  if (!values) return false
  return values.every(v => shouldEqual ? v === expectedValue : v !== expectedValue)
}

// 计算属性
const isPaddingEnabled = computed(() => {
  const typeValue = props.target?.type
  const resizeMode = props.target?.resizeMode
  
  if (props.multi) {
    if (!checkValues(typeValue?.values, 0, true) || !checkValues(resizeMode?.values, 1, true)) {
      checkValues(typeValue?.values, 0, false)
      return false
    }
  }
  
  if (!(typeValue?.value === 0 && resizeMode?.value === 1)) {
    return typeValue?.value !== 0
  }
  return false
})

const isPaddingHorizontalEnabled = computed(() => {
  if (props.multi) {
    return checkValues(props.target?.type?.values, 2, false)
  }
  return props.target?.type?.value !== 2
})

const isPaddingVerticalEnabled = computed(() => {
  if (props.multi) {
    return checkValues(props.target?.type?.values, 1, false)
  }
  return props.target?.type?.value !== 1
})

const isAllowHorizontalLayout = computed(() => {
  const typeValue = props.target?.type
  
  if (props.multi) {
    if (!checkValues(typeValue?.values, 1, true)) {
      return checkValues(typeValue?.values, 3, true)
    }
  }
  
  if (typeValue?.value !== 1) {
    return typeValue?.value === 3
  }
  return true
})

const isAllowVerticalLayout = computed(() => {
  const typeValue = props.target?.type
  
  if (props.multi) {
    if (!checkValues(typeValue?.values, 2, true)) {
      return checkValues(typeValue?.values, 3, true)
    }
  }
  
  if (typeValue?.value !== 2) {
    return typeValue?.value === 3
  }
  return true
})

const isGridLayout = computed(() => {
  if (props.multi) {
    return checkValues(props.target?.type?.values, 3, true)
  }
  return props.target?.type?.value === 3
})

const isShowCellSize = computed(() => {
  if (props.multi) {
    return checkValues(props.target?.type?.values, 3, true) && 
           checkValues(props.target?.resizeMode?.values, 2, true)
  }
  
  if (props.target?.type?.value === 3) {
    return props.target?.resizeMode?.value === 2
  }
  return false
})
</script>

<template>
  <template v-if="target">
    <ui-prop v-prop="target.type" :multi-values="multi" />
    <ui-prop v-prop="target.resizeMode" :multi-values="multi" />

    <div>
      <ui-prop
        v-prop="target.cellSize"
        :multi-values="multi"
        v-show="isShowCellSize"
      />
      <ui-prop
        v-prop="target.startAxis"
        :multi-values="multi"
        v-show="isGridLayout"
      />
      
      <ui-prop name="Padding" v-show="isPaddingEnabled">
        <div slot="child" class="layout vertical">
          <ui-prop
            name="Left"
            type="number"
            :indent="1"
            :value="target.paddingLeft?.value"
            :values="target.paddingLeft?.values"
            :multi-values="multi"
            v-show="isPaddingHorizontalEnabled"
          />
          <ui-prop
            name="Right"
            type="number"
            :indent="1"
            :value="target.paddingRight?.value"
            :values="target.paddingRight?.values"
            :multi-values="multi"
            v-show="isPaddingHorizontalEnabled"
          />
          <ui-prop
            name="Top"
            type="number"
            :indent="1"
            :value="target.paddingTop?.value"
            :values="target.paddingTop?.values"
            :multi-values="multi"
            v-show="isPaddingVerticalEnabled"
          />
          <ui-prop
            name="Bottom"
            type="number"
            :indent="1"
            :value="target.paddingBottom?.value"
            :values="target.paddingBottom?.values"
            :multi-values="multi"
            v-show="isPaddingVerticalEnabled"
          />
        </div>
      </ui-prop>

      <ui-prop
        v-prop="target.spacingX"
        v-show="isAllowHorizontalLayout"
        :multi-values="multi"
      />
      <ui-prop
        v-prop="target.spacingY"
        v-show="isAllowVerticalLayout"
        :multi-values="multi"
      />
      <ui-prop
        v-prop="target.verticalDirection"
        v-show="isAllowVerticalLayout"
        :multi-values="multi"
      />
      <ui-prop
        v-prop="target.horizontalDirection"
        v-show="isAllowHorizontalLayout"
        :multi-values="multi"
      />
    </div>

    <ui-prop v-prop="target.affectedByScale" :multi-values="multi" />
  </template>
</template>

