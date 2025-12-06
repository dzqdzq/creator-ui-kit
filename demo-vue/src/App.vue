<script setup lang="ts">
/**
 * 节点属性面板演示
 * 使用 @aspect/creator-ui-kit 库的方式
 * 
 * UI 组件直接使用 Web Components（ui-xxx 标签）
 * 无需额外导入，由库自动注册
 */
import { ref } from 'vue'

// ============================================
// Node 属性数据
// ============================================
const nodeActive = ref(true)
const nodeName = ref('label')
const position = ref({ x: 0, y: -180 })
const rotation = ref(0)
const scale = ref({ x: 1, y: 1 })
const anchor = ref({ x: 0.5, y: 0.5 })
const size = ref({ w: 342.33, h: 75.6 })
const nodeColor = ref([255, 255, 255, 255]) // RGBA 格式
const opacity = ref(255)
const skew = ref({ x: 0, y: 0 })
const group = ref('default')

// ============================================
// Label 属性数据
// ============================================
const labelActive = ref(true)
const labelText = ref('Hello, World!')
const horizontalAlign = ref(1) // CENTER
const verticalAlign = ref(1) // CENTER
const fontSize = ref(60)
const lineHeight = ref(60)
const overflow = ref(0) // NONE
const font = ref('')
const fontFamily = ref('Arial')
const enableBold = ref(false)
const enableItalic = ref(false)
const enableUnderline = ref(false)
const cacheMode = ref(0) // NONE
const useSystemFont = ref(true)

// ============================================
// Sprite 属性数据
// ============================================
const spriteActive = ref(true)
const spriteFrame = ref('')
const spriteType = ref(0) // SIMPLE
const sizeMode = ref(0) // CUSTOM
const trim = ref(true)
const grayscale = ref(false)

// ============================================
// Widget 属性数据
// ============================================
const widgetActive = ref(true)
const isAlignTop = ref(true)
const isAlignBottom = ref(false)
const isAlignLeft = ref(true)
const isAlignRight = ref(false)
const alignTop = ref(0)
const alignBottom = ref(0)
const alignLeft = ref(0)
const alignRight = ref(0)
const alignMode = ref(1) // ON_WINDOW_RESIZE

// ============================================
// 下拉选项配置
// ============================================
const groupOptions = ['default', 'ui', 'game', 'effect']
const hAlignOptions = ['LEFT', 'CENTER', 'RIGHT']
const vAlignOptions = ['TOP', 'CENTER', 'BOTTOM']
const overflowOptions = ['NONE', 'CLAMP', 'SHRINK', 'RESIZE_HEIGHT']
const cacheModeOptions = ['NONE', 'BITMAP', 'CHAR']
const spriteTypeOptions = ['SIMPLE', 'SLICED', 'TILED', 'FILLED']
const sizeModeOptions = ['CUSTOM', 'TRIMMED', 'RAW']
const alignModeOptions = ['ONCE', 'ON_WINDOW_RESIZE', 'ALWAYS']
const blendOptions = ['ZERO', 'ONE', 'SRC_COLOR', 'ONE_MINUS_SRC_COLOR', 'SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA']

// Blend 数据
const srcBlendFactor = ref(4) // SRC_ALPHA
const dstBlendFactor = ref(5) // ONE_MINUS_SRC_ALPHA

// Materials 数据
const materialsCount = ref(1)
const material0 = ref('builtin-2d-sprite')

// ============================================
// Section 折叠状态
// ============================================
const nodeExpanded = ref(true)
const labelExpanded = ref(true)
const spriteExpanded = ref(false)
const widgetExpanded = ref(false)

// 切换折叠
function toggleSection(section: string) {
  switch (section) {
    case 'node': nodeExpanded.value = !nodeExpanded.value; break
    case 'label': labelExpanded.value = !labelExpanded.value; break
    case 'sprite': spriteExpanded.value = !spriteExpanded.value; break
    case 'widget': widgetExpanded.value = !widgetExpanded.value; break
  }
}

// 编辑 Group
function editGroup() {
  console.log('编辑分组...')
}
</script>

