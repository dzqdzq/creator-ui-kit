import domUtils from "../utils/dom-utils.js";

export default {
  get canBeReadonly() {
    return true;
  },
  get readonly() {
    return this.getAttribute("is-readonly") !== null;
  },
  set readonly(value) {
    if (value !== this._readonly) {
      this._readonly = value;
      if (value) {
        this.setAttribute("readonly", "");
        this._setIsReadonlyAttribute(true);
        if (!this._readonlyNested) {
          return;
        }
        this._propgateReadonly();
      } else {
        this.removeAttribute("readonly");
        if (!this._isReadonlyInHierarchy(true)) {
          this._setIsReadonlyAttribute(false);
          if (!this._readonlyNested) {
            return;
          }
          this._propgateReadonly();
        }
      }
    }
  },
  _initReadonly(nested) {
    this._readonly = this.getAttribute("readonly") !== null;
    if (this._readonly) {
      this._setIsReadonlyAttribute(true);
    }
    this._readonlyNested = nested;
  },
  _propgateReadonly() {
    domUtils.walk(
      this,
      { excludeSelf: true },
      (el) =>
        !!el.canBeReadonly &&
        (!!el._readonly ||
          (el._setIsReadonlyAttribute(this._readonly), !el._readonlyNested))
    );
  },
  _isReadonlyInHierarchy(excludeSelf) {
    if (!excludeSelf && this.readonly) {
      return true;
    }
    let parent = this.parentNode;
    while (parent) {
      if (parent.readonly) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  },
  _setIsReadonlyAttribute(value) {
    if (value) {
      this.setAttribute("is-readonly", "");
    } else {
      this.removeAttribute("is-readonly");
    }
  },
};
