/**
 * Cocos Creator 组件 - Vue 3 版本
 *
 * 这些组件是从原始的 Vue 2 全局组件改造而来
 * 使用 Vue 3 Composition API + <script setup> 语法
 */

// 基础组件
export { default as CcBlockInputEvents } from './CcBlockInputEvents.vue';
export { default as CcSafeArea } from './CcSafeArea.vue';
export { default as CcMissingScript } from './CcMissingScript.vue';
export { default as CcTiledLayer } from './CcTiledLayer.vue';

// 渲染组件
export { default as CcSprite } from './CcSprite.vue';
export { default as CcLabel } from './CcLabel.vue';
export { default as CcRichText } from './CcRichText.vue';
export { default as CcMask } from './CcMask.vue';

// UI 组件
export { default as CcButton } from './CcButton.vue';
export { default as CcToggle } from './CcToggle.vue';
export { default as CcEditBox } from './CcEditBox.vue';
export { default as CcScrollView } from './CcScrollView.vue';
export { default as CcPageView } from './CcPageView.vue';

// 布局组件
export { default as CcLayout } from './CcLayout.vue';
export { default as CcWidget } from './CcWidget.vue';

// 动画/特效组件
export { default as CcSkeletonAnimation } from './CcSkeletonAnimation.vue';
export { default as CcSkeleton2d } from './CcSkeleton2d.vue';
export { default as CcParticleSystem } from './CcParticleSystem.vue';

// 媒体组件
export { default as CcVideoPlayer } from './CcVideoPlayer.vue';

// 相机/光照组件
export { default as CcCamera } from './CcCamera.vue';
export { default as CcLight } from './CcLight.vue';

// 物理组件
export { default as CcPhysicsJoint } from './CcPhysicsJoint.vue';
export { default as CcPointsBaseCollider } from './CcPointsBaseCollider.vue';

// 类型导出
export * from './types';

// Editor 导出
export { Editor } from './editor';

// Vue 插件导出
export { CcPlugin, registerComponent, registerComponents } from './plugin';
export type { ComponentName } from './plugin';
