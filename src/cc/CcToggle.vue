<script setup lang="ts">
import { computed } from 'vue'
import { Editor } from './editor'
import type { BaseTarget, PropValue, AssetRef } from './types'

interface ToggleTarget extends BaseTarget {
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
  isChecked: PropValue<boolean>
  checkMark: PropValue
  toggleGroup: PropValue
  checkEvents: PropValue
}

const props = defineProps<{
  target?: ToggleTarget
  multi?: boolean
}>()

const T = Editor.T

// 检查 transition 类型（多值模式下检查是否有不匹配）
function updateValueMulti(transition: PropValue<number> | undefined, value: number): boolean {
  if (!transition) return true
  if (props.multi) {
    return transition.values?.some(t => t !== value) ?? true
  }
  return transition.value !== value
}

const showColorTransition = computed(() => !updateValueMulti(props.target?.transition, 1))
const showSpriteTransition = computed(() => !updateValueMulti(props.target?.transition, 2))
const showScaleTransition = computed(() => !updateValueMulti(props.target?.transition, 3))

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
    <ui-prop
      v-prop="target.target"
      :multi-values="multi"
      :tooltip="T('COMPONENT.toggle.target')"
    />
    
    <div class="horizontal layout end-justified" style="padding: 5px 0; margin-bottom: 5px;">
      <ui-button
        class="blue tiny"
        :disabled="multi"
        :multi-values="multi"
        @confirm="resetNodeSize"
      >
        Resize to Target
      </ui-button>
    </div>

    <ui-prop
      v-prop="target.interactable"
      :multi-values="multi"
      :tooltip="T('COMPONENT.toggle.interactable')"
    />

    <ui-prop
      v-prop="target.enableAutoGrayEffect"
      :tooltip="T('COMPONENT.toggle.auto_gray_effect')"
      :multi-values="multi"
    />

    <cc-gray-section
      v-if="target.enableAutoGrayEffect?.value"
      :target="target"
      :multi-values="multi"
    />

    <ui-prop
      v-prop="target.transition"
      :tooltip="T('COMPONENT.toggle.transition')"
      :multi-values="multi"
    />

    <!-- Color Transition -->
    <div v-if="showColorTransition">
      <ui-prop
        :indent="1"
        v-prop="target.normalColor"
        :multi-values="multi"
        :tooltip="T('COMPONENT.toggle.normal_color')"
      />
      <ui-prop
        :indent="1"
        v-prop="target.pressedColor"
        :multi-values="multi"
        :tooltip="T('COMPONENT.toggle.pressed_color')"
      />
      <ui-prop
        :indent="1"
        v-prop="target.hoverColor"
        :multi-values="multi"
        :tooltip="T('COMPONENT.toggle.hover_color')"
      />
      <ui-prop
        :indent="1"
        v-prop="target.disabledColor"
        :tooltip="T('COMPONENT.toggle.disabled_color')"
        :multi-values="multi"
      />
      <ui-prop
        :indent="1"
        v-prop="target.duration"
        :multi-values="multi"
        :tooltip="T('COMPONENT.toggle.duration')"
      />
    </div>

    <!-- Sprite Transition -->
    <div v-if="showSpriteTransition">
      <ui-prop
        :indent="1"
        v-prop="target.normalSprite"
        :tooltip="T('COMPONENT.toggle.normal_sprite')"
        :multi-values="multi"
      />
      <ui-prop
        :indent="1"
        v-prop="target.pressedSprite"
        :tooltip="T('COMPONENT.toggle.pressed_sprite')"
        :multi-values="multi"
      />
      <ui-prop
        :indent="1"
        v-prop="target.hoverSprite"
        :tooltip="T('COMPONENT.toggle.hover_sprite')"
        :multi-values="multi"
      />
      <ui-prop
        :indent="1"
        v-prop="target.disabledSprite"
        :tooltip="T('COMPONENT.toggle.disabled_sprite')"
        :multi-values="multi"
      />
    </div>

    <!-- Scale Transition -->
    <div v-if="showScaleTransition">
      <ui-prop
        :indent="1"
        v-prop="target.duration"
        :multi-values="multi"
        :tooltip="T('COMPONENT.toggle.duration')"
      />
      <ui-prop
        :indent="1"
        v-prop="target.zoomScale"
        :multi-values="multi"
        :tooltip="T('COMPONENT.toggle.zoom_scale')"
      />
    </div>

    <ui-prop
      v-prop="target.isChecked"
      :tooltip="T('COMPONENT.toggle.isChecked')"
      :multi-values="multi"
    />
    <ui-prop
      v-prop="target.checkMark"
      :tooltip="T('COMPONENT.toggle.checkMark')"
    />
    <ui-prop
      v-prop="target.toggleGroup"
      :tooltip="T('COMPONENT.toggle.toggleGroup')"
      :multi-values="multi"
    />

    <cc-array-prop :target="target.checkEvents" />
  </template>
</template>

