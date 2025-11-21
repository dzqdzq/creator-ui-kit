// 简化的焦点管理器
import domUtils from "./dom-utils.js";

let focusedElement = null;
let lastFocusedElement = null;

const focusMgr = {
  _setFocusElement(el) {
    if (focusedElement !== el) {
      if (focusedElement) {
        focusedElement._setFocused(false);
      }
      lastFocusedElement = focusedElement;
      focusedElement = el;
      if (el) {
        el._setFocused(true);
      }
    }
  },
  get focusedElement() {
    return focusedElement;
  },
  get lastFocusedElement() {
    return lastFocusedElement;
  },
};

// 全局键盘事件处理
window.addEventListener("mousedown", (e) => {
  if (e.target.tagName && !e.target.tagName.startsWith("UI-")) {
    if (e.which === 1) {
      focusMgr._setFocusElement(null);
    }
  }
});

window.addEventListener(
  "keydown",
  (e) => {
    if (e.keyCode === 9) {
      if (e.ctrlKey || e.metaKey) {
        return;
      }
      domUtils.acceptEvent(e);
      // Tab 键导航可以在这里实现
    }
  },
  true
);

export default focusMgr;
