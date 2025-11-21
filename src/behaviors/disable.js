import domUtils from "../utils/dom-utils";

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
    domUtils.walk(
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

// 导出类的实例方法和属性描述符，以便混入到元素原型
const behaviorPrototype = DisableBehavior.prototype;
export default {
  get canBeDisable() {
    return behaviorPrototype.canBeDisable.get.call(this);
  },
  get disabled() {
    return behaviorPrototype.disabled.get.call(this);
  },
  set disabled(value) {
    behaviorPrototype.disabled.set.call(this, value);
  },
  _initDisable: behaviorPrototype._initDisable,
  _propagateDisable: behaviorPrototype._propagateDisable,
  // 向后兼容：保留旧的拼写错误的方法名
  _propgateDisable: behaviorPrototype._propagateDisable,
  _isDisabledInHierarchy: behaviorPrototype._isDisabledInHierarchy,
  _isDisabledSelf: behaviorPrototype._isDisabledSelf,
  _setIsDisabledAttribute: behaviorPrototype._setIsDisabledAttribute,
};
