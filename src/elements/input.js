import elementUtils from "./utils.js";
import { getElementStyleSync } from "../utils/css-loader.js";
import domUtils from "../utils/dom-utils.js";
import focusMgr from "../utils/focus-mgr.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";
import readonlyBehavior from "../behaviors/readonly.js";
import inputStateBehavior from "../behaviors/input-state.js";

export default elementUtils.registerElement("ui-input", {
  get value() {
    return this.$input.value;
  },
  set value(t) {
    if (t === null || t === undefined) {
      t = "";
    }

    t += "";
    this._value = t;

    if (!this.multiValues) {
      if (this._maxLength !== null) {
        this.$input.value = t.substr(0, this._maxLength);
      } else {
        this.$input.value = t;
      }
    }
  },
  get values() {
    return this._values;
  },
  set values(t) {
    this._values = t;

    if (this.multiValues) {
      this._updateMultiValue();
    }
  },
  get placeholder() {
    return this.$input.placeholder;
  },
  set placeholder(t) {
    this.$input.placeholder = t;
  },
  get password() {
    return this.$input.type === "password";
  },
  set password(t) {
    this.$input.type = t === true ? "password" : "";
  },
  get maxLength() {
    return this._maxLength;
  },
  set maxLength(t) {
    if (t !== null) {
      t -= 0;
    }

    if (isNaN(t)) {
      t = null;
    }

    this._maxLength = t;

    if (t) {
      this.$input.value = this._value.substr(0, this._maxLength);
    }
  },
  get multiValues() {
    return this._multiValues;
  },
  set multiValues(t) {
    if ((t = !(t == null || t === false)) !== this._multiValues) {
      this._multiValues = t;
      this._updateMultiValue();
    }
  },
  get observedAttributes() {
    return ["placeholder", "password", "multi-values"];
  },
  attributeChangedCallback(t, e, i) {
    if (
      e !== i &&
      (t === "placeholder" ||
        t === "password" ||
        t === "password" ||
        t === "multi-values")
    ) {
      this[t.replace(/\-(\w)/g, (t, e) => e.toUpperCase())] = i;
    }
  },
  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior, inputStateBehavior],
  template: "\n    <input></input>\n  ",
  style: getElementStyleSync("input"),
  $: { input: "input" },
  factoryImpl(t) {
    if (t) {
      this.value = t;
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
  _setIsReadonlyAttribute(t) {
    if (t) {
      this.setAttribute("is-readonly", "");
    } else {
      this.removeAttribute("is-readonly");
    }

    this.$input.readOnly = t;
  },
  _initEvents() {
    this.addEventListener("mousedown", this._mouseDownHandler);
    this.addEventListener("keydown", this._keyDownHandler);
    this.addEventListener("focus-changed", this._focusChangedHandler);
  },
  _onInputConfirm(t, e) {
    if (!this.readonly) {
      if (this._changed) {
        this._changed = false;
        t._initValue = t.value;
        this._value = t.value;
        this.multiValues = false;

        domUtils.fire(this, "confirm", {
          bubbles: true,
          detail: { value: t.value, confirmByEnter: e },
        });
      }
    }

    if (e) {
      this.focus();
    }
  },
  _onInputCancel(t, e) {
    if (!this.readonly) {
      if (this._changed) {
        this._changed = false;

        t._initValue !== t.value &&
          ((t.value = t._initValue),
          (this._value = t._initValue),
          domUtils.fire(this, "change", {
            bubbles: true,
            detail: { value: t.value },
          }));

        domUtils.fire(this, "cancel", {
          bubbles: true,
          detail: { value: t.value, cancelByEsc: e },
        });
      }
    }

    if (e) {
      t.blur();
      this.focus();
    }
  },
  _onInputChange(t) {
    this._changed = true;

    if (this._maxLength && t.value.length > this._maxLength) {
      t.value = t.value.substr(0, this._maxLength);
    }

    domUtils.fire(this, "change", { bubbles: true, detail: { value: t.value } });
  },
  _mouseDownHandler(t) {
    t.stopPropagation();
    focusMgr._setFocusElement(this);
  },
  _keyDownHandler(t) {
    if (!this.disabled && (t.keyCode === 13 || t.keyCode === 32)) {
      domUtils.acceptEvent(t);
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
      !this._values ||
      this.values.length <= 1
    ) {
      this.$input.value = this._value;
      return this.$input.removeAttribute("multi-values");
    }

    if (this._values.every((t, e) => e === 0 || t === this._values[e - 1])) {
      this.$input.removeAttribute("multi-values");
    } else {
      this.$input.value = "-";
      this.$input.setAttribute("multi-values", "");
    }
  },
});
