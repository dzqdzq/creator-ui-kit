import e from "../utils/dom-utils";
let t = {
  get canBeDisable() {
    return true;
  },
  get disabled() {
    return this.getAttribute("is-disabled") !== null;
  },
  set disabled(e) {
    if (e !== this._disabled) {
      this._disabled = e;

      if (e) {
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
  _initDisable(e) {
    this._disabled = this.getAttribute("disabled") !== null;

    if (this._disabled) {
      this._setIsDisabledAttribute(true);
    }

    this._disabledNested = e;
  },
  _propgateDisable() {
    e.walk(
      this,
      { excludeSelf: true },
      (e) =>
        !!e.canBeDisable &&
        (!!e._disabled ||
          (e._setIsDisabledAttribute(this._disabled), !e._disabledNested))
    );
  },
  _isDisabledInHierarchy(e) {
    if (!e && this.disabled) {
      return true;
    }
    let t = this.parentNode;

    while (t) {
      if (t.disabled) {
        return true;
      }
      t = t.parentNode;
    }

    return false;
  },
  _isDisabledSelf() {
    return this._disabled;
  },
  _setIsDisabledAttribute(e) {
    if (e) {
      this.setAttribute("is-disabled", "");
    } else {
      this.removeAttribute("is-disabled");
    }
  },
};
export default t;
