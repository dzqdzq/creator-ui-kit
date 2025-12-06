<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Editor } from './editor'
import type { BaseTarget, PropValue } from './types'

interface CameraTarget extends BaseTarget {
  backgroundColor: PropValue
  depth: PropValue<number>
  cullingMask: PropValue<number>
  clearFlags: PropValue<number>
  rect: PropValue
  zoomRatio: PropValue<number>
  nearClip: PropValue<number>
  farClip: PropValue<number>
  alignWithScreen: PropValue<boolean>
  ortho: PropValue<boolean>
  fov: PropValue<number>
  orthoSize: PropValue<number>
  renderStages: PropValue<number>
  _is3D: PropValue<boolean>
}

const props = defineProps<{
  target?: CameraTarget
  multi?: boolean
}>()

const T = Editor.T

// 响应式数据
const groupList = ref<string[]>([])
const clearFlags = ['Color', 'Depth', 'Stencil']
const renderStagesList = ['Opaque', 'Transparent']
let profile: any = null

// 计算属性
const is3DCamera = computed(() => props.target?._is3D?.value ?? false)
const alignWithScreen = computed(() => props.target?.alignWithScreen?.value ?? false)
const isOrtho = computed(() => props.target?.ortho?.value ?? false)

const showFov = computed(() => {
  return !isOrtho.value && is3DCamera.value && !alignWithScreen.value
})

const showOrthoSize = computed(() => {
  return isOrtho.value && !alignWithScreen.value
})

// 方法
function setProperty(value: number, path: string) {
  if (!props.target?.uuid?.value) return
  
  const payload = {
    id: props.target.uuid.value,
    path,
    type: 'Number',
    isSubProp: false,
    value
  }
  Editor.Ipc.sendToPanel('scene', 'scene:set-property', payload)
  Editor.Ipc.sendToPanel('scene', 'scene:undo-commit')
}

function onProfileChanged() {
  if (profile) {
    groupList.value = profile.get('group-list')
  }
}

// Culling Mask
function getCullingMask(index: number): boolean {
  return !!((props.target?.cullingMask?.value ?? 0) & (1 << index))
}

function onCullingMaskChanged(event: any, index: number) {
  const currentValue = props.target?.cullingMask?.value ?? 0
  let newValue = 0
  
  for (let i = 0; i < 32; i++) {
    newValue += i !== index 
      ? currentValue & (1 << i) 
      : event.currentTarget.value ? (1 << index) : 0
  }
  
  if (props.target?.cullingMask) {
    props.target.cullingMask.value = newValue
  }
  setProperty(newValue, 'cullingMask')
}

function getEverythingMask(): boolean {
  const value = props.target?.cullingMask?.value ?? 0
  for (let i = 0; i < groupList.value.length; i++) {
    if (!(value & (1 << i))) {
      return false
    }
  }
  return true
}

function onEverythingMaskChanged(event: any) {
  const newValue = event.currentTarget.value ? 4294967295 : 0
  
  if (props.target?.cullingMask) {
    props.target.cullingMask.value = newValue
  }
  setProperty(newValue, 'cullingMask')
}

// Clear Flags
function getClearFlags(index: number): boolean {
  return !!((props.target?.clearFlags?.value ?? 0) & (1 << index))
}

function onClearFlagsChanged(event: any, index: number) {
  const currentValue = props.target?.clearFlags?.value ?? 0
  let newValue = 0
  
  for (let i = 0; i < clearFlags.length; i++) {
    newValue += i !== index 
      ? currentValue & (1 << i) 
      : event.currentTarget.value ? (1 << index) : 0
  }
  
  if (props.target?.clearFlags) {
    props.target.clearFlags.value = newValue
  }
  setProperty(newValue, 'clearFlags')
}

// Render Stages
function getRenderStages(index: number): boolean {
  return !!((props.target?.renderStages?.value ?? 0) & (1 << index))
}

function onRenderStagesChanged(event: any, index: number) {
  const currentValue = props.target?.renderStages?.value ?? 0
  let newValue = 0
  
  for (let i = 0; i < renderStagesList.length; i++) {
    newValue += i !== index 
      ? currentValue & (1 << i) 
      : event.currentTarget.value ? (1 << index) : 0
  }
  
  if (props.target?.renderStages) {
    props.target.renderStages.value = newValue
  }
  setProperty(newValue, 'renderStages')
}

// 生命周期
onMounted(() => {
  profile = Editor.Profile.load('project://project.json')
  groupList.value = profile.get('group-list')
  profile.on('changed', onProfileChanged)
})

onUnmounted(() => {
  if (profile) {
    profile.removeListener('changed', onProfileChanged)
  }
})
</script>

<template>
  <template v-if="target">
    <ui-prop v-prop="target.backgroundColor" :multi-values="multi" />
    <ui-prop v-prop="target.depth" :multi-values="multi" />

    <!-- Culling Mask -->
    <ui-prop
      name="cullingMask"
      :multi-values="multi"
      auto-height
      :tooltip="T('COMPONENT.camera.cullingMask')"
    >
      <div id="checkboxes" class="layout vertical">
        <ui-checkbox
          :value="getEverythingMask()"
          @change="onEverythingMaskChanged"
        >
          Everything
        </ui-checkbox>
        <div v-for="(group, index) in groupList" :key="index">
          <ui-checkbox
            :value="getCullingMask(index)"
            @change="(e: any) => onCullingMaskChanged(e, index)"
          >
            {{ group }}
          </ui-checkbox>
        </div>
      </div>
    </ui-prop>

    <!-- Clear Flags -->
    <ui-prop
      name="clearFlags"
      :multi-values="multi"
      auto-height
      :tooltip="T('COMPONENT.camera.clearFlags')"
    >
      <div id="checkboxes" class="layout vertical">
        <div v-for="(name, index) in clearFlags" :key="index">
          <ui-checkbox
            :value="getClearFlags(index)"
            @change="(e: any) => onClearFlagsChanged(e, index)"
          >
            {{ name }}
          </ui-checkbox>
        </div>
      </div>
    </ui-prop>

    <ui-prop v-prop="target.rect" :multi-values="multi" />
    <ui-prop v-prop="target.zoomRatio" :multi-values="multi" />

    <!-- Render Stages (3D only) -->
    <ui-prop
      v-if="is3DCamera"
      name="renderStages"
      :multi-values="multi"
      auto-height
      :tooltip="T('COMPONENT.camera.renderStages')"
    >
      <div id="checkboxes" class="layout vertical">
        <div v-for="(name, index) in renderStagesList" :key="index">
          <ui-checkbox
            :value="getRenderStages(index)"
            @change="(e: any) => onRenderStagesChanged(e, index)"
          >
            {{ name }}
          </ui-checkbox>
        </div>
      </div>
    </ui-prop>

    <ui-prop v-if="is3DCamera" v-prop="target.nearClip" :multi-values="multi" />
    <ui-prop v-if="is3DCamera" v-prop="target.farClip" :multi-values="multi" />
    <ui-prop v-prop="target.alignWithScreen" :multi-values="multi" />
    <ui-prop v-if="is3DCamera" v-prop="target.ortho" :multi-values="multi" />
    <ui-prop v-if="showFov" v-prop="target.fov" :multi-values="multi" />
    <ui-prop v-if="showOrthoSize" v-prop="target.orthoSize" :multi-values="multi" />
  </template>
</template>

<style scoped>
#checkboxes div ui-checkbox {
  margin-top: 1px;
}
#checkboxes div:first-child ui-checkbox {
  margin-top: 0;
}
</style>

