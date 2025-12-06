<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { Editor } from './editor'
import type { BaseTarget, PropValue } from './types'

interface WidgetTarget extends BaseTarget {
  isAlignTop: PropValue<boolean>
  isAlignBottom: PropValue<boolean>
  isAlignLeft: PropValue<boolean>
  isAlignRight: PropValue<boolean>
  isAlignHorizontalCenter: PropValue<boolean>
  isAlignVerticalCenter: PropValue<boolean>
  top: PropValue<number>
  bottom: PropValue<number>
  left: PropValue<number>
  right: PropValue<number>
  horizontalCenter: PropValue<number>
  verticalCenter: PropValue<number>
  isAbsoluteTop: PropValue<boolean>
  isAbsoluteBottom: PropValue<boolean>
  isAbsoluteLeft: PropValue<boolean>
  isAbsoluteRight: PropValue<boolean>
  isAbsoluteHorizontalCenter: PropValue<boolean>
  isAbsoluteVerticalCenter: PropValue<boolean>
  target: PropValue
  alignMode: PropValue
}

const props = defineProps<{
  target?: WidgetTarget
  multi?: boolean
}>()

const T = Editor.T
const instance = getCurrentInstance()

// 辅助函数：组合值和单位
function compose(prop: PropValue<number> | undefined, isAbsolute: boolean): string {
  if (!prop) return '0px'
  
  const { value, values } = prop
  
  if (props.multi && values?.some(v => values[0] !== v)) {
    return '-'
  }
  
  const val = value || 0
  const unit = isAbsolute ? 'px' : '%'
  
  return `${val.toFixed(2)}${unit}`
}

// 辅助函数：解析值和单位
function decompose(input: string): { value: number; isAbsolute: boolean } {
  let str = input
  let isAbsolute: boolean
  
  if (str.endsWith('%') || str.endsWith('％')) {
    str = str.slice(0, -1)
    isAbsolute = false
  } else {
    if (str.endsWith('px')) {
      str = str.slice(0, -2)
    }
    isAbsolute = true
  }
  
  const value = str === '' ? 0 : parseFloat(str)
  return { value, isAbsolute }
}

// 计算属性
const horizontalCenterValue = computed(() => {
  return compose(props.target?.horizontalCenter, props.target?.isAbsoluteHorizontalCenter?.value ?? true)
})

const verticalCenterValue = computed(() => {
  return compose(props.target?.verticalCenter, props.target?.isAbsoluteVerticalCenter?.value ?? true)
})

const topValue = computed(() => {
  return compose(props.target?.top, props.target?.isAbsoluteTop?.value ?? true)
})

const leftValue = computed(() => {
  return compose(props.target?.left, props.target?.isAbsoluteLeft?.value ?? true)
})

const rightValue = computed(() => {
  return compose(props.target?.right, props.target?.isAbsoluteRight?.value ?? true)
})

const bottomValue = computed(() => {
  return compose(props.target?.bottom, props.target?.isAbsoluteBottom?.value ?? true)
})

// 检查多值
function checkWidgetMulti(prop: PropValue<any> | any[] | undefined): boolean {
  if (!prop) return false
  const values = Array.isArray(prop) ? prop : prop.values
  if (!values) return false
  const first = values[0]
  return !values.every(v => v === first)
}

// 检查输入框是否显示
function checkWidgetInput(prop: PropValue<boolean> | undefined): boolean {
  if (!prop) return false
  if (props.multi) {
    return prop.values?.every(v => v === true) ?? false
  }
  return prop.value === true
}

// 修改 margin 值
function changeMargin(input: string, valueProp: string, absoluteProp: string): boolean {
  if (!props.target) return false
  
  const result = decompose(input)
  if (isNaN(result.value)) {
    Editor.warn('Invalid input: "%s"', input)
    return false
  }
  
  const targetAny = props.target as any
  if (result.value !== targetAny[valueProp]?.value) {
    targetAny[valueProp].value = result.value
  }
  
  if (result.isAbsolute !== targetAny[absoluteProp]?.value) {
    targetAny[absoluteProp].value = result.isAbsolute
  }
  
  return true
}

