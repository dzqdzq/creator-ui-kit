import elementUtils from "./utils.js";
import resourceMgr from "../utils/resource-mgr.js";
import domUtils from "../utils/dom-utils.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";
import readonlyBehavior from "../behaviors/readonly.js";
import buttonStateBehavior from "../behaviors/button-state.js";

export default elementUtils.registerElement("ui-checkbox", {
  get checked() {
    return this.getAttribute("checked") !== null;
  },
  set checked(e) {
    if (e || e === "" || e === "" || e === 0) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
  },
  get value() {
    return this.checked;
  },
  set value(e) {
    this.checked = e;
  },
  get values() {
    return this._values;
  },
  set values(e) {
    this._values = e;
    this._updateMultiValue();
  },
  get multiValues() {
    return this._multiValues;
  },
  set multiValues(e) {
    if ((e = !(e == null || e === false)) !== this._multiValues) {
      this._multiValues = e;
      this._updateMultiValue();
    }
  },
  get observedAttributes() {
    return ["checked", "multi-values"];
  },
  attributeChangedCallback(e, t, i) {
    if (t !== i && (e === "checked" || e === "multi-values")) {
      this[e.replace(/\-(\w)/g, (e, t) => t.toUpperCase())] = i;
    }
  },
  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior, buttonStateBehavior],
  template:
    '\n    <div class="box">\n      <i class="checker icon-ok"></i>\n    </div>\n    <span class="label">\n      <slot></slot>\n    </span>\n  ',
  style: resourceMgr.getResource("theme://elements/checkbox.css"),
  factoryImpl(e, t) {
    if (t) {
      this.innerText = t;
    }

    this.checked = e;
  },
  ready() {
    this.multiValues = this.getAttribute("multi-values");
    this._initFocusable(this);
    this._initDisable(false);
    this._initReadonly(false);
    this._initButtonState(this);
  },
  _onButtonClick(e, t) {
    if (!this.readonly) {
      t.stopPropagation();
      this.checked = !this.checked;
      this.multiValues = false;
      domUtils.fire(this, "change", {
        bubbles: true,
        detail: { value: this.checked },
      });

      domUtils.fire(this, "confirm", {
        bubbles: true,
        detail: { value: this.checked },
      });
    }
  },
  _updateMultiValue() {
    if (
      !this.multiValues ||
      !this._values ||
      !this._values ||
      this.values.length <= 1
    ) {
      return this.removeAttribute("multi-values");
    }

    if (this._values.every((e, t) => t === 0 || e === this._values[t - 1])) {
      this.removeAttribute("multi-values");
    } else {
      this.setAttribute("multi-values", "");
    }
  },
});
