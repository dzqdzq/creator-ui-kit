/**
 * Vue 3 插件 - 一键注册所有 Cocos Creator 组件
 * 
 * 使用方式:
 * ```ts
 * import { createApp } from 'vue'
 * import { CcPlugin } from '@aspect/creator-ui-kit/vue'
 * 
 * const app = createApp(App)
 * app.use(CcPlugin)
 * ```
 */

import type { App, Plugin, Component } from 'vue'

// 导入所有组件
import CcBlockInputEvents from './CcBlockInputEvents.vue'
import CcSafeArea from './CcSafeArea.vue'
import CcMissingScript from './CcMissingScript.vue'
import CcTiledLayer from './CcTiledLayer.vue'
import CcSprite from './CcSprite.vue'
import CcLabel from './CcLabel.vue'
import CcRichText from './CcRichText.vue'
import CcMask from './CcMask.vue'
import CcButton from './CcButton.vue'
import CcToggle from './CcToggle.vue'
import CcEditBox from './CcEditBox.vue'
import CcScrollView from './CcScrollView.vue'
import CcPageView from './CcPageView.vue'
import CcLayout from './CcLayout.vue'
import CcWidget from './CcWidget.vue'
import CcSkeletonAnimation from './CcSkeletonAnimation.vue'
import CcSkeleton2d from './CcSkeleton2d.vue'
import CcParticleSystem from './CcParticleSystem.vue'
import CcVideoPlayer from './CcVideoPlayer.vue'
import CcCamera from './CcCamera.vue'
import CcLight from './CcLight.vue'
import CcPhysicsJoint from './CcPhysicsJoint.vue'
import CcPointsBaseCollider from './CcPointsBaseCollider.vue'

// 组件名称类型
export type ComponentName = 
  | 'CcBlockInputEvents'
  | 'CcSafeArea'
  | 'CcMissingScript'
  | 'CcTiledLayer'
  | 'CcSprite'
  | 'CcLabel'
  | 'CcRichText'
  | 'CcMask'
  | 'CcButton'
  | 'CcToggle'
  | 'CcEditBox'
  | 'CcScrollView'
  | 'CcPageView'
  | 'CcLayout'
  | 'CcWidget'
  | 'CcSkeletonAnimation'
  | 'CcSkeleton2d'
  | 'CcParticleSystem'
  | 'CcVideoPlayer'
  | 'CcCamera'
  | 'CcLight'
  | 'CcPhysicsJoint'
  | 'CcPointsBaseCollider'

// 组件映射（使用显式类型避免类型推断问题）
const components: Record<ComponentName, Component> = {
  CcBlockInputEvents,
  CcSafeArea,
  CcMissingScript,
  CcTiledLayer,
  CcSprite,
  CcLabel,
  CcRichText,
  CcMask,
  CcButton,
  CcToggle,
  CcEditBox,
  CcScrollView,
  CcPageView,
  CcLayout,
  CcWidget,
  CcSkeletonAnimation,
  CcSkeleton2d,
  CcParticleSystem,
  CcVideoPlayer,
  CcCamera,
  CcLight,
  CcPhysicsJoint,
  CcPointsBaseCollider,
}

/**
 * 安装所有 Cocos Creator 组件
 */
export const CcPlugin: Plugin = {
  install(app: App) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component)
    }
  }
}

/**
 * 注册单个组件
 */
export function registerComponent(app: App, name: ComponentName) {
  app.component(name, components[name])
}

/**
 * 注册多个组件
 */
export function registerComponents(app: App, names: ComponentName[]) {
  for (const name of names) {
    app.component(name, components[name])
  }
}

export default CcPlugin

