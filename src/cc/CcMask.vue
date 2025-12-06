<script setup lang="ts">
import { computed } from 'vue'
import { Editor } from './editor'
import { cc, type BaseTarget, type PropValue, type AssetRef } from './types'

interface MaskTarget extends BaseTarget {
  type: PropValue<number>
  inverted: PropValue<boolean>
  segements: PropValue<number>
  alphaThreshold: PropValue<number>
  spriteFrame: PropValue<AssetRef>
}

const props = defineProps<{
  target?: MaskTarget
  multi?: boolean
}>()

const isRectType = computed(() => {
  return props.target?.type?.value === cc.Mask.Type.RECT
})

const isEllipseType = computed(() => {
  return props.target?.type?.value === cc.Mask.Type.ELLIPSE
})

const isImageStencilType = computed(() => {
  return props.target?.type?.value === cc.Mask.Type.IMAGE_STENCIL
})

const showResizeButton = computed(() => {
  return props.target?.spriteFrame?.value?.uuid && isImageStencilType.value
})

function onAppImageSizeClick() {
  if (!props.target?.uuid?.value) return
  
  const payload = {
    id: props.target.uuid.value,
    path: '_resizeToTarget',
    type: 'Boolean',
    isSubProp: false,
    value: true
  }
  Editor.Ipc.sendToPanel('scene', 'scene:set-property', payload)
}
</script>

<template>
  <template v-if="target">
    <ui-prop v-prop="target.type" :multi-values="multi" />
    <ui-prop v-prop="target.inverted" :multi-values="multi" />
    <ui-prop
      :min="3"
      v-show="isEllipseType"
      v-prop="target.segements"
      :multi-values="multi"
    />
    <ui-prop
      v-show="isImageStencilType"
      v-prop="target.alphaThreshold"
      :multi-values="multi"
    />
    <ui-prop
      v-show="isImageStencilType"
      v-prop="target.spriteFrame"
      :multi-values="multi"
    />
    <div
      v-show="showResizeButton"
      class="horizontal layout end-justified"
      style="padding: 5px 0; margin-bottom: 5px;"
    >
      <ui-button @confirm="onAppImageSizeClick">
        Resize to Target
      </ui-button>
    </div>
  </template>
</template>

