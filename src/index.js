// UI-Kit 入口文件
import resourceMgr from "./utils/resource-mgr.js";
import { loadElementStyle, preloadStyles } from "./utils/theme-loader.js";

// 使用 themes 目录下的样式
async function initStyles() {
  try {
    // 预加载所有元素的样式
    await preloadStyles(['button', 'checkbox', 'input', 'select', 'progress'], 'default');
    
    // 注册样式
    resourceMgr.registerStyle("button", await loadElementStyle('button', 'default'));
    resourceMgr.registerStyle("checkbox", await loadElementStyle('checkbox', 'default'));
    resourceMgr.registerStyle("input", await loadElementStyle('input', 'default'));
    resourceMgr.registerStyle("select", await loadElementStyle('select', 'default'));
    resourceMgr.registerStyle("progress", await loadElementStyle('progress', 'default'));
    
    // 调试：检查样式是否已注册
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('样式已注册:', {
        button: !!resourceMgr.getResource("theme://elements/button.css"),
        checkbox: !!resourceMgr.getResource("theme://elements/checkbox.css"),
      });
    }
  } catch (error) {
    console.error('Failed to load theme styles:', error);
  }
}

// 初始化样式，然后导入元素
await initStyles();

// 导入并注册所有元素
import "./elements/button.js";
import "./elements/checkbox.js";
import "./elements/input.js";
import "./elements/select.js";
import "./elements/progress.js";

// 导出主要 API
export { default as utils } from "./utils/utils.js";
export { default as resourceMgr } from "./utils/resource-mgr.js";
export { default as domUtils } from "./utils/dom-utils.js";
export { default as focusMgr } from "./utils/focus-mgr.js";