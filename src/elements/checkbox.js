import elementUtils from "./utils.js";
import { getElementStyleSync } from "../utils/css-loader.js";
import { fire } from "../utils/dom-utils.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";
import readonlyBehavior from "../behaviors/readonly.js";
import buttonStateBehavior from "../behaviors/button-state.js";

const template = /*html*/ `
    <div class="box">
      <i class="checker icon-ok"></i>
    </div>
    <span class="label">
      <slot></slot>
    </span>
  `;

export default elementUtils.registerElement("ui-checkbox", {
  get checked() {
    return this.getAttribute("checked") !== null;
  },
  set checked(value) {
    if (value || value === "" || value === 0) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
  },
  get value() {
    return this.checked;
  },
  set value(value) {
    this.checked = value;
  },
  get values() {
    return this._values;
  },
  set values(values) {
    this._values = values;
    this._updateMultiValue();
  },
  get multiValues() {
    return this._multiValues;
  },
  set multiValues(value) {
    const boolValue = !(value == null || value === false);
    if (boolValue !== this._multiValues) {
      this._multiValues = boolValue;
      this._updateMultiValue();
    }
  },
  get observedAttributes() {
    return ["checked", "multi-values"];
  },
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && (name === "checked" || name === "multi-values")) {
      const propertyName = name.replace(/\-(\w)/g, (match, letter) => letter.toUpperCase());
      this[propertyName] = newValue;
    }
  },
  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior, buttonStateBehavior],
  template,
  style: getElementStyleSync("checkbox"),
  factoryImpl(checked, label) {
    if (label) {
      this.innerText = label;
    }

    this.checked = checked;
  },
  ready() {
    this.multiValues = this.getAttribute("multi-values");
    this._initFocusable(this);
    this._initDisable(false);
    this._initReadonly(false);
    this._initButtonState(this);
  },
  _onButtonClick(element, event) {
    if (!this.readonly) {
      event.stopPropagation();
      this.checked = !this.checked;
      this.multiValues = false;
      fire(this, "change", {
        bubbles: true,
        detail: { value: this.checked },
      });

      fire(this, "confirm", {
        bubbles: true,
        detail: { value: this.checked },
      });
    }
  },
  _updateMultiValue() {
    if (
      !this.multiValues ||
      !this._values ||
      this.values.length <= 1
    ) {
      return this.removeAttribute("multi-values");
    }

    if (this._values.every((value, index) => index === 0 || value === this._values[index - 1])) {
      this.removeAttribute("multi-values");
    } else {
      this.setAttribute("multi-values", "");
    }
  },
});