<template>
  <div id="inspector" class="inspector-panel">
    <!-- ========================================== -->
    <!-- 顶部标题栏：节点名称 -->
    <!-- ========================================== -->
    <div class="inspector-header">
      <ui-checkbox 
        :value="nodeActive" 
        @change="nodeActive = ($event as CustomEvent).detail.value"
        tooltip="该节点是否处于激活状态"
      ></ui-checkbox>
      <ui-input 
        :value="nodeName"
        @change="nodeName = ($event as CustomEvent).detail.value"
        class="node-name-input"
        tooltip="节点在场景和层级中的名称"
        placeholder="Node Name"
      ></ui-input>
      <ui-button class="btn-3d" transparent>3D</ui-button>
    </div>

    <!-- ========================================== -->
    <!-- 属性面板内容区 -->
    <!-- ========================================== -->
    <div class="inspector-content">
      
      <!-- ====== Node Section ====== -->
      <ui-section :folded="!nodeExpanded">
        <div slot="header" class="section-header">
          <span class="section-title" @click="toggleSection('node')">Node</span>
          <span class="flex-1"></span>
          <ui-button transparent class="btn-icon" tooltip="设置">⚙</ui-button>
        </div>

        <!-- Position -->
        <ui-prop name="Position" tooltip="相对父节点的位置坐标，以像素为单位">
          <span class="axis-label">X</span>
          <ui-num-input 
            :value="position.x" 
            @change="position.x = ($event as CustomEvent).detail.value"
            class="flex-1"
          ></ui-num-input>
          <span class="axis-label">Y</span>
          <ui-num-input 
            :value="position.y" 
            @change="position.y = ($event as CustomEvent).detail.value"
            class="flex-1"
          ></ui-num-input>
        </ui-prop>

        <!-- Rotation -->
        <ui-prop name="Rotation" tooltip="相对父节点的旋转，以度为单位">
          <ui-num-input 
            :value="rotation" 
            @change="rotation = ($event as CustomEvent).detail.value"
            class="flex-1"
          ></ui-num-input>
        </ui-prop>

        <!-- Scale -->
        <ui-prop name="Scale" tooltip="节点的整体缩放比例">
          <span class="axis-label">X</span>
          <ui-num-input 
            :value="scale.x" 
            @change="scale.x = ($event as CustomEvent).detail.value"
            class="flex-1"
          ></ui-num-input>
          <span class="axis-label">Y</span>
          <ui-num-input 
            :value="scale.y" 
            @change="scale.y = ($event as CustomEvent).detail.value"
            class="flex-1"
          ></ui-num-input>
        </ui-prop>

        <!-- Anchor -->
        <ui-prop name="Anchor" tooltip="节点位置和旋转的基准点">
          <span class="axis-label">X</span>
          <ui-num-input 
            :value="anchor.x" 
            @change="anchor.x = ($event as CustomEvent).detail.value"
            :step="0.1"
            class="flex-1"
          ></ui-num-input>
          <span class="axis-label">Y</span>
          <ui-num-input 
            :value="anchor.y" 
            @change="anchor.y = ($event as CustomEvent).detail.value"
            :step="0.1"
            class="flex-1"
          ></ui-num-input>
        </ui-prop>

        <!-- Size -->
        <ui-prop name="Size" tooltip="节点的内容尺寸">
          <span class="axis-label">W</span>
          <ui-num-input 
            :value="size.w" 
            @change="size.w = ($event as CustomEvent).detail.value"
            class="flex-1"
          ></ui-num-input>
          <span class="axis-label">H</span>
          <ui-num-input 
            :value="size.h" 
            @change="size.h = ($event as CustomEvent).detail.value"
            class="flex-1"
          ></ui-num-input>
        </ui-prop>

        <!-- Color -->
        <ui-prop name="Color" tooltip="节点的颜色">
          <ui-color 
            :value="nodeColor" 
            @change="nodeColor = ($event as CustomEvent).detail.value"
            class="flex-1"
          ></ui-color>
        </ui-prop>

        <!-- Opacity -->
        <ui-prop name="Opacity" tooltip="节点的不透明度">
          <ui-num-input 
            :value="opacity" 
            @change="opacity = ($event as CustomEvent).detail.value"
            :min="0"
            :max="255"
            :step="1"
            class="flex-1"
          ></ui-num-input>
        </ui-prop>

        <!-- Skew -->
        <ui-prop name="Skew" tooltip="节点的倾斜角度">
          <span class="axis-label">X</span>
          <ui-num-input 
            :value="skew.x" 
            @change="skew.x = ($event as CustomEvent).detail.value"
            class="flex-1"
          ></ui-num-input>
          <span class="axis-label">Y</span>
          <ui-num-input 
            :value="skew.y" 
            @change="skew.y = ($event as CustomEvent).detail.value"
            class="flex-1"
          ></ui-num-input>
        </ui-prop>

        <!-- Group -->
        <ui-prop name="Group" tooltip="节点的分组">
          <ui-select 
            :value="group"
            @change="group = ($event as CustomEvent).detail.value"
            class="flex-1"
          >
            <option v-for="opt in groupOptions" :key="opt" :value="opt">{{ opt }}</option>
          </ui-select>
          <ui-button class="btn-edit" @click="editGroup">编辑</ui-button>
        </ui-prop>
      </ui-section>

      <!-- ====== Label Section ====== -->
      <ui-section :folded="!labelExpanded">
        <div slot="header" class="section-header">
          <ui-checkbox 
            :value="labelActive" 
            @change="labelActive = ($event as CustomEvent).detail.value"
          ></ui-checkbox>
          <span class="section-title" @click="toggleSection('label')">Label</span>
          <span class="flex-1"></span>
          <ui-button transparent class="btn-icon" tooltip="帮助文档">📖</ui-button>
          <ui-button transparent class="btn-icon" tooltip="设置">⚙</ui-button>
        </div>

        <!-- String (多行文本) -->
        <ui-prop name="String" tooltip="Label 显示的文本内容" auto-height>
          <ui-text-area 
            :value="labelText"
            @change="labelText = ($event as CustomEvent).detail.value"
            class="flex-1"
          ></ui-text-area>
        </ui-prop>

        <!-- Horizontal Align -->
        <ui-prop name="Horizontal Align">
          <ui-select 
            :value="horizontalAlign"
            @change="horizontalAlign = Number(($event as CustomEvent).detail.value)"
            class="flex-1"
          >
            <option v-for="(opt, idx) in hAlignOptions" :key="idx" :value="idx">{{ opt }}</option>
          </ui-select>
        </ui-prop>

        <!-- Vertical Align -->
        <ui-prop name="Vertical Align">
          <ui-select 
            :value="verticalAlign"
            @change="verticalAlign = Number(($event as CustomEvent).detail.value)"
            class="flex-1"
          >
            <option v-for="(opt, idx) in vAlignOptions" :key="idx" :value="idx">{{ opt }}</option>
          </ui-select>
        </ui-prop>

        <!-- Font Size -->
        <ui-prop name="Font Size">
          <ui-num-input 
            :value="fontSize" 
            @change="fontSize = ($event as CustomEvent).detail.value"
            :min="1"
            class="flex-1"
          ></ui-num-input>
        </ui-prop>

        <!-- Line Height -->
        <ui-prop name="Line Height">
          <ui-num-input 
            :value="lineHeight" 
            @change="lineHeight = ($event as CustomEvent).detail.value"
            :min="1"
            class="flex-1"
          ></ui-num-input>
        </ui-prop>

        <!-- Overflow -->
        <ui-prop name="Overflow">
          <ui-select 
            :value="overflow"
            @change="overflow = Number(($event as CustomEvent).detail.value)"
            class="flex-1"
          >
            <option v-for="(opt, idx) in overflowOptions" :key="idx" :value="idx">{{ opt }}</option>
          </ui-select>
        </ui-prop>

        <!-- Font (资源选择) -->
        <ui-prop name="Font" class="asset-prop">
          <div class="asset-field flex-1">
            <span class="asset-type">font</span>
            <span class="asset-icon">↗</span>
            <ui-input 
              :value="font"
              class="flex-1"
              placeholder="None"
              readonly
            ></ui-input>
          </div>
        </ui-prop>

        <!-- Font Family -->
        <ui-prop name="Font Family" :class="{ highlighted: !useSystemFont }">
          <ui-input 
            :value="fontFamily"
            @change="fontFamily = ($event as CustomEvent).detail.value"
            class="flex-1"
            placeholder="Arial"
          ></ui-input>
        </ui-prop>

        <!-- Enable Bold -->
        <ui-prop name="Enable Bold">
          <ui-checkbox 
            :value="enableBold" 
            @change="enableBold = ($event as CustomEvent).detail.value"
          ></ui-checkbox>
        </ui-prop>

        <!-- Enable Italic -->
        <ui-prop name="Enable Italic">
          <ui-checkbox 
            :value="enableItalic" 
            @change="enableItalic = ($event as CustomEvent).detail.value"
          ></ui-checkbox>
        </ui-prop>

        <!-- Enable Underline -->
        <ui-prop name="Enable Underline">
          <ui-checkbox 
            :value="enableUnderline" 
            @change="enableUnderline = ($event as CustomEvent).detail.value"
          ></ui-checkbox>
        </ui-prop>

        <!-- Cache Mode -->
        <ui-prop name="Cache Mode">
          <ui-select 
            :value="cacheMode"
            @change="cacheMode = Number(($event as CustomEvent).detail.value)"
            class="flex-1"
          >
            <option v-for="(opt, idx) in cacheModeOptions" :key="idx" :value="idx">{{ opt }}</option>
          </ui-select>
        </ui-prop>

        <!-- Use System Font -->
        <ui-prop name="Use System Font">
          <ui-checkbox 
            :value="useSystemFont" 
            @change="useSystemFont = ($event as CustomEvent).detail.value"
          ></ui-checkbox>
        </ui-prop>
      </ui-section>

      <!-- ====== Sprite Section ====== -->
      <ui-section :folded="!spriteExpanded">
        <div slot="header" class="section-header">
          <ui-checkbox 
            :value="spriteActive" 
            @change="spriteActive = ($event as CustomEvent).detail.value"
          ></ui-checkbox>
          <span class="section-title" @click="toggleSection('sprite')">Sprite</span>
          <span class="flex-1"></span>
          <ui-button transparent class="btn-icon" tooltip="帮助文档">📖</ui-button>
          <ui-button transparent class="btn-icon" tooltip="设置">⚙</ui-button>
        </div>

        <!-- Sprite Frame -->
        <ui-prop name="Sprite Frame" class="asset-prop">
          <div class="asset-field flex-1">
            <span class="asset-type">spriteFrame</span>
            <span class="asset-icon">↗</span>
            <ui-input 
              :value="spriteFrame"
              class="flex-1"
              placeholder="None"
              readonly
            ></ui-input>
          </div>
        </ui-prop>

        <!-- Type -->
        <ui-prop name="Type">
          <ui-select 
            :value="spriteType"
            @change="spriteType = Number(($event as CustomEvent).detail.value)"
            class="flex-1"
          >
            <option v-for="(opt, idx) in spriteTypeOptions" :key="idx" :value="idx">{{ opt }}</option>
          </ui-select>
        </ui-prop>

        <!-- Size Mode -->
        <ui-prop name="Size Mode">
          <ui-select 
            :value="sizeMode"
            @change="sizeMode = Number(($event as CustomEvent).detail.value)"
            class="flex-1"
          >
            <option v-for="(opt, idx) in sizeModeOptions" :key="idx" :value="idx">{{ opt }}</option>
          </ui-select>
        </ui-prop>

        <!-- Trim -->
        <ui-prop name="Trim">
          <ui-checkbox 
            :value="trim" 
            @change="trim = ($event as CustomEvent).detail.value"
          ></ui-checkbox>
        </ui-prop>

        <!-- Grayscale -->
        <ui-prop name="Grayscale">
          <ui-checkbox 
            :value="grayscale" 
            @change="grayscale = ($event as CustomEvent).detail.value"
          ></ui-checkbox>
        </ui-prop>

        <!-- Blend -->
        <ui-prop name="Src Blend Factor">
          <ui-select 
            :value="srcBlendFactor"
            @change="srcBlendFactor = Number(($event as CustomEvent).detail.value)"
            class="flex-1"
          >
            <option v-for="(opt, idx) in blendOptions" :key="idx" :value="idx">{{ opt }}</option>
          </ui-select>
        </ui-prop>

        <ui-prop name="Dst Blend Factor">
          <ui-select 
            :value="dstBlendFactor"
            @change="dstBlendFactor = Number(($event as CustomEvent).detail.value)"
            class="flex-1"
          >
            <option v-for="(opt, idx) in blendOptions" :key="idx" :value="idx">{{ opt }}</option>
          </ui-select>
        </ui-prop>

        <!-- Materials -->
        <ui-prop name="Material" class="asset-prop">
          <div class="asset-field flex-1">
            <span class="asset-type">material</span>
            <span class="asset-icon">↗</span>
            <ui-input 
              :value="material0"
              class="flex-1"
              readonly
            ></ui-input>
          </div>
        </ui-prop>
      </ui-section>

      <!-- ====== Widget Section ====== -->
      <ui-section :folded="!widgetExpanded">
        <div slot="header" class="section-header">
          <ui-checkbox 
            :value="widgetActive" 
            @change="widgetActive = ($event as CustomEvent).detail.value"
          ></ui-checkbox>
          <span class="section-title" @click="toggleSection('widget')">Widget</span>
          <span class="flex-1"></span>
          <ui-button transparent class="btn-icon" tooltip="帮助文档">📖</ui-button>
          <ui-button transparent class="btn-icon" tooltip="设置">⚙</ui-button>
        </div>

        <!-- Top -->
        <ui-prop name="Top">
          <ui-checkbox 
            :value="isAlignTop" 
            @change="isAlignTop = ($event as CustomEvent).detail.value"
            class="widget-checkbox"
          ></ui-checkbox>
          <ui-num-input 
            :value="alignTop" 
            @change="alignTop = ($event as CustomEvent).detail.value"
            :disabled="!isAlignTop"
            class="flex-1"
          ></ui-num-input>
        </ui-prop>

        <!-- Bottom -->
        <ui-prop name="Bottom">
          <ui-checkbox 
            :value="isAlignBottom" 
            @change="isAlignBottom = ($event as CustomEvent).detail.value"
            class="widget-checkbox"
          ></ui-checkbox>
          <ui-num-input 
            :value="alignBottom" 
            @change="alignBottom = ($event as CustomEvent).detail.value"
            :disabled="!isAlignBottom"
            class="flex-1"
          ></ui-num-input>
        </ui-prop>

        <!-- Left -->
        <ui-prop name="Left">
          <ui-checkbox 
            :value="isAlignLeft" 
            @change="isAlignLeft = ($event as CustomEvent).detail.value"
            class="widget-checkbox"
          ></ui-checkbox>
          <ui-num-input 
            :value="alignLeft" 
            @change="alignLeft = ($event as CustomEvent).detail.value"
            :disabled="!isAlignLeft"
            class="flex-1"
          ></ui-num-input>
        </ui-prop>

        <!-- Right -->
        <ui-prop name="Right">
          <ui-checkbox 
            :value="isAlignRight" 
            @change="isAlignRight = ($event as CustomEvent).detail.value"
            class="widget-checkbox"
          ></ui-checkbox>
          <ui-num-input 
            :value="alignRight" 
            @change="alignRight = ($event as CustomEvent).detail.value"
            :disabled="!isAlignRight"
            class="flex-1"
          ></ui-num-input>
        </ui-prop>

        <!-- Align Mode -->
        <ui-prop name="Align Mode">
          <ui-select 
            :value="alignMode"
            @change="alignMode = Number(($event as CustomEvent).detail.value)"
            class="flex-1"
          >
            <option v-for="(opt, idx) in alignModeOptions" :key="idx" :value="idx">{{ opt }}</option>
          </ui-select>
        </ui-prop>
      </ui-section>

      <!-- ====== 添加组件按钮 ====== -->
      <div class="add-component-wrapper">
        <ui-button class="btn-add-component">添加组件</ui-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================ */
