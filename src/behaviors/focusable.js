import domUtils from "../utils/dom-utils";

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
    if (this.focused !== focusedValue) {
      if (focusedValue) {
        this.setAttribute("focused", "");

        if (this._focusELs.length > 0) {
          let firstFocusElement = this._focusELs[0];

          if (firstFocusElement === this) {
            firstFocusElement.focus();
          } else if (firstFocusElement.focusable) {
            firstFocusElement._setFocused(true);
          } else {
            firstFocusElement.focus();
          }
        }
      } else {
        this.removeAttribute("focused");

        this._focusELs.forEach((focusElement) => {
          if (focusElement.focusable && focusElement.focused) {
            focusElement._setFocused(false);
          }
        });
      }
      domUtils.fire(this, "focus-changed", {
        bubbles: true,
        detail: { focused: this.focused },
      });
    }
  }
}

// 导出类的实例方法和属性，以便混入到元素原型
const behaviorPrototype = FocusableBehavior.prototype;
export default {
  get focusable() {
    return behaviorPrototype.focusable.get.call(this);
  },
  get focused() {
    return behaviorPrototype.focused.get.call(this);
  },
  get unnavigable() {
    return behaviorPrototype.unnavigable.get.call(this);
  },
  set unnavigable(value) {
    behaviorPrototype.unnavigable.set.call(this, value);
  },
  _initFocusable: behaviorPrototype._initFocusable,
  _getFirstFocusableElement: behaviorPrototype._getFirstFocusableElement,
  _setFocused: behaviorPrototype._setFocused,
};
