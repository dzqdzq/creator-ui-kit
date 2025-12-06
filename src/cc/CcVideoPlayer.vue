<script setup lang="ts">
import { computed } from 'vue'
import { Editor } from './editor'
import type { BaseTarget, PropValue } from './types'

interface VideoPlayerTarget extends BaseTarget {
  resourceType: PropValue<number>
  remoteURL: PropValue<string>
  clip: PropValue
  currentTime: PropValue<number>
  volume: PropValue<number>
  mute: PropValue<boolean>
  keepAspectRatio: PropValue<boolean>
  isFullscreen: PropValue<boolean>
  stayOnBottom: PropValue<boolean>
  videoPlayerEvent: PropValue
}

const props = defineProps<{
  target?: VideoPlayerTarget
  multi?: boolean
}>()

const T = Editor.T

const isLocal = computed(() => {
  return props.target?.resourceType?.value === 1
})
</script>

<template>
  <template v-if="target">
    <ui-prop v-prop="target.resourceType" :multi-values="multi" />
    <ui-prop
      v-prop="target.remoteURL"
      v-show="!isLocal"
      :multi-values="multi"
    />
    <ui-prop
      v-show="isLocal"
      type="cc.Asset"
      asset-type="video-clip"
      name="Clip"
      :value="target.clip?.value"
      :multi-values="multi"
    />
    <ui-prop v-prop="target.currentTime" :multi-values="multi" />
    <ui-prop name="Volume">
      <ui-slider
        style="margin-left: -9px; width: 100%;"
        :value="target.volume?.value"
        min="0.0"
        max="1.0"
      />
    </ui-prop>
    <ui-prop v-prop="target.mute" :multi-values="multi" />
    <ui-prop v-prop="target.keepAspectRatio" :multi-values="multi" />
    <ui-prop v-prop="target.isFullscreen" :multi-values="multi" />
    <ui-prop v-prop="target.stayOnBottom" :multi-values="multi" />
    <cc-array-prop :target="target.videoPlayerEvent" />
  </template>
</template>

