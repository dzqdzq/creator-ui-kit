<script setup lang="ts">
import type { BaseTarget, PropValue } from './types'

interface ScrollViewTarget extends BaseTarget {
  content: PropValue
  horizontal: PropValue<boolean>
  vertical: PropValue<boolean>
  inertia: PropValue<boolean>
  brake: PropValue<number>
  elastic: PropValue<boolean>
  bounceDuration: PropValue<number>
  horizontalScrollBar: PropValue
  verticalScrollBar: PropValue
  scrollEvents: PropValue
  cancelInnerEvents: PropValue<boolean>
}

defineProps<{
  target?: ScrollViewTarget
  multi?: boolean
}>()
</script>

<template>
  <template v-if="target">
    <ui-prop v-prop="target.content" :multi-values="multi" />
    <div>
      <ui-prop v-prop="target.horizontal" :multi-values="multi" />
      <ui-prop v-prop="target.vertical" :multi-values="multi" />
      <ui-prop v-prop="target.inertia" :multi-values="multi" />
      <ui-prop
        v-if="target.inertia?.value"
        v-prop="target.brake"
        :multi-values="multi"
      />
      <ui-prop v-prop="target.elastic" :multi-values="multi" />
      <ui-prop
        v-if="target.elastic?.value"
        v-prop="target.bounceDuration"
        :multi-values="multi"
      />
      <ui-prop
        v-if="target.horizontal?.value"
        v-prop="target.horizontalScrollBar"
        :multi-values="multi"
      />
      <ui-prop
        v-if="target.vertical?.value"
        v-prop="target.verticalScrollBar"
        :multi-values="multi"
      />
      <cc-array-prop :target="target.scrollEvents" />
      <ui-prop v-prop="target.cancelInnerEvents" :multi-values="multi" />
    </div>
  </template>
</template>

