// 简化的焦点管理器
import domUtils from "./dom-utils.js";

let focusedElement = null;
let lastFocusedElement = null;

const focusMgr = {
  _setFocusElement(el) {
    // 添加调试日志
    if (el && (typeof el.getAttribute !== "function" || !(el instanceof HTMLElement))) {
      console.error("[focus-mgr._setFocusElement] Invalid element:", {
        el,
        type: typeof el,
        isHTMLElement: el instanceof HTMLElement,
        hasGetAttribute: typeof el?.getAttribute,
        hasSetFocused: typeof el?._setFocused,
        constructor: el?.constructor?.name,
        prototype: Object.getPrototypeOf(el)?.constructor?.name,
        currentFocusedElement: focusedElement,
      });
    }

    if (focusedElement !== el) {
      if (focusedElement) {
        try {
          if (typeof focusedElement._setFocused === "function") {
            focusedElement._setFocused(false);
          } else {
            console.warn("[focus-mgr._setFocusElement] focusedElement._setFocused is not a function:", focusedElement);
          }
        } catch (error) {
          console.error("[focus-mgr._setFocusElement] Error calling _setFocused(false) on focusedElement:", error, "focusedElement:", focusedElement);
        }
      }
      lastFocusedElement = focusedElement;
      focusedElement = el;
      if (el) {
        try {
          if (typeof el._setFocused === "function") {
            el._setFocused(true);
          } else {
            console.warn("[focus-mgr._setFocusElement] el._setFocused is not a function:", el);
          }
        } catch (error) {
          console.error("[focus-mgr._setFocusElement] Error calling _setFocused(true) on el:", error, "el:", el);
          throw error;
        }
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
