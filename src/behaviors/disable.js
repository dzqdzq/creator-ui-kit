import domUtils from "../utils/dom-utils.js";

export default {
  get canBeDisable() {
    return true;
  },
  get disabled() {
    return this.getAttribute("is-disabled") !== null;
  },
  set disabled(value) {
    if (value !== this._disabled) {
      this._disabled = value;
      if (value) {
        this.setAttribute("disabled", "");
        this._setIsDisabledAttribute(true);
        if (!this._disabledNested) {
          return;
        }
        this._propgateDisable();
      } else {
        this.removeAttribute("disabled");
        if (!this._isDisabledInHierarchy(true)) {
          this._setIsDisabledAttribute(false);
          if (!this._disabledNested) {
            return;
          }
          this._propgateDisable();
        }
      }
    }
  },
  _initDisable(nested) {
    this._disabled = this.getAttribute("disabled") !== null;
    if (this._disabled) {
      this._setIsDisabledAttribute(true);
    }
    this._disabledNested = nested;
  },
  _propgateDisable() {
    domUtils.walk(
      this,
      { excludeSelf: true },
      (el) =>
        !!el.canBeDisable &&
        (!!el._disabled ||
          (el._setIsDisabledAttribute(this._disabled), !el._disabledNested))
    );
  },
  _isDisabledInHierarchy(excludeSelf) {
    if (!excludeSelf && this.disabled) {
      return true;
    }
    let parent = this.parentNode;
    while (parent) {
      if (parent.disabled) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  },
  _setIsDisabledAttribute(value) {
    if (value) {
      this.setAttribute("is-disabled", "");
    } else {
      this.removeAttribute("is-disabled");
    }
  },
};
