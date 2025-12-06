/**
 * UI Elements 单独入口
 * 允许用户只导入 Web Components 部分，不含 Vue 组件
 */

// 导入所有 UI 元素（会自动注册为 Custom Elements）
export * from "./elements/button.js";
export * from "./elements/checkbox.js";
export * from "./elements/input.js";
export * from "./elements/select.js";
export * from "./elements/progress.js";
export * from "./elements/box-container.js";
export * from "./elements/color.js";
export * from "./elements/color-picker.js";
export * from "./elements/hint.js";
export * from "./elements/loader.js";
export * from "./elements/num-input.js";
export * from "./elements/prop.js";
export * from "./elements/prop-table.js";
export * from "./elements/section.js";
export * from "./elements/slider.js";
export * from "./elements/splitter.js";
export * from "./elements/text-area.js";

// 导出工具函数
export { default as utils } from "./utils/utils.js";
export * as domUtils from "./utils/dom-utils.js";
export { default as focusMgr } from "./utils/focus-mgr.js";
export { default as cssLoader } from "./utils/css-loader.js";

