<script setup lang="ts">
import { computed } from 'vue'
import { Editor } from './editor'
import type { BaseTarget, PropValue, AssetRef } from './types'

interface MissingScriptTarget extends BaseTarget {
  __scriptAsset: PropValue<AssetRef>
  compiled: PropValue<boolean>
}

const props = defineProps<{
  target?: MissingScriptTarget
}>()

const T = Editor.T

const cssBlock = {
  color: '#aa0',
  backgroundColor: '#333',
  border: '1px solid #666',
  borderRadius: '3px',
  margin: '10px',
  padding: '10px'
}

const message = computed(() => {
  const key = props.target?.compiled?.value
    ? 'COMPONENT.missing_scirpt.error_compiled'
    : 'COMPONENT.missing_scirpt.error_not_compiled'
  return T(key)
})
</script>

<template>
  <ui-prop
    name="Script"
    :tooltip="T('INSPECTOR.component.script')"
    readonly
    style="padding-top: 8px;"
  >
    <ui-asset
      type="cc.Script"
      droppable="asset"
      :value="target?.__scriptAsset?.value?.uuid"
      class="flex-1"
    />
  </ui-prop>
  <div :style="cssBlock">
    {{ message }}
  </div>
</template>

