<script setup lang="ts">
import { computed } from 'vue'
import { Editor } from './editor'
import type { BaseTarget, PropValue } from './types'

interface EditBoxTarget extends BaseTarget {
  inputMode: PropValue<number>
  string: PropValue<string>
  placeholder: PropValue<string>
  background: PropValue
  textLabel: PropValue
  placeholderLabel: PropValue
  returnType: PropValue
  inputFlag: PropValue
  maxLength: PropValue<number>
  tabIndex: PropValue<number>
  editingDidBegan: PropValue
  textChanged: PropValue
  editingDidEnded: PropValue
  editingReturn: PropValue
}

const props = defineProps<{
  target?: EditBoxTarget
  multi?: boolean
}>()

const T = Editor.T

const isMultiline = computed(() => {
  return props.target?.inputMode?.value === 0
})
</script>

<template>
  <template v-if="target">
    <!-- Multiline input -->
    <ui-prop
      v-if="isMultiline"
      name="String"
      type="string"
      :title="T('COMPONENT.editbox.string')"
      :value="target.string?.value"
      :values="target.string?.values"
      :multi-values="multi"
      multiline
    />
    
    <!-- Single line input -->
    <ui-prop
      v-else
      name="String"
      type="string"
      :title="T('COMPONENT.editbox.string')"
      :value="target.string?.value"
      :values="target.string?.values"
    />

    <ui-prop v-prop="target.placeholder" :multi-values="multi" />
    <ui-prop v-prop="target.background" :multi-values="multi" />
    <ui-prop v-prop="target.textLabel" :multi-values="multi" />
    <ui-prop v-prop="target.placeholderLabel" :multi-values="multi" />
    <ui-prop v-prop="target.returnType" :multi-values="multi" />
    <ui-prop v-prop="target.inputFlag" :multi-values="multi" />
    <ui-prop v-prop="target.inputMode" :multi-values="multi" />
    <ui-prop v-prop="target.maxLength" :multi-values="multi" />
    <ui-prop v-prop="target.tabIndex" :multi-values="multi" />

    <cc-array-prop :target="target.editingDidBegan" />
    <cc-array-prop :target="target.textChanged" />
    <cc-array-prop :target="target.editingDidEnded" />
    <cc-array-prop :target="target.editingReturn" />
  </template>
</template>

