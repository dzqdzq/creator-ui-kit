/**
 * UI Elements 单独入口
 * 允许用户只导入 Web Components 部分，不含 Vue 组件
 */

// 导入所有 UI 元素（会自动注册为 Custom Elements）
export * from "./elements/button";
export * from "./elements/checkbox";
export * from "./elements/input";
export * from "./elements/select";
export * from "./elements/progress";
export * from "./elements/box-container";
export * from "./elements/color";
export * from "./elements/color-picker";
export * from "./elements/hint";
export * from "./elements/loader";
export * from "./elements/num-input";
export * from "./elements/prop";
export * from "./elements/prop-table";
export * from "./elements/section";
export * from "./elements/slider";
export * from "./elements/splitter";
export * from "./elements/text-area";

// 导出工具函数
export { default as utils } from "./utils/utils";
export * as domUtils from "./utils/dom-utils";
export { default as focusMgr } from "./utils/focus-mgr";
export { default as cssLoader } from "./utils/css-loader";

