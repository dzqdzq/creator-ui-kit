<script setup lang="ts">
import { computed } from 'vue'
import { Editor } from './editor'
import { cc, type BaseTarget, type PropValue, type AssetRef } from './types'

interface ParticleSystemTarget extends BaseTarget {
  preview: PropValue<boolean>
  playOnLoad: PropValue<boolean>
  autoRemoveOnFinish: PropValue<boolean>
  file: PropValue<AssetRef>
  custom: PropValue<boolean>
  spriteFrame: PropValue<AssetRef>
  duration: PropValue<number>
  emissionRate: PropValue<number>
  life: PropValue<number>
  lifeVar: PropValue<number>
  totalParticles: PropValue<number>
  startColor: PropValue
  startColorVar: PropValue
  endColor: PropValue
  endColorVar: PropValue
  angle: PropValue<number>
  angleVar: PropValue<number>
  startSize: PropValue<number>
  startSizeVar: PropValue<number>
  endSize: PropValue<number>
  endSizeVar: PropValue<number>
  startSpin: PropValue<number>
  startSpinVar: PropValue<number>
  endSpin: PropValue<number>
  endSpinVar: PropValue<number>
  posVar: PropValue
  positionType: PropValue
  emitterMode: PropValue<number>
  gravity: PropValue
  speed: PropValue<number>
  speedVar: PropValue<number>
  tangentialAccel: PropValue<number>
  tangentialAccelVar: PropValue<number>
  radialAccel: PropValue<number>
  radialAccelVar: PropValue<number>
  rotationIsDir: PropValue<boolean>
  startRadius: PropValue<number>
  startRadiusVar: PropValue<number>
  endRadius: PropValue<number>
  endRadiusVar: PropValue<number>
  ednRadius: PropValue<number> // typo in original
  rotatePerS: PropValue<number>
  rotatePerSVar: PropValue<number>
}

const props = defineProps<{
  target?: ParticleSystemTarget
  multi?: boolean
}>()

const T = Editor.T

// 计算属性
const isGravityMode = computed(() => {
  if (!props.target?.emitterMode) return false
  if (props.multi) {
    return props.target.emitterMode.values?.every(v => v === 0) ?? false
  }
  return props.target.emitterMode.value === 0
})

const isRadiusMode = computed(() => {
  if (!props.target?.emitterMode) return false
  if (props.multi) {
    return props.target.emitterMode.values?.every(v => v === 1) ?? false
  }
  return props.target.emitterMode.value === 1
})

const checkCustomMulti = computed(() => {
  if (!props.multi || !props.target?.custom?.values) return false
  return !props.target.custom.values.every(v => !!v)
})

const checkCustomShow = computed(() => {
  if (!props.target?.custom) return false
  if (props.multi) {
    return props.target.custom.values?.every(v => !!v) ?? false
  }
  return !!props.target.custom.value
})

const showSyncButton = computed(() => {
  return props.target?.custom?.value && props.target?.file?.value?.uuid
})

// 方法
function updateMultiValues(prop: PropValue | undefined): boolean {
  if (!props.multi || !prop?.values) return false
  const first = prop.values[0]
  return !prop.values.every(v => v === first)
}

function onCustomChange() {
  if (!props.target?.uuid?.value) return
  
  Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
    id: props.target.uuid.value,
    path: 'spriteFrame',
    type: 'cc.SpriteFrame',
    value: { uuid: props.target.spriteFrame?.value?.uuid },
    isSubProp: false
  })
}

function saveCustomData() {
  if (props.target?.uuid?.value) {
    Editor.Ipc.sendToPanel(
      'scene',
      'scene:export-particle-plist',
      props.target.uuid.value
    )
  }
}

function applyPlistData() {
  if (!props.target?.custom?.value || !props.target?.file?.value?.uuid) return
  
  cc.assetManager.loadAny(props.target.file.value.uuid, (err, asset) => {
    if (err) {
      Editor.error(err)
      return
    }
    // 实际实现中需要解析 plist 文件
    console.log('[applyPlistData] Loaded asset:', asset)
  })
}
</script>

