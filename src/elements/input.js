import elementUtils from "./utils.js";
import { getElementStyleSync } from "../utils/css-loader.js";
import { fire, acceptEvent } from "../utils/dom-utils.js";
import focusMgr from "../utils/focus-mgr.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";
import readonlyBehavior from "../behaviors/readonly.js";
import inputStateBehavior from "../behaviors/input-state.js";

export default elementUtils.registerElement("ui-input", {
  get value() {
    return this.$input.value;
  },
  set value(value) {
    if (value === null || value === undefined) {
      value = "";
    }

    value += "";
    this._value = value;

    if (!this.multiValues) {
      if (this._maxLength !== null) {
        this.$input.value = value.substr(0, this._maxLength);
      } else {
        this.$input.value = value;
      }
    }
  },
  get values() {
    return this._values;
  },
  set values(values) {
    this._values = values;

    if (this.multiValues) {
      this._updateMultiValue();
    }
  },
  get placeholder() {
    return this.$input.placeholder;
  },
  set placeholder(placeholder) {
    this.$input.placeholder = placeholder;
  },
  get password() {
    return this.$input.type === "password";
  },
  set password(isPassword) {
    this.$input.type = isPassword === true ? "password" : "";
  },
  get maxLength() {
    return this._maxLength;
  },
  set maxLength(length) {
    let numLength = length;
    if (numLength !== null) {
      numLength -= 0;
    }

    if (isNaN(numLength)) {
      numLength = null;
    }

    this._maxLength = numLength;

    if (numLength) {
      this.$input.value = this._value.substr(0, this._maxLength);
    }
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
    return ["placeholder", "password", "multi-values"];
  },
  attributeChangedCallback(name, oldValue, newValue) {
    if (
      oldValue !== newValue &&
      (name === "placeholder" ||
        name === "password" ||
        name === "multi-values")
    ) {
      const propertyName = name.replace(/\-(\w)/g, (match, letter) => letter.toUpperCase());
      this[propertyName] = newValue;
    }
  },
  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior, inputStateBehavior],
  template: "\n    <input></input>\n  ",
  style: getElementStyleSync("input"),
  $: { input: "input" },
  factoryImpl(value) {
    if (value) {
      this.value = value;
    }
  },
  ready() {
    this._value = "";
    this._values = [""];
    this.$input.value = this.getAttribute("value");
    this.$input.placeholder = this.getAttribute("placeholder") || "";
    this.$input.type = this.getAttribute("password") !== null ? "password" : "";
    this.maxLength = this.getAttribute("max-length");
    this.multiValues = this.getAttribute("multi-values");
    this._initFocusable(this, this.$input);
    this._initDisable(false);
    this._initReadonly(false);
    this._initInputState(this.$input);
    this.$input.readOnly = this.readonly;
    this._initEvents();
  },
  clear() {
    this.$input.value = "";
    this.confirm();
  },
  confirm() {
    this._onInputConfirm(this.$input);
  },
  cancel() {
    this._onInputCancel(this.$input);
  },
  _setIsReadonlyAttribute(isReadonly) {
    if (isReadonly) {
      this.setAttribute("is-readonly", "");
    } else {
      this.removeAttribute("is-readonly");
    }

    this.$input.readOnly = isReadonly;
  },
  _initEvents() {
    this.addEventListener("mousedown", this._mouseDownHandler);
    this.addEventListener("keydown", this._keyDownHandler);
    this.addEventListener("focus-changed", this._focusChangedHandler);
  },
  _onInputConfirm(input, confirmByEnter) {
    if (!this.readonly) {
      if (this._changed) {
        this._changed = false;
        input._initValue = input.value;
        this._value = input.value;
        this.multiValues = false;

        fire(this, "confirm", {
          bubbles: true,
          detail: { value: input.value, confirmByEnter },
        });
      }
    }

    if (confirmByEnter) {
      this.focus();
    }
  },
  _onInputCancel(input, cancelByEsc) {
    if (!this.readonly) {
      if (this._changed) {
        this._changed = false;

        if (input._initValue !== input.value) {
          input.value = input._initValue;
          this._value = input._initValue;
          fire(this, "change", {
            bubbles: true,
            detail: { value: input.value },
          });
        }

        fire(this, "cancel", {
          bubbles: true,
          detail: { value: input.value, cancelByEsc },
        });
      }
    }

    if (cancelByEsc) {
      input.blur();
      this.focus();
    }
  },
  _onInputChange(input) {
    this._changed = true;

    if (this._maxLength && input.value.length > this._maxLength) {
      input.value = input.value.substr(0, this._maxLength);
    }

    fire(this, "change", { bubbles: true, detail: { value: input.value } });
  },
  _mouseDownHandler(event) {
    event.stopPropagation();
    focusMgr._setFocusElement(this);
  },
  _keyDownHandler(event) {
    if (!this.disabled && (event.keyCode === 13 || event.keyCode === 32)) {
      acceptEvent(event);
      this.$input._initValue = this.$input.value;
      this.$input.focus();
      this.$input.select();
    }
  },
  _focusChangedHandler() {
    if (this.focused) {
      this.$input._initValue = this.$input.value;
    } else {
      this._unselect(this.$input);
    }
  },
  _updateMultiValue() {
    if (
      !this.multiValues ||
      !this._values ||
      this.values.length <= 1
    ) {
      this.$input.value = this._value;
      return this.$input.removeAttribute("multi-values");
    }

    if (this._values.every((value, index) => index === 0 || value === this._values[index - 1])) {
      this.$input.removeAttribute("multi-values");
    } else {
      this.$input.value = "-";
      this.$input.setAttribute("multi-values", "");
    }
  },
});
