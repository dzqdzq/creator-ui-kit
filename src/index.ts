/**
 * UI Kit 主入口
 * 自动注册所有 Web Components 并导出工具函数
 */

import { preloadElementStyles } from "./utils/css-loader";

// 元素名称列表
const ELEMENT_NAMES = [
  "button",
  "checkbox",
  "input",
  "select",
  "progress",
  "box-container",
  "color",
  "color-picker",
  "hint",
  "loader",
  "num-input",
  "prop",
  "prop-table",
  "section",
  "slider",
  "splitter",
  "text-area",
];

// 预加载所有样式
preloadElementStyles(ELEMENT_NAMES, "default");

// 导入所有元素以注册 Custom Elements（副作用导入）
import "./elements/button";
import "./elements/checkbox";
import "./elements/input";
import "./elements/select";
import "./elements/progress";
import "./elements/box-container";
import "./elements/color";
import "./elements/color-picker";
import "./elements/hint";
import "./elements/loader";
import "./elements/num-input";
import "./elements/prop";
import "./elements/prop-table";
import "./elements/section";
import "./elements/slider";
import "./elements/splitter";
import "./elements/text-area";

// 导出工具函数
export { default as utils } from "./utils/utils";
export * as domUtils from "./utils/dom-utils";
export { default as focusMgr } from "./utils/focus-mgr";
export { default as cssLoader } from "./utils/css-loader";
