import { preloadElementStyles } from "./utils/css-loader.js";

const ELEMENT_NAMES = [
  'button', 'checkbox', 'input', 'select', 'progress',
  'box-container', 'color', 'color-picker', 'hint', 'loader',
  'markdown', 'num-input', 'prop', 'prop-table', 'section',
  'slider', 'splitter', 'text-area'
];

async function initStyles() {
  try {
    await preloadElementStyles(ELEMENT_NAMES, 'default');
    
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

await initStyles();

import "./elements/button.js";
import "./elements/checkbox.js";
import "./elements/input.js";
import "./elements/select.js";
import "./elements/progress.js";

export { default as utils } from "./utils/utils.js";
export { default as domUtils } from "./utils/dom-utils.js";
export { default as focusMgr } from "./utils/focus-mgr.js";
export { default as cssLoader } from "./utils/css-loader.js";