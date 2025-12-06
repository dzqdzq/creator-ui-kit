<script setup lang="ts">
import type { BaseTarget, PropValue } from './types'

interface PageViewTarget extends BaseTarget {
  content: PropValue
  sizeMode: PropValue
  direction: PropValue
  scrollThreshold: PropValue<number>
  autoPageTurningThreshold: PropValue<number>
  inertia: PropValue<boolean>
  brake: PropValue<number>
  elastic: PropValue<boolean>
  bounceDuration: PropValue<number>
  indicator: PropValue
  pageTurningSpeed: PropValue<number>
  pageTurningEventTiming: PropValue<number>
  pageEvents: PropValue
  cancelInnerEvents: PropValue<boolean>
}

defineProps<{
  target?: PageViewTarget
  multi?: boolean
}>()
</script>

<template>
  <template v-if="target">
    <ui-prop v-prop="target.content" :multi-values="multi" />
    <ui-prop v-prop="target.sizeMode" :multi-values="multi" />
    <ui-prop v-prop="target.direction" :multi-values="multi" />
    <ui-prop v-prop="target.scrollThreshold" :multi-values="multi" />
    <ui-prop v-prop="target.autoPageTurningThreshold" :multi-values="multi" />
    <ui-prop v-prop="target.inertia" :multi-values="multi" />
    <ui-prop v-prop="target.brake" :multi-values="multi" />
    <ui-prop v-prop="target.elastic" :multi-values="multi" />
    <ui-prop v-prop="target.bounceDuration" :multi-values="multi" />
    <ui-prop v-prop="target.indicator" :multi-values="multi" />
    <ui-prop v-prop="target.pageTurningSpeed" :multi-values="multi" />
    <ui-prop v-prop="target.pageTurningEventTiming" :multi-values="multi" />
    <cc-array-prop :target="target.pageEvents" />
    <ui-prop v-prop="target.cancelInnerEvents" :multi-values="multi" />
  </template>
</template>

