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
export * as domUtils from "./utils/dom-utils.js";
export { default as focusMgr } from "./utils/focus-mgr.js";
export { default as cssLoader } from "./utils/css-loader.js";