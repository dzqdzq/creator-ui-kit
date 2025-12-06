<script setup lang="ts">
import { Editor } from './editor'
import type { ComponentProp } from './types'

const props = defineProps<{
  target?: ComponentProp
}>()

const T = Editor.T

function searchClips() {
  if (props.target?.uuid?.value) {
    Editor.Ipc.sendToPanel(
      'scene',
      'scene:generate_attached_node',
      props.target.uuid.value
    )
  }
}
</script>

<template>
  <template v-if="target" v-for="(prop, key) in target" :key="key">
    <component
      v-if="prop?.attrs?.visible !== false"
      :is="prop?.compType"
      :target="prop"
      :indent="0"
    />
  </template>
  <ui-button
    class="blue"
    style="margin-left: 15px; margin-right: 15px; margin-top: 15px;"
    @confirm="searchClips"
  >
    {{ T('COMPONENT.attach_util.generate_attached_node') }}
  </ui-button>
</template>

