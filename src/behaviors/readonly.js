import domUtils from "../utils/dom-utils";

class ReadonlyBehavior {
  get canBeReadonly() {
    return true;
  }

  get readonly() {
    return this.getAttribute("is-readonly") !== null;
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
    this._readonly = this.getAttribute("readonly") !== null;

    if (this._readonly) {
      this._setIsReadonlyAttribute(true);
    }

    this._readonlyNested = enableNested;
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
export default {
  get canBeReadonly() {
    return behaviorPrototype.canBeReadonly.get.call(this);
  },
  get readonly() {
    return behaviorPrototype.readonly.get.call(this);
  },
  set readonly(value) {
    behaviorPrototype.readonly.set.call(this, value);
  },
  _initReadonly: behaviorPrototype._initReadonly,
  _propagateReadonly: behaviorPrototype._propagateReadonly,
  _propgateReadonly: behaviorPrototype._propagateReadonly,
  _isReadonlyInHierarchy: behaviorPrototype._isReadonlyInHierarchy,
  _isReadonlySelf: behaviorPrototype._isReadonlySelf,
  _setIsReadonlyAttribute: behaviorPrototype._setIsReadonlyAttribute,
};
