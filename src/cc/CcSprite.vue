<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Editor } from './editor'
import { cc, type BaseTarget, type PropValue, type AssetRef } from './types'

interface SpriteTarget extends BaseTarget {
  _atlas: PropValue<AssetRef>
  spriteFrame: PropValue<AssetRef>
  type: PropValue<number>
  fillType: PropValue<number>
  fillCenter: PropValue
  fillStart: PropValue<number>
  fillRange: PropValue<number>
  sizeMode: PropValue
  trim: PropValue<boolean>
  materials: PropValue
}

const props = defineProps<{
  target?: SpriteTarget
  multi?: boolean
}>()

const T = Editor.T

// 响应式数据
const atlasUuid = ref('')
const atlasUuids = ref<string[]>([])
const atlasMulti = ref(false)
const spriteUuid = ref('')
const spriteUuids = ref<string[]>([])
const spriteMulti = ref(false)

// 计算属性
const isFilledType = computed(() => {
  return props.target?.type?.value === cc.Sprite.Type.FILLED
})

const isRadialFilled = computed(() => {
  return props.target?.fillType?.value === cc.Sprite.FillType.RADIAL
})

const allowTrim = computed(() => {
  return props.target?.type?.value === cc.Sprite.Type.SIMPLE
})

// 方法
function updateAtlas() {
  if (!props.target) {
    atlasUuid.value = ''
    atlasUuids.value = []
    atlasMulti.value = false
    return
  }
  
  atlasUuid.value = props.target._atlas?.value?.uuid ?? ''
  atlasUuids.value = props.target._atlas?.values?.map(t => t.uuid) ?? []
  
  const firstUuid = atlasUuids.value[0]
  atlasMulti.value = !atlasUuids.value.every((uuid, index) => index === 0 || uuid === firstUuid)
}

function updateSprite() {
  if (!props.target) {
    spriteUuid.value = ''
    spriteUuids.value = []
    spriteMulti.value = false
    return
  }
  
  spriteUuid.value = props.target.spriteFrame?.value?.uuid ?? ''
  spriteUuids.value = props.target.spriteFrame?.values?.map(t => t.uuid) ?? []
  
  const firstUuid = spriteUuids.value[0]
  spriteMulti.value = !spriteUuids.value.every((uuid, index) => index === 0 || uuid === firstUuid)
}

function selectAtlas() {
  Editor.Ipc.sendToPanel('assets', 'change-filter', 't:sprite-atlas')
}

function editSprite() {
  if (props.target?.spriteFrame?.value?.uuid) {
    Editor.Panel.open('sprite-editor', {
      uuid: props.target.spriteFrame.value.uuid
    })
  }
}

// 生命周期
onMounted(() => {
  if (props.target) {
    updateAtlas()
    updateSprite()
  }
})

// 监听 target 变化
watch(() => props.target, () => {
  updateAtlas()
  updateSprite()
})
</script>

<template>
  <template v-if="target">
    <ui-prop
      style="padding-top: 8px"
      name="Atlas"
      :tooltip="T('COMPONENT.sprite.atlas')"
    >
      <ui-asset
        class="flex-1"
        type="sprite-atlas"
        :value="target._atlas?.value?.uuid"
        :values="atlasUuids"
        :multi-values="atlasMulti"
      />
      <ui-button
        class="blue tiny"
        :tooltip="T('COMPONENT.sprite.select_tooltip')"
        @confirm="selectAtlas"
      >
        {{ T('COMPONENT.sprite.select_button') }}
      </ui-button>
    </ui-prop>

    <ui-prop
      style="padding-top: 8px"
      name="Sprite Frame"
      :tooltip="T('COMPONENT.sprite.sprite_frame')"
    >
      <ui-asset
        class="flex-1"
        type="sprite-frame"
        :value="target.spriteFrame?.value?.uuid"
        :values="spriteUuids"
        :multi-values="spriteMulti"
      />
      <ui-button
        class="blue tiny"
        :tooltip="T('COMPONENT.sprite.edit_tooltip')"
        @confirm="editSprite"
      >
        {{ T('COMPONENT.sprite.edit_button') }}
      </ui-button>
    </ui-prop>

    <ui-prop v-prop="target.type" :multi-values="multi" />

    <div v-if="isFilledType">
      <ui-prop :indent="1" v-prop="target.fillType" :multi-values="multi" />
      <ui-prop
        :indent="1"
        v-prop="target.fillCenter"
        :disabled="!isRadialFilled"
        :multi-values="multi"
      />
      <ui-prop :indent="1" v-prop="target.fillStart" :multi-values="multi" />
      <ui-prop :indent="1" v-prop="target.fillRange" :multi-values="multi" />
    </div>

    <ui-prop v-prop="target.sizeMode" :multi-values="multi" />
    <ui-prop
      v-if="allowTrim"
      v-prop="target.trim"
      :multi-values="multi"
    />

    <cc-blend-section :target="target" />
    <cc-array-prop :target="target.materials" />
  </template>
</template>

