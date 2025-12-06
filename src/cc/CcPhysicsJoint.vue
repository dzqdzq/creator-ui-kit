<script setup lang="ts">
import { Editor } from './editor'
import type { ComponentProp, PropValue, AssetRef } from './types'

interface PhysicsJointTarget extends ComponentProp {
  connectedBody: PropValue<AssetRef>
}

const props = defineProps<{
  target?: PhysicsJointTarget
}>()

const T = Editor.T

function lastRigidBody() {
  if (props.target?.uuid?.value) {
    Editor.Ipc.sendToPanel(
      'scene',
      'scene:choose-last-rigid-body',
      props.target.uuid.value
    )
  }
}

function nextRigidBody() {
  if (props.target?.uuid?.value) {
    Editor.Ipc.sendToPanel(
      'scene',
      'scene:choose-next-rigid-body',
      props.target.uuid.value
    )
  }
}
</script>

<template>
  <template v-if="target">
    <ui-prop name="Connected Body" style="padding-top: 8px">
      <ui-node
        class="flex-1"
        type="cc.RigidBody"
        typename="RigidBody"
        :value="target.connectedBody?.value?.uuid"
      />
      <ui-button class="blue tiny" @confirm="lastRigidBody">
        Last
      </ui-button>
      <ui-button class="blue tiny" @confirm="nextRigidBody">
        Next
      </ui-button>
    </ui-prop>
    
    <template v-for="(prop, key) in target" :key="key">
      <component
        v-if="prop?.attrs?.visible !== false && prop?.name !== 'Connected Body'"
        :is="prop?.compType"
        :target="prop"
        :indent="0"
      />
    </template>
  </template>
</template>

