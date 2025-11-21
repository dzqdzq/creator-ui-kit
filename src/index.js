// UI-Kit 入口文件
import { preloadElementStyles } from "./utils/css-loader.js";

// 使用 themes 目录下的样式
async function initStyles() {
  try {
    // 预加载所有元素的样式（包括已导入和未导入的元素）
    const allElements = [
      'button', 'checkbox', 'input', 'select', 'progress',
      'box-container', 'color', 'color-picker', 'hint', 'loader',
      'markdown', 'num-input', 'prop', 'prop-table', 'section',
      'slider', 'splitter', 'text-area'
    ];
    await preloadElementStyles(allElements, 'default');
    
    // 调试：检查样式是否已加载
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const { getElementStyleSync } = await import("./utils/css-loader.js");
      console.log('样式已预加载:', {
        button: !!getElementStyleSync('button'),
        checkbox: !!getElementStyleSync('checkbox'),
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
export { default as domUtils } from "./utils/dom-utils.js";
export { default as focusMgr } from "./utils/focus-mgr.js";
export { default as cssLoader } from "./utils/css-loader.js";