<template>
  <template v-if="target">
    <ui-prop v-prop="target.preview" :multi-values="multi" />
    <ui-prop
      v-prop="target.playOnLoad"
      :multi-values="multi"
      :tooltip="T('COMPONENT.particle_system.playOnLoad')"
    />
    <ui-prop v-prop="target.autoRemoveOnFinish" :multi-values="multi" />
    <ui-prop v-prop="target.file" :multi-values="multi" />

    <ui-prop name="Custom" :tooltip="T('COMPONENT.particle_system.custom')">
      <ui-checkbox
        class="flex-1"
        :value="target.custom?.value"
        :values="target.custom?.values"
        :multi-values="checkCustomMulti"
        @change="onCustomChange"
      />
      <ui-button
        v-show="showSyncButton"
        :title="T('COMPONENT.particle.sync_tips')"
        :disabled="multi"
        @confirm="applyPlistData"
      >
        {{ T('COMPONENT.particle.sync') }}
      </ui-button>
      <ui-button
        v-show="target.custom?.value"
        :title="T('COMPONENT.particle.export_title')"
        :disabled="multi"
        @confirm="saveCustomData"
      >
        {{ T('COMPONENT.particle.export') }}
      </ui-button>
    </ui-prop>

    <template v-if="checkCustomShow">
      <ui-prop
        v-prop="target.spriteFrame"
        :multi-values="multi"
        :tooltip="T('COMPONENT.particle_system.spriteFrame')"
      />
      <ui-prop
        v-prop="target.duration"
        :multi-values="multi"
        :tooltip="T('COMPONENT.particle_system.duration')"
      />
      <ui-prop
        v-prop="target.emissionRate"
        :multi-values="multi"
        :tooltip="T('COMPONENT.particle_system.emissionRate')"
      />
      
      <!-- Life -->
      <ui-prop :name="target.life?.name" :tooltip="T('COMPONENT.particle_system.life')">
        <ui-num-input
          class="flex-1"
          :value="target.life?.value"
          :values="target.life?.values"
          :multi-values="updateMultiValues(target.life)"
        />
        <ui-num-input
          class="flex-1"
          :value="target.lifeVar?.value"
          :values="target.lifeVar?.values"
          :multi-values="updateMultiValues(target.lifeVar)"
        />
      </ui-prop>

      <ui-prop
        v-prop="target.totalParticles"
        :multi-values="multi"
        :tooltip="T('COMPONENT.particle_system.totalParticles')"
      />
      
      <!-- Colors -->
      <ui-prop v-prop="target.startColor" :multi-values="multi" :tooltip="T('COMPONENT.particle_system.startColor')" />
      <ui-prop :indent="1" v-prop="target.startColorVar" :multi-values="multi" :tooltip="T('COMPONENT.particle_system.startColorVar')" />
      <ui-prop v-prop="target.endColor" :multi-values="multi" :tooltip="T('COMPONENT.particle_system.endColor')" />
      <ui-prop :indent="1" v-prop="target.endColorVar" :multi-values="multi" :tooltip="T('COMPONENT.particle_system.endColorVar')" />

      <!-- Angle -->
      <ui-prop :name="target.angle?.name" :tooltip="T('COMPONENT.particle_system.angle')">
        <ui-num-input class="flex-1" :value="target.angle?.value" :values="target.angle?.values" :multi-values="updateMultiValues(target.angle)" />
        <ui-num-input class="flex-1" :value="target.angleVar?.value" :values="target.angleVar?.values" :multi-values="updateMultiValues(target.angleVar)" />
      </ui-prop>

      <!-- Start Size -->
      <ui-prop :name="target.startSize?.name" :tooltip="T('COMPONENT.particle_system.startSize')">
        <ui-num-input class="flex-1" :value="target.startSize?.value" :values="target.startSize?.values" :multi-values="updateMultiValues(target.startSize)" />
        <ui-num-input class="flex-1" :value="target.startSizeVar?.value" :values="target.startSizeVar?.values" :multi-values="updateMultiValues(target.startSizeVar)" />
      </ui-prop>

      <!-- End Size -->
      <ui-prop :name="target.endSize?.name" :tooltip="T('COMPONENT.particle_system.endSize')">
        <ui-num-input class="flex-1" :value="target.endSize?.value" :values="target.endSize?.values" :multi-values="updateMultiValues(target.endSize)" />
        <ui-num-input class="flex-1" :value="target.endSizeVar?.value" :values="target.endSizeVar?.values" :multi-values="updateMultiValues(target.endSizeVar)" />
      </ui-prop>

      <!-- Start Spin -->
      <ui-prop :name="target.startSpin?.name" :tooltip="T('COMPONENT.particle_system.startSpin')">
        <ui-num-input class="flex-1" :value="target.startSpin?.value" :values="target.startSpin?.values" :multi-values="updateMultiValues(target.startSpin)" />
        <ui-num-input class="flex-1" :value="target.startSpinVar?.value" :values="target.startSpinVar?.values" :multi-values="updateMultiValues(target.startSpinVar)" />
      </ui-prop>

      <!-- End Spin -->
      <ui-prop :name="target.endSpin?.name" :tooltip="T('COMPONENT.particle_system.endSpin')">
        <ui-num-input class="flex-1" :value="target.endSpin?.value" :values="target.endSpin?.values" :multi-values="updateMultiValues(target.endSpin)" />
        <ui-num-input class="flex-1" :value="target.endSpinVar?.value" :values="target.endSpinVar?.values" :multi-values="updateMultiValues(target.endSpinVar)" />
      </ui-prop>

      <ui-prop v-prop="target.posVar" :multi-values="multi" :tooltip="T('COMPONENT.particle_system.posVar')" />
      <ui-prop v-prop="target.positionType" :multi-values="multi" :tooltip="T('COMPONENT.particle_system.positionType')" />
      <ui-prop v-prop="target.emitterMode" :multi-values="multi" :tooltip="T('COMPONENT.particle_system.emitterMode')" />

      <!-- Gravity Mode -->
      <div v-if="isGravityMode">
        <ui-prop :indent="1" v-prop="target.gravity" :tooltip="T('COMPONENT.particle_system.gravity')" />
        
        <ui-prop :indent="1" :name="target.speed?.name" :tooltip="T('COMPONENT.particle_system.speed')">
          <ui-num-input class="flex-1" :value="target.speed?.value" :values="target.speed?.values" :multi-values="updateMultiValues(target.speed)" />
          <ui-num-input class="flex-1" :value="target.speedVar?.value" :values="target.speedVar?.values" :multi-values="updateMultiValues(target.speedVar)" />
        </ui-prop>

        <ui-prop :indent="1" :name="target.tangentialAccel?.name" :tooltip="T('COMPONENT.particle_system.tangentialAccel')">
          <ui-num-input class="flex-1" :value="target.tangentialAccel?.value" :values="target.tangentialAccel?.values" :multi-values="updateMultiValues(target.tangentialAccel)" />
          <ui-num-input class="flex-1" :value="target.tangentialAccelVar?.value" :values="target.tangentialAccelVar?.values" :multi-values="updateMultiValues(target.tangentialAccelVar)" />
        </ui-prop>

        <ui-prop :indent="1" :name="target.radialAccel?.name" :tooltip="T('COMPONENT.particle_system.radialAccel')">
          <ui-num-input class="flex-1" :value="target.radialAccel?.value" :values="target.radialAccel?.values" :multi-values="updateMultiValues(target.radialAccel)" />
          <ui-num-input class="flex-1" :value="target.radialAccelVar?.value" :values="target.radialAccelVar?.values" :multi-values="updateMultiValues(target.radialAccelVar)" />
        </ui-prop>

        <ui-prop :indent="1" v-prop="target.rotationIsDir" :multi-values="multi" :tooltip="T('COMPONENT.particle_system.rotationIsDir')" />
      </div>

      <!-- Radius Mode -->
      <div v-if="isRadiusMode">
        <ui-prop :indent="1" :name="target.startRadius?.name" :tooltip="T('COMPONENT.particle_system.startRadius')">
          <ui-num-input class="flex-1" :value="target.startRadius?.value" :values="target.startRadius?.values" :multi-values="updateMultiValues(target.startRadius)" />
          <ui-num-input class="flex-1" :value="target.startRadiusVar?.value" :values="target.startRadiusVar?.values" :multi-values="updateMultiValues(target.startRadiusVar)" />
        </ui-prop>

        <ui-prop :indent="1" :name="target.endRadius?.name" :tooltip="T('COMPONENT.particle_system.endRadius')">
          <ui-num-input class="flex-1" :value="target.endRadius?.value" :values="target.endRadius?.values" :multi-values="updateMultiValues(target.ednRadius)" />
          <ui-num-input class="flex-1" :value="target.endRadiusVar?.value" :values="target.endRadiusVar?.values" :multi-values="updateMultiValues(target.endRadiusVar)" />
        </ui-prop>

        <ui-prop :indent="1" :name="target.rotatePerS?.name" :tooltip="T('COMPONENT.particle_system.rotatePerS')">
          <ui-num-input class="flex-1" :value="target.rotatePerS?.value" :values="target.rotatePerS?.values" :multi-values="updateMultiValues(target.rotatePerS)" />
          <ui-num-input class="flex-1" :value="target.rotatePerSVar?.value" :values="target.rotatePerSVar?.values" :multi-values="updateMultiValues(target.rotatePerSVar)" />
        </ui-prop>
      </div>

      <cc-blend-section :target="target" />
    </template>
  </template>
</template>

