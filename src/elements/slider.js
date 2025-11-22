// import t from "../settings"; // 外部依赖，暂时注释
import elementUtils from "./utils.js";
import jsUtils from "../utils/js-utils.js";
import mathUtils from "../utils/math.js";
import { getElementStyleSync } from "../utils/css-loader.js";
import { acceptEvent, fire } from "../utils/dom-utils.js";
import focusMgr from "../utils/focus-mgr.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";
import readonlyBehavior from "../behaviors/readonly.js";
import inputStateBehavior from "../behaviors/input-state.js";

// 创建占位符
const settings = {};

export default elementUtils.registerElement("ui-slider", {
  get value() {
    return this._value;
  },
  set value(t) {
    if (t === null || t === undefined) {
      t = 0;
    }

    t = mathUtils.clamp(t, this._min, this._max);
    this._value = t;
    this._updateNubbinAndInput();
  },
  get values() {
    return this._values;
  },
  set values(t) {
    return (this._values = t);
  },
  get min() {
    return this._min;
  },
  set min(t) {
    if (t === null || t === undefined) {
      this._min = null;
      return undefined;
    }

    if (this._min !== t) {
      this._min = parseFloat(t);
    }
  },
  get max() {
    return this._max;
  },
  set max(t) {
    if (t === null || t === undefined) {
      this._max = null;
      return undefined;
    }

    if (this._max !== t) {
      this._max = parseFloat(t);
    }
  },
  get precision() {
    return this._precision;
  },
  set precision(t) {
    if (t !== undefined && t !== null && this._precision !== t) {
      this._precision = parseInt(t);
    }
  },
  get step() {
    return this._step;
  },
  set step(e) {
    if (e !== undefined && e !== null && this._step !== e) {
      this._step = parseFloat(e);
      this._step = this._step === 0 ? settings.stepFloat : this._step;
    }
  },
  get snap() {
    return this._snap;
  },
  set snap(t) {
    if (t !== undefined && t !== null && this._snap !== t) {
      this._snap = t;
    }
  },
  get multiValues() {
    return this._multiValues;
  },
  set multiValues(t) {
    if ((t = !(t == null || t === false)) !== this._multiValues) {
      this._multiValues = t;

      t
        ? this.setAttribute("multi-values", "")
        : this.removeAttribute("multi-values");

      this._multiValues = t;
    }
  },
  get observedAttributes() {
    return ["precision", "min", "max", "multi-values"];
  },
  attributeChangedCallback(t, e, i) {
    if (e !== i) {
      switch (t) {
        case "multi-values":
        case "precision": {
          this[t.replace(/\-(\w)/g, (t, e) => e.toUpperCase())] = i;
        }
      }

      if (t === "min") {
        this.min = i;
      } else if (t === "max") {
        this.max = i;
      }
    }
  },
  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior, inputStateBehavior],
  template:
    '\n    <div class="wrapper">\n      <div class="track"></div>\n      <div class="nubbin"></div>\n    </div>\n    <input></input>\n  ',
  style: getElementStyleSync("slider"),
  $: {
    wrapper: ".wrapper",
    track: ".track",
    nubbin: ".nubbin",
    input: "input",
  },
  factoryImpl(t) {
    if (!isNaN(t)) {
      this.value = t;
    }
  },
  ready() {
    let e = this.getAttribute("precision");
    this._precision = e !== null ? parseInt(e) : 1;
    let i = this.getAttribute("min");
    this._min = i !== null ? parseFloat(i) : 0;
    let a = this.getAttribute("max");
    this._max = a !== null ? parseFloat(a) : 1;
    let n = this.getAttribute("value");
    this._value = n !== null ? parseFloat(n) : 0;

    this._value = this._initValue = mathUtilmathUtils.clamp(this._value, this._min, this._max);

    let h = this.getAttribute("step");
    this._step = h !== null ? parseFloat(h) : settings.stepFloat;
    this._snap = true;
    this.multiValues = this.getAttribute("multi-values");
    this._updateNubbinAndInput();
    this._initFocusable([this.$wrapper, this.$input], this.$input);
    this._initDisable(false);
    this._initReadonly(false);
    this._initInputState(this.$input);
    this.$input.readOnly = this.readonly;
    this._initEvents();
  },
  _initEvents() {
    this.addEventListener("mousedown", this._mouseDownHandler);
    this.addEventListener("focus-changed", this._focusChangedHandler);

    this.$wrapper.addEventListener(
      "keydown",
      this._wrapperKeyDownHandler.bind(this)
    );

    this.$wrapper.addEventListener(
      "keyup",
      this._wrapperKeyUpHandler.bind(this)
    );

    this.$wrapper.addEventListener(
      "mousedown",
      this._wrapperMouseDownHandler.bind(this)
    );

    this.$input.addEventListener("keydown", (t) => {
      if (t.keyCode === 38) {
        acceptEvent(t);
        this.readonly || this._stepUp(t);
      } else if (t.keyCode === 40) {
        acceptEvent(t);
        this.readonly || this._stepDown(t);
      }
    });
  },
  _mouseDownHandler(t) {
    acceptEvent(t);
    focusMgr._setFocusElement(this);
  },
  _wrapperMouseDownHandler(t) {
    acceptEvent(t);
    focusMgr._setFocusElement(this);
    this.$wrapper.focus();

    if (this.readonly) {
      return;
    }

    this._initValue = this._value;
    let e = this.$track.getBoundingClientRect();
    let i = (t.clientX - e.left) / this.$track.clientWidth;
    let a = this._min + i * (this._max - this._min);

    if (this._snap) {
      a = this._snapToStep(a);
    }

    let u = this._formatValue(a);
    this.$input.value = u;
    this._value = parseFloat(u);
    this._updateNubbin();
    this._emitChange();
  },
  _wrapperKeyDownHandler(t) {
    if (!this.disabled) {
      if (t.keyCode === 13 || t.keyCode === 32) {
        acceptEvent(t);
        this.$input._initValue = this.$input.value;
        this.$input.focus();
        this.$input.select();
      } else if (t.keyCode === 27) {
        this.cancel();
      } else if (t.keyCode === 37) {
        acceptEvent(t);

        if (this.readonly) {
          return;
        }

        this._stepDown(t);
      } else if (t.keyCode === 39) {
        acceptEvent(t);

        if (this.readonly) {
          return;
        }

        this._stepUp(t);
      }
    }
  },
  _stepUp(e) {
    let i = this._step;

    if (e.shiftKey) {
      i *= settings.shiftStep;
    }

    this._value = mathUtilmathUtils.clamp(this._value + i, this._min, this._max);
    this._updateNubbinAndInput();
    this._emitChange();
  },
  _stepDown(e) {
    let i = this._step;

    if (e.shiftKey) {
      i *= settings.shiftStep;
    }

    this._value = mathUtilmathUtils.clamp(this._value - i, this._min, this._max);
    this._updateNubbinAndInput();
    this._emitChange();
  },
  _wrapperKeyUpHandler(t) {
    if (t.keyCode === 37 || t.keyCode === 39) {
      acceptEvent(t);

      if (this.readonly) {
        return;
      }

      this.confirm();
    }
  },
  _parseInput() {
    if (this.$input.value === null) {
      return this._min;
    }
    if (this.$input.value.trim() === "") {
      return this._min;
    }
    let t = parseFloat(this.$input.value);

    if (isNaN(t)) {
      t = parseFloat(this.$input._initValue);
      t = parseFloat(this._formatValue(t));
    } else {
      t = parseFloat(this._formatValue(t));
    }

    t = mathUtils.clamp(t, this._min, this._max);
    return t;
  },
  _updateNubbin() {
    let t = (this._value - this._min) / (this._max - this._min);
    this.$nubbin.style.left = `${100 * t}%`;
  },
  _updateNubbinAndInput() {
    let t = (this._value - this._min) / (this._max - this._min);
    this.$nubbin.style.left = `${100 * t}%`;
    this.$input.value = this._formatValue(this._value);
  },
  confirm() {
    if (this._changed) {
      this._changed = false;
      this._initValue = this._value;
      this._updateNubbinAndInput();
      fire(this, "confirm", {
        bubbles: true,
        detail: { value: this._value },
      });
    }
  },
  cancel() {
    if (this._changed) {
      this._changed = false;

      this._value !== this._initValue &&
        ((this._value = this._initValue),
        this._updateNubbinAndInput(),
        fire(this, "change", {
          bubbles: true,
          detail: { value: this._value },
        }));

      fire(this, "cancel", { bubbles: true, detail: { value: this._value } });
    }
  },
  _onInputConfirm(t, e) {
    if (!this.readonly && this._changed) {
      this._changed = false;
      let i = this._parseInput();
      t.value = i;
      t._initValue = i;
      this._value = i;
      this._initValue = i;
      this._updateNubbin();

      fire(this, "confirm", {
        bubbles: true,
        detail: { value: this._value, confirmByEnter: e },
      });
    }

    if (e) {
      this.$wrapper.focus();
    }
  },
  _onInputCancel(t, e) {
    if (!this.readonly && this._changed) {
      this._changed = false;

      if (t._initValue !== t.value) {
        t.value = t._initValue;
        let e = this._parseInput();
        t.value = e;
        this._value = e;
        this._initValue = e;
        this._updateNubbin();

        fire(this, "change", {
          bubbles: true,
          detail: { value: this._value },
        });
      }

      fire(this, "cancel", {
        bubbles: true,
        detail: { value: this._value, cancelByEsc: e },
      });
    }

    if (e) {
      this.$wrapper.focus();
    }
  },
  _onInputChange() {
    let t = this._parseInput();
    this._value = t;
    this._updateNubbin();
    this._emitChange();
  },
  _focusChangedHandler() {
    if (!this.focused) {
      this._unselect(this.$input);
    }
  },
  _emitChange() {
    this._changed = true;
    fire(this, "change", { bubbles: true, detail: { value: this._value } });
  },
  _snapToStep(t) {
    let e = Math.round((t - this._value) / this._step);
    t = this._value + this._step * e;
    return mathUtilmathUtils.clamp(t, this.min, this.max);
  },
  _formatValue(t) {
    return t === null || t === ""
      ? ""
      : this._precision === 0
      ? jsUtils.toFixed(t, this._precision)
      : jsUtils.toFixed(t, this._precision, this._precision);
  },
});
