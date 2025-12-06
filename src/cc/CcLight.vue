<script setup lang="ts">
import { computed } from 'vue'
import type { BaseTarget, PropValue } from './types'

interface LightTarget extends BaseTarget {
  type: PropValue<number>
  color: PropValue
  intensity: PropValue<number>
  range: PropValue<number>
  spotAngle: PropValue<number>
  spotExp: PropValue<number>
  shadowType: PropValue<number>
  shadowResolution: PropValue<number>
  shadowDarkness: PropValue<number>
  shadowMinDepth: PropValue<number>
  shadowMaxDepth: PropValue<number>
  shadowFrustumSize: PropValue<number>
}

const props = defineProps<{
  target?: LightTarget
  multi?: boolean
}>()

// 光源类型：0=Directional, 1=Point, 2=Spot, 3=Ambient
const showRange = computed(() => {
  const type = props.target?.type?.value
  return type !== 0 && type !== 3
})

const isSpotLight = computed(() => {
  return props.target?.type?.value === 2
})

const showShadow = computed(() => {
  return props.target?.type?.value !== 3
})

const hasShadow = computed(() => {
  return props.target?.shadowType?.value !== 0
})

const showFrustumSize = computed(() => {
  return hasShadow.value && props.target?.type?.value === 0
})
</script>

<template>
  <template v-if="target">
    <ui-prop v-prop="target.type" :multi-values="multi" />
    <ui-prop v-prop="target.color" :multi-values="multi" />
    <ui-prop v-prop="target.intensity" :multi-values="multi" />
    <ui-prop v-prop="target.range" v-show="showRange" :multi-values="multi" />
    <ui-prop v-prop="target.spotAngle" v-show="isSpotLight" :multi-values="multi" />
    <ui-prop v-prop="target.spotExp" v-show="isSpotLight" :multi-values="multi" />
    <ui-prop v-prop="target.shadowType" v-show="showShadow" :multi-values="multi" />
    <ui-prop v-prop="target.shadowResolution" v-show="hasShadow" :multi-values="multi" />
    <ui-prop v-prop="target.shadowDarkness" v-show="hasShadow" :multi-values="multi" />
    <ui-prop v-prop="target.shadowMinDepth" v-show="hasShadow" :multi-values="multi" />
    <ui-prop v-prop="target.shadowMaxDepth" v-show="hasShadow" :multi-values="multi" />
    <ui-prop v-prop="target.shadowFrustumSize" v-show="showFrustumSize" :multi-values="multi" />
  </template>
</template>

