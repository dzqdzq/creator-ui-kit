<script setup lang="ts">
import { ref } from 'vue'
import {
  UiButton,
  UiInput,
  UiCheckbox,
  UiNumInput,
  UiSelect,
  UiTextArea,
  UiColor,
  UiSection,
  UiProp,
  UiAsset
} from './components'

// Node 属性数据
const nodeActive = ref(true)
const nodeName = ref('')
const position = ref({ x: 0, y: 0 })
const rotation = ref(0)
const scale = ref({ x: 1, y: 1 })
const anchor = ref({ x: 0.5, y: 0.5 })
const size = ref({ w: 100, h: 100 })
const nodeColor = ref('#ffffff')
const opacity = ref(255)
const skew = ref({ x: 0, y: 0 })
const group = ref('default')

// Label 属性数据
const labelActive = ref(true)
const labelText = ref('')
const horizontalAlign = ref('0')
const verticalAlign = ref('0')
const fontSize = ref(40)
const lineHeight = ref(40)
const overflow = ref('0')
const cacheMode = ref('0')
const fontFamily = ref('')
const enableWrapText = ref(false)
const enableBold = ref(false)
const enableItalic = ref(false)
const enableUnderline = ref(true)

// 下拉选项
const groupOptions = [{ value: 'default', label: 'default' }]
const hAlignOptions = [
  { value: '0', label: 'LEFT' },
  { value: '1', label: 'CENTER' },
  { value: '2', label: 'RIGHT' }
]
const vAlignOptions = [
  { value: '0', label: 'TOP' },
  { value: '1', label: 'CENTER' },
  { value: '2', label: 'BOTTOM' }
]
const overflowOptions = [
  { value: '0', label: 'NONE' },
  { value: '1', label: 'CLAMP' },
  { value: '2', label: 'SHRINK' },
  { value: '3', label: 'RESIZE_HEIGHT' }
]
const cacheModeOptions = [
  { value: '0', label: 'NONE' },
  { value: '1', label: 'BITMAP' },
  { value: '2', label: 'CHAR' }
]
const blendOptions = [
  { value: '0', label: 'ZERO' },
  { value: '1', label: 'ONE' },
  { value: '768', label: 'SRC_COLOR' },
  { value: '769', label: 'ONE_MINUS_SRC_COLOR' },
  { value: '770', label: 'SRC_ALPHA' },
  { value: '771', label: 'ONE_MINUS_SRC_ALPHA' },
  { value: '772', label: 'DST_ALPHA' },
  { value: '773', label: 'ONE_MINUS_DST_ALPHA' },
  { value: '774', label: 'DST_COLOR' },
  { value: '775', label: 'ONE_MINUS_DST_COLOR' }
]

const srcBlend = ref('770')
const dstBlend = ref('771')
</script>

