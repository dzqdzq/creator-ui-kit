<script setup lang="ts">
import { computed } from 'vue'
import { Editor } from './editor'
import type { BaseTarget, PropValue, AssetRef } from './types'

interface ButtonTarget extends BaseTarget {
  target: PropValue<AssetRef>
  interactable: PropValue<boolean>
  enableAutoGrayEffect: PropValue<boolean>
  transition: PropValue<number>
  normalColor: PropValue
  pressedColor: PropValue
  hoverColor: PropValue
  disabledColor: PropValue
  duration: PropValue<number>
  normalSprite: PropValue<AssetRef>
  pressedSprite: PropValue<AssetRef>
  hoverSprite: PropValue<AssetRef>
  disabledSprite: PropValue<AssetRef>
  zoomScale: PropValue<number>
  clickEvents: PropValue
}

const props = defineProps<{
  target?: ButtonTarget
  multi?: boolean
}>()

const T = Editor.T

// 计算属性
const autoGrayEffectEnabled = computed(() => {
  if (!props.target) return false
  return props.target.transition?.value !== 2 || !props.target.disabledSprite?.value?.uuid
})

const checkResizeToTarget = computed(() => {
  if (props.multi) return true
  return !props.target?.target?.value?.uuid
})

// 检查 transition 类型
function checkTransition(targetValue: number): boolean {
  if (!props.target?.transition) return false
  if (props.multi) {
    return props.target.transition.values?.every(t => t === targetValue) ?? false
  }
  return props.target.transition.value === targetValue
}

const isColorTransition = computed(() => checkTransition(1))
const isSpriteTransition = computed(() => checkTransition(2))
const isScaleTransition = computed(() => checkTransition(3))

// 方法
function resetNodeSize() {
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
    <ui-prop v-prop="target.target" :multi-values="multi" />

    <div class="horizontal layout end-justified" style="padding: 5px 0; margin-bottom: 5px;">
      <ui-button
        class="blue tiny"
        :disabled="checkResizeToTarget"
        @confirm="resetNodeSize"
      >
        Resize to Target
      </ui-button>
    </div>

    <ui-prop v-prop="target.interactable" :multi-values="multi" />
    
    <ui-prop
      v-prop="target.enableAutoGrayEffect"
      v-show="autoGrayEffectEnabled"
      :multi-values="multi"
    />
    
    <cc-gray-section
      v-if="autoGrayEffectEnabled && target.enableAutoGrayEffect?.value"
      :target="target"
      :multi-values="multi"
    />

    <ui-prop v-prop="target.transition" :multi-values="multi" />

    <!-- Color Transition -->
    <div v-if="isColorTransition">
      <ui-prop :indent="1" v-prop="target.normalColor" :multi-values="multi" />
      <ui-prop :indent="1" v-prop="target.pressedColor" :multi-values="multi" />
      <ui-prop :indent="1" v-prop="target.hoverColor" :multi-values="multi" />
      <ui-prop :indent="1" v-prop="target.disabledColor" :multi-values="multi" />
      <ui-prop :indent="1" v-prop="target.duration" :multi-values="multi" />
    </div>

    <!-- Sprite Transition -->
    <div v-if="isSpriteTransition">
      <ui-prop :indent="1" v-prop="target.normalSprite" :multi-values="multi" />
      <ui-prop :indent="1" v-prop="target.pressedSprite" :multi-values="multi" />
      <ui-prop :indent="1" v-prop="target.hoverSprite" :multi-values="multi" />
      <ui-prop :indent="1" v-prop="target.disabledSprite" :multi-values="multi" />
    </div>

    <!-- Scale Transition -->
    <div v-if="isScaleTransition">
      <ui-prop :indent="1" v-prop="target.duration" :multi-values="multi" />
      <ui-prop :indent="1" v-prop="target.zoomScale" :multi-values="multi" />
    </div>

    <cc-array-prop :target="target.clickEvents" />
  </template>
</template>

