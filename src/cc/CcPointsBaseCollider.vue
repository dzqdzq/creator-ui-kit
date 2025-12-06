<script setup lang="ts">
import { Editor } from './editor'
import type { ComponentProp, PropValue } from './types'

interface PointsBaseColliderTarget extends ComponentProp {
  threshold: PropValue<number>
}

const props = defineProps<{
  target?: PointsBaseColliderTarget
}>()

const T = Editor.T

function regeneratePoints() {
  if (props.target?.uuid?.value) {
    Editor.Ipc.sendToPanel(
      'scene',
      'scene:regenerate-polygon-points',
      props.target.uuid.value
    )
  }
}
</script>

<template>
  <template v-if="target">
    <ui-prop name="Threshold">
      <ui-input class="flex-1" :value="target.threshold?.value" />
      <ui-button class="blue tiny" @confirm="regeneratePoints">
        Regenerate Points
      </ui-button>
    </ui-prop>
    
    <template v-for="(prop, key) in target" :key="key">
      <component
        v-if="prop?.attrs?.visible !== false"
        :is="prop?.compType"
        :target="prop"
        :indent="0"
      />
    </template>
  </template>
</template>