// 触发属性变更事件
function changePropValue(valueProp: PropValue, absoluteProp: PropValue) {
  const el = instance?.proxy?.$el
  if (!el) return
  
  Editor.UI.fire(el, 'target-change', {
    bubbles: true,
    detail: { type: valueProp.type, path: valueProp.path, value: valueProp.value }
  })
  
  Editor.UI.fire(el, 'target-change', {
    bubbles: true,
    detail: { type: absoluteProp.type, path: absoluteProp.path, value: absoluteProp.value }
  })
  
  Editor.UI.fire(el, 'target-confirm', {
    bubbles: true,
    detail: { type: valueProp.type, path: valueProp.path, value: valueProp.value }
  })
}

// 事件处理
function onHorizontalCenterChanged(event: any) {
  if (!props.target) return
  changeMargin(event.detail.value, 'horizontalCenter', 'isAbsoluteHorizontalCenter')
  changePropValue(props.target.horizontalCenter, props.target.isAbsoluteHorizontalCenter)
}

function onVerticalCenterChanged(event: any) {
  if (!props.target) return
  changeMargin(event.detail.value, 'verticalCenter', 'isAbsoluteVerticalCenter')
  changePropValue(props.target.verticalCenter, props.target.isAbsoluteVerticalCenter)
}

function onTopChanged(event: any) {
  if (!props.target) return
  changeMargin(event.detail.value, 'top', 'isAbsoluteTop')
  changePropValue(props.target.top, props.target.isAbsoluteTop)
}

function onLeftChanged(event: any) {
  if (!props.target) return
  changeMargin(event.detail.value, 'left', 'isAbsoluteLeft')
  changePropValue(props.target.left, props.target.isAbsoluteLeft)
}

function onRightChanged(event: any) {
  if (!props.target) return
  changeMargin(event.detail.value, 'right', 'isAbsoluteRight')
  changePropValue(props.target.right, props.target.isAbsoluteRight)
}

function onBottomChanged(event: any) {
  if (!props.target) return
  changeMargin(event.detail.value, 'bottom', 'isAbsoluteBottom')
  changePropValue(props.target.bottom, props.target.isAbsoluteBottom)
}

function onLeftRightChecked(event: any) {
  if (event.detail.value && props.target?.isAlignHorizontalCenter?.value) {
    props.target.isAlignHorizontalCenter.value = false
  }
}

function onTopBottomChecked(event: any) {
  if (event.detail.value && props.target?.isAlignVerticalCenter?.value) {
    props.target.isAlignVerticalCenter.value = false
  }
}

function onHorizontalCenterChecked(event: any) {
  if (event.detail.value && props.target) {
    if (props.target.isAlignLeft?.value || props.target.isAlignRight?.value) {
      props.target.isAlignLeft.value = false
      props.target.isAlignRight.value = false
    }
  }
}

function onVerticalCenterChecked(event: any) {
  if (event.detail.value && props.target) {
    if (props.target.isAlignTop?.value || props.target.isAlignBottom?.value) {
      props.target.isAlignTop.value = false
      props.target.isAlignBottom.value = false
    }
  }
}
</script>

