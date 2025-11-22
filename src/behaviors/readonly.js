import domUtils from "../utils/dom-utils";
let t = {
  get canBeReadonly() {
    return true;
  },
  get readonly() {
    return this.getAttribute("is-readonly") !== null;
  },
  set readonly(e) {
    if (e !== this._readonly) {
      this._readonly = e;

      if (e) {
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
  _initReadonly(e) {
    this._readonly = this.getAttribute("readonly") !== null;

    if (this._readonly) {
      this._setIsReadonlyAttribute(true);
    }

    this._readonlyNested = e;
  },
  _propgateReadonly() {
    domUtils.walk(
      this,
      { excludeSelf: true },
      (e) =>
        !!e.canBeReadonly &&
        (!!e._readonly ||
          (e._setIsReadonlyAttribute(this._readonly), !e._readonlyNested))
    );
  },
  _isReadonlyInHierarchy(e) {
    if (!e && this.readonly) {
      return true;
    }
    let t = this.parentNode;

    while (t) {
      if (t.readonly) {
        return true;
      }
      t = t.parentNode;
    }

    return false;
  },
  _isReadonlySelf() {
    return this._readonly;
  },
  _setIsReadonlyAttribute(e) {
    if (e) {
      this.setAttribute("is-readonly", "");
    } else {
      this.removeAttribute("is-readonly");
    }
  },
};
export default t;
