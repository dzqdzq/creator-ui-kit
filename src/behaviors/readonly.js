import domUtils from "../utils/dom-utils";

class ReadonlyBehavior {
  get canBeReadonly() {
    return true;
  }

  get readonly() {
    // 添加调试日志
    if (!this || typeof this.getAttribute !== "function") {
      const thisValue = this;
      console.error("[ReadonlyBehavior.readonly getter] Invalid this context:", {
        thisValue,
        type: typeof thisValue,
        isHTMLElement: thisValue instanceof HTMLElement,
        hasGetAttribute: typeof thisValue?.getAttribute,
        constructor: thisValue?.constructor?.name,
        prototype: Object.getPrototypeOf(thisValue)?.constructor?.name,
        stack: new Error().stack,
      });
      throw new TypeError("this.getAttribute is not a function in ReadonlyBehavior.readonly getter. this is not a valid HTMLElement.");
    }
    try {
      return this.getAttribute("is-readonly") !== null;
    } catch (error) {
      console.error("[ReadonlyBehavior.readonly getter] Error calling getAttribute:", error, "this:", this);
      throw error;
    }
  }

  set readonly(readonlyValue) {
    if (readonlyValue !== this._readonly) {
      this._readonly = readonlyValue;

      if (readonlyValue) {
        this.setAttribute("readonly", "");
        this._setIsReadonlyAttribute(true);

        if (!this._readonlyNested) {
          return;
        }

        this._propagateReadonly();
      } else {
        this.removeAttribute("readonly");

        if (!this._isReadonlyInHierarchy(true)) {
          this._setIsReadonlyAttribute(false);

          if (!this._readonlyNested) {
            return;
          }

          this._propagateReadonly();
        }
      }
    }
  }

  _initReadonly(enableNested) {
    // 添加调试日志
    if (!this || typeof this.getAttribute !== "function") {
      const thisValue = this;
      console.error("[ReadonlyBehavior._initReadonly] Invalid this context:", {
        thisValue,
        type: typeof thisValue,
        isHTMLElement: thisValue instanceof HTMLElement,
        hasGetAttribute: typeof thisValue?.getAttribute,
        constructor: thisValue?.constructor?.name,
        enableNested,
        stack: new Error().stack,
      });
      throw new TypeError("this.getAttribute is not a function in _initReadonly. this is not a valid HTMLElement.");
    }
    try {
      this._readonly = this.getAttribute("readonly") !== null;

      if (this._readonly) {
        this._setIsReadonlyAttribute(true);
      }

      this._readonlyNested = enableNested;
    } catch (error) {
      console.error("[ReadonlyBehavior._initReadonly] Error:", error, "this:", this);
      throw error;
    }
  }

  _propagateReadonly() {
    domUtils.walk(
      this,
      { excludeSelf: true },
      (childElement) =>
        !!childElement.canBeReadonly &&
        (!!childElement._readonly ||
          (childElement._setIsReadonlyAttribute(this._readonly),
          !childElement._readonlyNested))
    );
  }

  _isReadonlyInHierarchy(excludeSelf) {
    try {
      if (!excludeSelf && this.readonly) {
        return true;
      }
      let parentNode = this.parentNode;

      while (parentNode) {
        if (parentNode.readonly) {
          return true;
        }
        parentNode = parentNode.parentNode;
      }

      return false;
    } catch (error) {
      console.error("[ReadonlyBehavior._isReadonlyInHierarchy] Error:", error, "this:", this, "excludeSelf:", excludeSelf);
      throw error;
    }
  }

  _isReadonlySelf() {
    return this._readonly;
  }

  _setIsReadonlyAttribute(isReadonly) {
    if (isReadonly) {
      this.setAttribute("is-readonly", "");
    } else {
      this.removeAttribute("is-readonly");
    }
  }
}

const behaviorPrototype = ReadonlyBehavior.prototype;

// 获取 getter 描述符的辅助函数
function getGetter(prototype, name) {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
  if (descriptor && descriptor.get) {
    return descriptor.get;
  }
  console.warn(`[readonly] getter '${name}' not found in prototype`);
  return null;
}

function getSetter(prototype, name) {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
  if (descriptor && descriptor.set) {
    return descriptor.set;
  }
  console.warn(`[readonly] setter '${name}' not found in prototype`);
  return null;
}

export default {
  get canBeReadonly() {
    const getter = getGetter(behaviorPrototype, "canBeReadonly");
    if (!getter) {
      console.error("[readonly] canBeReadonly getter not found, this:", this, "type:", typeof this);
      return true; // 默认值
    }
    try {
      return getter.call(this);
    } catch (error) {
      console.error("[readonly] Error calling canBeReadonly getter:", error, "this:", this, "has getAttribute:", typeof this?.getAttribute);
      throw error;
    }
  },
  get readonly() {
    const getter = getGetter(behaviorPrototype, "readonly");
    if (!getter) {
      console.error("[readonly] readonly getter not found, this:", this, "type:", typeof this);
      return false; // 默认值
    }
    try {
      if (!this || typeof this.getAttribute !== "function") {
        const thisValue = this;
        console.error("[readonly] Invalid this context in readonly getter:", {
          thisValue,
          type: typeof thisValue,
          isHTMLElement: thisValue instanceof HTMLElement,
          hasGetAttribute: typeof thisValue?.getAttribute,
          hasSetAttribute: typeof thisValue?.setAttribute,
          constructor: thisValue?.constructor?.name,
          prototype: Object.getPrototypeOf(thisValue)?.constructor?.name,
          prototypeChain: (() => {
            const chain = [];
            let proto = thisValue;
            while (proto) {
              chain.push(proto.constructor?.name || "Unknown");
              proto = Object.getPrototypeOf(proto);
            }
            return chain;
          })(),
          stack: new Error().stack,
        });
        throw new TypeError("this.getAttribute is not a function. this is not a valid HTMLElement.");
      }
      return getter.call(this);
    } catch (error) {
      console.error("[readonly] Error calling readonly getter:", error, "this:", this, "has getAttribute:", typeof this?.getAttribute, "stack:", error.stack);
      throw error;
    }
  },
  set readonly(value) {
    console.log("[readonly] set readonly() called, value:", value, "this:", this);
    const setter = getSetter(behaviorPrototype, "readonly");
    if (!setter) {
      console.error("[readonly] readonly setter not found, this:", this, "type:", typeof this);
      return;
    }
    try {
      setter.call(this, value);
    } catch (error) {
      console.error("[readonly] Error calling readonly setter:", error, "this:", this, "value:", value, "stack:", error.stack);
      throw error;
    }
  },
  _initReadonly: behaviorPrototype._initReadonly,
  _propagateReadonly: behaviorPrototype._propagateReadonly,
  _propgateReadonly: behaviorPrototype._propagateReadonly,
  _isReadonlyInHierarchy: behaviorPrototype._isReadonlyInHierarchy,
  _isReadonlySelf: behaviorPrototype._isReadonlySelf,
  _setIsReadonlyAttribute: behaviorPrototype._setIsReadonlyAttribute,
};
