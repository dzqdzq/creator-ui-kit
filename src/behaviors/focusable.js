import { fire } from "../utils/dom-utils.js";

class FocusableBehavior {
  get focusable() {
    return true;
  }

  get focused() {
    return this.getAttribute("focused") !== null;
  }

  get unnavigable() {
    return this.getAttribute("unnavigable") !== null;
  }

  set unnavigable(unnavigableValue) {
    if (unnavigableValue) {
      this.setAttribute("unnavigable", "");
    } else {
      this.removeAttribute("unnavigable");
    }
  }

  _initFocusable(focusElements, navigationElements) {
    if (focusElements) {
      if (Array.isArray(focusElements)) {
        this._focusELs = focusElements;
      } else {
        this._focusELs = [focusElements];
      }
    } else {
      this._focusELs = [];
    }

    if (navigationElements) {
      if (Array.isArray(navigationElements)) {
        this._navELs = navigationElements;
      } else {
        this._navELs = [navigationElements];
      }
    } else {
      this._navELs = this._focusELs;
    }

    requestAnimationFrame(() => {
      this.tabIndex = -1;

      for (let focusElement of this._focusELs) {
        focusElement.tabIndex = -1;

        focusElement.addEventListener("focus", () => {
          this._curFocus = focusElement;
        });
      }
    });
  }

  _getFirstFocusableElement() {
    return this._focusELs.length > 0 ? this._focusELs[0] : null;
  }

  _setFocused(focusedValue) {
    // 添加调试日志
    if (!this || typeof this.getAttribute !== "function") {
      console.error("[focusable._setFocused] Invalid this context:", {
        this,
        type: typeof this,
        isHTMLElement: this instanceof HTMLElement,
        hasGetAttribute: typeof this?.getAttribute,
        hasSetAttribute: typeof this?.setAttribute,
        constructor: this?.constructor?.name,
        prototype: Object.getPrototypeOf(this)?.constructor?.name,
        focusedValue,
      });
      throw new TypeError("this.getAttribute is not a function in _setFocused. this is not a valid HTMLElement.");
    }

    try {
      const currentFocused = this.focused;
      if (currentFocused !== focusedValue) {
        if (focusedValue) {
          this.setAttribute("focused", "");

          if (this._focusELs && this._focusELs.length > 0) {
            let firstFocusElement = this._focusELs[0];

            if (firstFocusElement === this) {
              firstFocusElement.focus();
            } else if (firstFocusElement && firstFocusElement.focusable) {
              firstFocusElement._setFocused(true);
            } else if (firstFocusElement) {
              firstFocusElement.focus();
            }
          }
        } else {
          this.removeAttribute("focused");

          if (this._focusELs) {
            this._focusELs.forEach((focusElement) => {
              if (focusElement && focusElement.focusable && focusElement.focused) {
                focusElement._setFocused(false);
              }
            });
          }
        }
        fire(this, "focus-changed", {
          bubbles: true,
          detail: { focused: this.focused },
        });
      }
    } catch (error) {
      console.error("[focusable._setFocused] Error:", error, "this:", this, "focusedValue:", focusedValue);
      throw error;
    }
  }
}

const behaviorPrototype = FocusableBehavior.prototype;

// 获取 getter 描述符的辅助函数
function getGetter(prototype, name) {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
  if (descriptor && descriptor.get) {
    return descriptor.get;
  }
  return null;
}

function getSetter(prototype, name) {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
  if (descriptor && descriptor.set) {
    return descriptor.set;
  }
  return null;
}

export default {
  get focusable() {
    const getter = getGetter(behaviorPrototype, "focusable");
    if (!getter) {
      console.error("[focusable] focusable getter not found, this:", this, "type:", typeof this);
      return true; // 默认值
    }
    try {
      return getter.call(this);
    } catch (error) {
      console.error("[focusable] Error calling focusable getter:", error, "this:", this, "has getAttribute:", typeof this.getAttribute);
      throw error;
    }
  },
  get focused() {
    const getter = getGetter(behaviorPrototype, "focused");
    if (!getter) {
      console.error("[focusable] focused getter not found, this:", this, "type:", typeof this);
      return false; // 默认值
    }
    try {
      // 添加调试日志
      if (!this || typeof this.getAttribute !== "function") {
        console.error("[focusable] Invalid this context:", {
          this,
          type: typeof this,
          isHTMLElement: this instanceof HTMLElement,
          hasGetAttribute: typeof this?.getAttribute,
          constructor: this?.constructor?.name,
          prototype: Object.getPrototypeOf(this)?.constructor?.name,
        });
        throw new TypeError("this.getAttribute is not a function. this is not a valid HTMLElement.");
      }
      return getter.call(this);
    } catch (error) {
      console.error("[focusable] Error calling focused getter:", error, "this:", this, "has getAttribute:", typeof this.getAttribute);
      throw error;
    }
  },
  get unnavigable() {
    const getter = getGetter(behaviorPrototype, "unnavigable");
    if (!getter) {
      console.error("[focusable] unnavigable getter not found, this:", this, "type:", typeof this);
      return false; // 默认值
    }
    try {
      return getter.call(this);
    } catch (error) {
      console.error("[focusable] Error calling unnavigable getter:", error, "this:", this, "has getAttribute:", typeof this.getAttribute);
      throw error;
    }
  },
  set unnavigable(value) {
    const setter = getSetter(behaviorPrototype, "unnavigable");
    if (!setter) {
      console.error("[focusable] unnavigable setter not found, this:", this, "type:", typeof this);
      return;
    }
    try {
      setter.call(this, value);
    } catch (error) {
      console.error("[focusable] Error calling unnavigable setter:", error, "this:", this);
      throw error;
    }
  },
  _initFocusable: behaviorPrototype._initFocusable,
  _getFirstFocusableElement: behaviorPrototype._getFirstFocusableElement,
  _setFocused: behaviorPrototype._setFocused,
};