<template>
  <template v-if="target">
    <div id="widget-outer">
      <div id="upper">
        <!-- Top -->
        <div class="h-control-group layout horizontal center">
          <ui-checkbox
            :value="target.isAlignTop?.value"
            :values="target.isAlignTop?.values"
            :multi-values="checkWidgetMulti(target.isAlignTop)"
            @change="onTopBottomChecked"
            :title="T('COMPONENT.widget.align_top')"
          >
            Top
          </ui-checkbox>
          <ui-input
            class="top-input small"
            :value="topValue"
            @confirm="onTopChanged"
            :title="T('COMPONENT.widget.top')"
            v-show="checkWidgetInput(target.isAlignTop)"
          />
        </div>

        <!-- Left & Right -->
        <div class="layout horizontal center">
          <div class="v-control-group layout vertical end">
            <ui-checkbox
              class="v-checkbox"
              :value="target.isAlignLeft?.value"
              :values="target.isAlignLeft?.values"
              :multi-values="checkWidgetMulti(target.isAlignLeft)"
              @change="onLeftRightChecked"
              :title="T('COMPONENT.widget.align_left')"
            >
              Left
            </ui-checkbox>
            <ui-input
              class="bottom-input small"
              :value="leftValue"
              @confirm="onLeftChanged"
              :title="T('COMPONENT.widget.left')"
              v-show="checkWidgetInput(target.isAlignLeft)"
            />
          </div>

          <cc-alignment-preview :target="target" />

          <div class="v-control-group layout vertical">
            <ui-checkbox
              class="v-checkbox"
              :value="target.isAlignRight?.value"
              :values="target.isAlignRight?.values"
              :multi-values="checkWidgetMulti(target.isAlignRight)"
              @change="onLeftRightChecked"
              :title="T('COMPONENT.widget.align_right')"
            >
              Right
            </ui-checkbox>
            <ui-input
              class="bottom-input small"
              :value="rightValue"
              @confirm="onRightChanged"
              :title="T('COMPONENT.widget.right')"
              v-show="checkWidgetInput(target.isAlignRight)"
            />
          </div>
        </div>

        <!-- Bottom -->
        <div class="h-control-group layout horizontal center">
          <ui-checkbox
            class="h-checkbox"
            :value="target.isAlignBottom?.value"
            :values="target.isAlignBottom?.values"
            :multi-values="checkWidgetMulti(target.isAlignBottom)"
            @change="onTopBottomChecked"
            :title="T('COMPONENT.widget.align_bottom')"
          >
            Bottom
          </ui-checkbox>
          <ui-input
            class="right-input small"
            :value="bottomValue"
            @confirm="onBottomChanged"
            :title="T('COMPONENT.widget.bottom')"
            v-show="checkWidgetInput(target.isAlignBottom)"
          />
        </div>
      </div>

      <div id="lower" class="layout vertical">
        <!-- Horizontal Center -->
        <div class="centered-prop layout horizontal center">
          <ui-checkbox
            :value="target.isAlignHorizontalCenter?.value"
            :values="target.isAlignHorizontalCenter?.values"
            :multi-values="checkWidgetMulti(target.isAlignHorizontalCenter)"
            @change="onHorizontalCenterChecked"
            :title="T('COMPONENT.widget.align_h_center')"
          >
            Horizontal Center
          </ui-checkbox>
          <span class="flex-1"></span>
          <ui-input
            :value="horizontalCenterValue"
            @confirm="onHorizontalCenterChanged"
            :title="T('COMPONENT.widget.horizontal_center')"
            v-show="target.isAlignHorizontalCenter?.value === true"
          />
        </div>

        <!-- Vertical Center -->
        <div class="centered-prop layout horizontal center">
          <ui-checkbox
            class="v-checkbox"
            :value="target.isAlignVerticalCenter?.value"
            :values="target.isAlignVerticalCenter?.values"
            :multi-values="checkWidgetMulti(target.isAlignVerticalCenter)"
            @change="onVerticalCenterChecked"
            :title="T('COMPONENT.widget.align_v_center')"
          >
            Vertical Center
          </ui-checkbox>
          <span class="flex-1"></span>
          <ui-input
            :value="verticalCenterValue"
            @confirm="onVerticalCenterChanged"
            :title="T('COMPONENT.widget.vertical_center')"
            v-show="target.isAlignVerticalCenter?.value === true"
          />
        </div>
      </div>

      <hr />
    </div>

    <ui-prop v-prop="target.target" :multi-values="multi" />
    <ui-prop v-prop="target.alignMode" :multi-values="multi" />
  </template>
</template>

<style scoped>
#widget-outer {
  width: 200px;
  margin: 0 auto;
}

#upper {
  margin: 0 auto 6px auto;
}

#lower {
  margin-left: 6px;
}

#widget-outer .h-control-group {
  height: 26px;
  position: relative;
  margin-left: 72px;
}

#widget-outer .v-control-group {
  width: 47px;
  height: 39px;
}

#widget-outer .top-input {
  position: relative;
  margin-left: 18px;
}

#widget-outer .bottom-input {
  margin-top: 4px;
}

#widget-outer .right-input {
  position: relative;
}

#widget-outer .v-checkbox {
  margin: 0px;
}

#widget-outer .centered-prop {
  height: 25px;
}

#widget-outer ui-input {
  width: 5.4em;
  margin: 0px;
}

#widget-outer hr {
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>