/* Inspector 面板主容器 */
/* ============================================ */
.inspector-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
  color: #bdbdbd;
  font-size: 12px;
  overflow: hidden;
}

/* ============================================ */
/* 顶部标题栏 */
/* ============================================ */
.inspector-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
  border-bottom: 1px solid #1a1a1a;
  background: rgba(0, 0, 0, 0.1);
}

.node-name-input {
  flex: 1;
}

.btn-3d {
  font-weight: normal !important;
  font-size: 11px !important;
  color: #888 !important;
  min-width: 32px !important;
}

/* ============================================ */
/* 内容区 */
/* ============================================ */
.inspector-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 12px;
}

/* ============================================ */
/* Section 样式 */
/* ============================================ */
.section-header {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.section-title {
  font-weight: 700;
  cursor: pointer;
  user-select: none;
}

.section-title:hover {
  color: #09f;
}

.btn-icon {
  font-size: 14px !important;
  min-width: 24px !important;
  padding: 0 4px !important;
}

/* ============================================ */
/* 属性行样式 */
/* ============================================ */
.axis-label {
  color: #888;
  font-size: 11px;
  min-width: 16px;
  text-align: center;
}

.highlighted {
  color: #fd942b;
}

.widget-checkbox {
  margin-right: 4px;
}

/* ============================================ */
/* 资源字段样式 */
/* ============================================ */
.asset-field {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #262626;
  border: 1px solid #171717;
  border-radius: 3px;
  padding: 2px 6px;
  height: 21px;
}

.asset-type {
  font-size: 10px;
  color: #09f;
  background: rgba(0, 153, 255, 0.15);
  padding: 1px 4px;
  border-radius: 2px;
}

.asset-icon {
  font-size: 10px;
  color: #666;
  cursor: pointer;
}

.asset-icon:hover {
  color: #09f;
}

.asset-field ui-input {
  border: none !important;
  background: transparent !important;
}

/* ============================================ */
/* 按钮样式 */
/* ============================================ */
.btn-edit {
  background: linear-gradient(#4281b6, #4281b6) !important;
  color: #fff !important;
  min-width: 48px !important;
  font-size: 11px !important;
}

.btn-edit:hover {
  background: linear-gradient(#4c8bc0, #4c8bc0) !important;
}

/* ============================================ */
/* 添加组件按钮 */
/* ============================================ */
.add-component-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  margin-top: 10px;
}

.btn-add-component {
  width: 240px;
}

/* ============================================ */
/* 通用工具类 */
/* ============================================ */
.flex-1 {
  flex: 1;
}
</style>
