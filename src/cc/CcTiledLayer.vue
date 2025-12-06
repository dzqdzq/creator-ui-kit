<script setup lang="ts">
import type { BaseTarget, PropValue } from './types'

interface TiledLayerTarget extends BaseTarget {
  materials: PropValue
}

defineProps<{
  target?: TiledLayerTarget
  multi?: boolean
}>()
</script>

<template>
  <cc-array-prop v-if="target?.materials" :target="target.materials" />
</template>