<template>
  <div id="view" class="flex-1">
    <div class="fit layout vertical">
      <!-- 顶部标题栏 -->
      <div class="header-bar">
        <div class="layout horizontal center-center">
          <UiCheckbox v-model="nodeActive" tooltip="该节点是否处于激活状态" />
          <UiInput 
            v-model="nodeName" 
            class="flex-1" 
            tooltip="节点在场景和层级中的名称" 
            placeholder="Node Name"
          />
          <UiButton 
            size="tiny" 
            variant="transparent"
            title="TODO"
            style="font-weight: normal; font-size: 0.8rem; color: rgb(170, 170, 170); width: 29px;"
          >
            3D
          </UiButton>
        </div>
      </div>

      <!-- 属性面板 -->
      <div class="props flex-1">
        <!-- Node Section -->
        <UiSection>
          <template #header>
            <div class="header flex-1 layout horizontal center-center">
              <span draggable="true">Node</span>
              <span class="flex-1"></span>
              <UiButton size="tiny" variant="transparent" title="">
                ⚙
              </UiButton>
            </div>
          </template>

          <!-- Position -->
          <UiProp name="Position" tooltip="相对父节点的位置坐标，以像素为单位">
            <UiProp name="X" subset fixed-label class="flex-1">
              <UiNumInput v-model="position.x" class="flex-1" />
            </UiProp>
            <UiProp name="Y" subset fixed-label class="flex-1">
              <UiNumInput v-model="position.y" class="flex-1" />
            </UiProp>
          </UiProp>

          <!-- Rotation -->
          <UiProp name="Rotation" tooltip="相对父节点的旋转，以度为单位，输入正值时逆时针旋转">
            <UiNumInput v-model="rotation" class="flex-1" />
          </UiProp>

          <!-- Scale -->
          <UiProp name="Scale" tooltip="节点的整体缩放比例，会影响所有子节点">
            <UiProp name="X" subset fixed-label class="flex-1">
              <UiNumInput v-model="scale.x" class="flex-1" />
            </UiProp>
            <UiProp name="Y" subset fixed-label class="flex-1">
              <UiNumInput v-model="scale.y" class="flex-1" />
            </UiProp>
          </UiProp>

          <!-- Anchor -->
          <UiProp name="Anchor" tooltip="节点位置和旋转的基准点，(0,0)表示左下角，(1,1)表示右上角">
            <UiProp name="X" subset fixed-label class="flex-1">
              <UiNumInput v-model="anchor.x" class="flex-1" />
            </UiProp>
            <UiProp name="Y" subset fixed-label class="flex-1">
              <UiNumInput v-model="anchor.y" class="flex-1" />
            </UiProp>
          </UiProp>

          <!-- Size -->
          <UiProp name="Size" tooltip="节点的内容尺寸，以像素为单位，在排版中至关重要">
            <UiProp name="W" subset fixed-label class="flex-1">
              <UiNumInput v-model="size.w" class="flex-1" />
            </UiProp>
            <UiProp name="H" subset fixed-label class="flex-1">
              <UiNumInput v-model="size.h" class="flex-1" />
            </UiProp>
          </UiProp>

          <!-- Color -->
          <UiProp name="Color" tooltip="节点的颜色，会影响节点上的渲染组件的颜色显示">
            <UiColor v-model="nodeColor" class="flex-1" />
          </UiProp>

          <!-- Opacity -->
          <UiProp name="Opacity" tooltip="节点的不透明度，会影响本节点和所有子节点上渲染组件的不透明度">
            <UiNumInput v-model="opacity" :min="0" :max="255" class="flex-1" />
          </UiProp>

          <!-- Skew -->
          <UiProp name="Skew">
            <UiProp name="X" subset fixed-label class="flex-1">
              <UiNumInput v-model="skew.x" class="flex-1" />
            </UiProp>
            <UiProp name="Y" subset fixed-label class="flex-1">
              <UiNumInput v-model="skew.y" class="flex-1" />
            </UiProp>
          </UiProp>

          <!-- Group -->
          <UiProp name="Group" tooltip="节点的分组，会影响节点的碰撞或其他信息">
            <UiSelect v-model="group" :options="groupOptions" class="flex-1" />
            <UiButton size="tiny" variant="blue">编辑</UiButton>
          </UiProp>
        </UiSection>

        <!-- Label Section -->
        <UiSection>
          <template #header>
            <div class="header flex-1 layout horizontal center-center">
              <UiCheckbox v-model="labelActive" />
              <span draggable="true">Label</span>
              <span class="flex-1"></span>
              <UiButton size="tiny" variant="transparent" title="帮助文档">
                📖
              </UiButton>
              <UiButton size="tiny" variant="transparent" title="">
                ⚙
              </UiButton>
            </div>
          </template>

          <!-- String (TextArea) -->
          <UiProp auto-height>
            <UiTextArea v-model="labelText" class="flex-1" :rows="3" />
          </UiProp>

          <!-- Horizontal Align -->
          <UiProp>
            <UiSelect v-model="horizontalAlign" :options="hAlignOptions" class="flex-1" />
          </UiProp>

          <!-- Vertical Align -->
          <UiProp>
            <UiSelect v-model="verticalAlign" :options="vAlignOptions" class="flex-1" />
          </UiProp>

          <!-- Font Size -->
          <UiProp>
            <UiNumInput v-model="fontSize" class="flex-1" />
          </UiProp>

          <!-- Line Height -->
          <UiProp>
            <UiNumInput v-model="lineHeight" class="flex-1" />
          </UiProp>

          <!-- Overflow -->
          <UiProp>
            <UiSelect v-model="overflow" :options="overflowOptions" class="flex-1" />
          </UiProp>

          <!-- Font Asset -->
          <UiProp style="padding-top: 8px;">
            <UiAsset type="cc.Font" empty class="flex-1" />
          </UiProp>

          <!-- Font Family -->
          <UiProp>
            <UiInput v-model="fontFamily" class="flex-1" placeholder="Font Family" />
          </UiProp>

          <!-- Enable Wrap Text -->
          <UiProp>
            <UiCheckbox v-model="enableWrapText" class="flex-1" />
          </UiProp>

          <!-- Enable Bold -->
          <UiProp>
            <UiCheckbox v-model="enableBold" class="flex-1" />
          </UiProp>

          <!-- Enable Italic -->
          <UiProp>
            <UiCheckbox v-model="enableItalic" class="flex-1" />
          </UiProp>

          <!-- Cache Mode -->
          <UiProp>
            <UiSelect v-model="cacheMode" :options="cacheModeOptions" class="flex-1" />
          </UiProp>

          <!-- Enable Underline -->
          <UiProp>
            <UiCheckbox v-model="enableUnderline" class="flex-1" />
          </UiProp>

          <!-- Blend -->
          <UiProp name="Blend" foldable>
            <template #child>
              <UiProp :indent="1">
                <UiSelect v-model="srcBlend" :options="blendOptions" class="flex-1" />
              </UiProp>
              <UiProp :indent="1">
                <UiSelect v-model="dstBlend" :options="blendOptions" class="flex-1" />
              </UiProp>
            </template>
          </UiProp>

          <!-- Materials -->
          <UiProp name="Materials" foldable :indent="0">
            <UiNumInput :model-value="1" class="flex-1" />
            <template #child>
              <UiProp :indent="1" style="padding-top: 8px;">
                <UiAsset type="cc.Material" class="flex-1" />
              </UiProp>
            </template>
          </UiProp>
        </UiSection>

        <!-- 添加组件按钮 -->
        <div class="add-component-wrapper">
          <UiButton style="width: 240px;">添加组件</UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#view {
  height: 100vh;
  width: 100%;
}

.fit {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.header-bar {
  flex: 0 0 auto;
  padding-bottom: 2px;
  margin: 5px 10px 3px;
  overflow: hidden;
}

.props {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 10px;
}

.header {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  flex: 1;
}

.header span[draggable="true"] {
  cursor: grab;
}

.add-component-wrapper {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

