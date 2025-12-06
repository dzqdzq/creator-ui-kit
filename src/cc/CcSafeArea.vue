<script setup lang="ts">
import { Editor } from './editor'
import type { BaseTarget } from './types'

defineProps<{
  target?: BaseTarget
}>()

const cssBlock = {
  backgroundColor: '#333',
  border: '1px solid #666',
  borderRadius: '3px',
  margin: '10px',
  padding: '10px'
}

const T = Editor.T
</script>

<template>
  <div :style="cssBlock">
    {{ T('COMPONENT.safe_area.brief_help') }}
  </div>
</template>

