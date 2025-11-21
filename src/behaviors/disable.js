import { walk } from "../utils/dom-utils.js";

class DisableBehavior {
  get canBeDisable() {
    return true;
  }

  get disabled() {
    return this.getAttribute("is-disabled") !== null;
  }

  set disabled(disabledValue) {
    if (disabledValue !== this._disabled) {
      this._disabled = disabledValue;

      if (disabledValue) {
        this.setAttribute("disabled", "");
        this._setIsDisabledAttribute(true);

        if (!this._disabledNested) {
          return;
        }

        this._propagateDisable();
      } else {
        this.removeAttribute("disabled");

        if (!this._isDisabledInHierarchy(true)) {
          this._setIsDisabledAttribute(false);

          if (!this._disabledNested) {
            return;
          }

          this._propagateDisable();
        }
      }
    }
  }

  _initDisable(enableNested) {
    this._disabled = this.getAttribute("disabled") !== null;

    if (this._disabled) {
      this._setIsDisabledAttribute(true);
    }

    this._disabledNested = enableNested;
  }

  _propagateDisable() {
    walk(
      this,
      { excludeSelf: true },
      (childElement) =>
        !!childElement.canBeDisable &&
        (!!childElement._disabled ||
          (childElement._setIsDisabledAttribute(this._disabled),
          !childElement._disabledNested))
    );
  }

  _isDisabledInHierarchy(excludeSelf) {
    if (!excludeSelf && this.disabled) {
      return true;
    }
    let parentNode = this.parentNode;

    while (parentNode) {
      if (parentNode.disabled) {
        return true;
      }
      parentNode = parentNode.parentNode;
    }

    return false;
  }

  _isDisabledSelf() {
    return this._disabled;
  }

  _setIsDisabledAttribute(isDisabled) {
    if (isDisabled) {
      this.setAttribute("is-disabled", "");
    } else {
      this.removeAttribute("is-disabled");
    }
  }
}

const behaviorPrototype = DisableBehavior.prototype;

// 获取 getter 描述符的辅助函数
function getGetter(prototype, name) {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
  if (descriptor && descriptor.get) {
    return descriptor.get;
  }
  console.warn(`[disable] getter '${name}' not found in prototype`);
  return null;
}

function getSetter(prototype, name) {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
  if (descriptor && descriptor.set) {
    return descriptor.set;
  }
  console.warn(`[disable] setter '${name}' not found in prototype`);
  return null;
}

export default {
  get canBeDisable() {
    const getter = getGetter(behaviorPrototype, "canBeDisable");
    if (!getter) {
      console.error("[disable] canBeDisable getter not found, this:", this, "type:", typeof this);
      return true; // 默认值
    }
    try {
      return getter.call(this);
    } catch (error) {
      console.error("[disable] Error calling canBeDisable getter:", error, "this:", this);
      throw error;
    }
  },
  get disabled() {
    const getter = getGetter(behaviorPrototype, "disabled");
    if (!getter) {
      console.error("[disable] disabled getter not found, this:", this, "type:", typeof this);
      return false; // 默认值
    }
    try {
      if (!this || typeof this.getAttribute !== "function") {
        console.error("[disable] Invalid this context in disabled getter:", {
          this,
          type: typeof this,
          isHTMLElement: this instanceof HTMLElement,
          hasGetAttribute: typeof this?.getAttribute,
        });
        throw new TypeError("this.getAttribute is not a function in disabled getter.");
      }
      return getter.call(this);
    } catch (error) {
      console.error("[disable] Error calling disabled getter:", error, "this:", this);
      throw error;
    }
  },
  set disabled(value) {
    const setter = getSetter(behaviorPrototype, "disabled");
    if (!setter) {
      console.error("[disable] disabled setter not found, this:", this);
      return;
    }
    try {
      setter.call(this, value);
    } catch (error) {
      console.error("[disable] Error calling disabled setter:", error, "this:", this);
      throw error;
    }
  },
  _initDisable: behaviorPrototype._initDisable,
  _propagateDisable: behaviorPrototype._propagateDisable,
  _propgateDisable: behaviorPrototype._propagateDisable,
  _isDisabledInHierarchy: behaviorPrototype._isDisabledInHierarchy,
  _isDisabledSelf: behaviorPrototype._isDisabledSelf,
  _setIsDisabledAttribute: behaviorPrototype._setIsDisabledAttribute,
};
