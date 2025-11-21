// import t from "vm"; // Node.js 模块，浏览器环境不可用
// import e from "../settings"; // 外部依赖，暂时注释
import i from "./utils.js";
// import s from "../../../share/utils"; // 外部依赖，暂时注释
import n from "../utils/resource-mgr.js";
import a from "../utils/dom-utils.js";
import r from "../utils/focus-mgr.js";
import h from "../behaviors/focusable.js";
import l from "../behaviors/disable.js";
import u from "../behaviors/readonly.js";
import p from "../behaviors/input-state.js";
// import o from "../behaviors/droppable"; // 需要创建此文件
// import _ from "../utils/drag-drop"; // 需要创建此文件
// import { promisify } from "util"; // Node.js 模块，浏览器环境不可用

// 创建占位符
const t = null;
const e = {};
const s = {};
const o = {};
const _ = {};

export default i.registerElement("ui-num-input", {
  get type() {
    return this._type;
  },
  set type(t) {
    if (this._type !== t) {
      this._type = t;

      this._type === "int"
        ? ((this._parseFn = parseInt),
          (this._step = parseInt(this._step)),
          (this._step = this._step === 0 ? e.stepInt : this._step))
        : ((this._parseFn = parseFloat),
          (this._step = parseFloat(this._step)),
          (this._step = this._step === 0 ? e.stepFloat : this._step));
    }
  },
  get elementType() {
    return this.getAttribute("elementtype");
  },
  get resourceType() {
    return this.getAttribute("resourcetype");
  },
  get attrType() {
    return this.getAttribute("attrtype");
  },
  get value() {
    return this._value;
  },
  set value(t) {
    if (t === null || t === undefined) {
      t = 0;
    }

    t = this._clampValue(t);

    if (this._value !== t) {
      this._value = this._parseFn(t);
      this._multiValues || (this.$input.value = this._formatValue(this._value));
    }
  },
  get values() {
    return this._values;
  },
  set values(t) {
    this._values = t;

    if (this._multiValues) {
      this.$input.value = "-";
    }
  },
  get highlighted() {
    return this.getAttribute("highlighted") !== null;
  },
  set highlighted(t) {
    if (t) {
      this.setAttribute("highlighted", "");
    } else {
      this.removeAttribute("highlighted");
    }
  },
  get invalid() {
    return this.getAttribute("invalid") !== null;
  },
  set invalid(t) {
    if (t) {
      this.setAttribute("invalid", "");
    } else {
      this.removeAttribute("invalid");
    }
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
      this._min = this._parseFn(t);
      this.value = this._value;
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
      this._max = this._parseFn(t);
      this.value = this._value;
    }
  },
  get precision() {
    return this._precision;
  },
  set precision(t) {
    if (t !== undefined && t !== null && this._precision !== t) {
      this._precision = parseInt(t);
      this.$input.value = this._formatValue(this._value);
    }
  },
  get step() {
    return this._step;
  },
  set step(t) {
    if (t !== undefined && t !== null && this._step !== t) {
      this._step = this._parseFn(t);

      this._type === "int"
        ? (this._step = this._step === 0 ? e.stepInt : this._step)
        : (this._step = this._step === 0 ? e.stepFloat : this._step);
    }
  },
  get multiValues() {
    return this._multiValues;
  },
  set multiValues(t) {
    if ((t = !(t == null || t === false)) !== this._multiValues) {
      if (t) {
        this.$input.value = "-";
        this.setAttribute("multi-values", "");
      } else {
        this._value = this._parseFn(this._clampValue(this._value));
        this.$input.value = this._formatValue(this._value);
        this.removeAttribute("multi-values");
      }

      this._multiValues = t;
      return this._multiValues;
    }
  },
  get observedAttributes() {
    return ["type", "min", "max", "precision", "step", "multi-values"];
  },
  attributeChangedCallback(t, e, i) {
    if (
      e !== i &&
      (t == "type" ||
        t == "min" ||
        t == "min" ||
        t == "max" ||
        t == "min" ||
        t == "max" ||
        t == "precision" ||
        t == "min" ||
        t == "max" ||
        t == "precision" ||
        t == "step" ||
        t == "min" ||
        t == "max" ||
        t == "precision" ||
        t == "step" ||
        t == "multi-values")
    ) {
      this[t.replace(/\-(\w)/g, (t, e) => e.toUpperCase())] = i;
    }
  },
  behaviors: [h, l, u, p, o],
  template:
    '\n    <input></input>\n    <div class="spin-wrapper" tabindex="-1">\n      <div class="spin up">\n        <i class="icon-up-dir"></i>\n      </div>\n      <div class="spin-div"></div>\n      <div class="spin down">\n        <i class="icon-down-dir"></i>\n      </div>\n    </div>\n  ',
  style: n.getResource("theme://elements/num-input.css"),
  $: {
    input: "input",
    spinWrapper: ".spin-wrapper",
    spinUp: ".spin.up",
    spinDown: ".spin.down",
  },
  factoryImpl(t) {
    if (!isNaN(t)) {
      this.value = t;
    }
  },
  ready() {
    let t = this.getAttribute("droppable");

    if (t) {
      this.droppable = t;
    }

    if (this.getAttribute("type") === "int") {
      this._type = "int";
      this._parseFn = parseInt;
    } else {
      this._type = "float";
      this._parseFn = parseFloat;
    }

    let i = this.getAttribute("precision");
    this._precision = i !== null ? parseInt(i) : 7;
    let s = this.getAttribute("min");
    this._min = s !== null ? this._parseFn(s) : null;
    let n = this.getAttribute("max");
    this._max = n !== null ? this._parseFn(n) : null;
    this.multiValues = this.getAttribute("multi-values");
    let h = this.getAttribute("value");
    this._value = h !== null ? this._parseFn(h) : null;
    this._value = this._clampValue(this._value);
    let l = this.getAttribute("step");

    this._step =
      l !== null
        ? this._parseFn(l)
        : this._type === "int"
        ? e.stepInt
        : e.stepFloat;

    this.$input.value = this._formatValue(this._value);
    this.$input.placeholder = "-";
    this.$input._initValue = "";

    this.$spinWrapper.addEventListener("keydown", (t) => {
      if (t.keyCode === 27 && this._holdingID) {
        a.acceptEvent(t);
        this.cancel();
        this._curSpin.removeAttribute("pressed");
        this._stopHolding();
      }
    });

    a.installDownUpEvent(this.$spinUp);

    this.$spinUp.addEventListener("down", (t) => {
      a.acceptEvent(t);
      r._setFocusElement(this);
      this.$spinWrapper.focus();
      this.$spinUp.setAttribute("pressed", "");

      if (!this.readonly) {
        this._stepUp();
        this._startHolding(this.$spinUp, this._stepUp);
      }
    });

    this.$spinUp.addEventListener("up", (t) => {
      a.acceptEvent(t);
      this.$spinUp.removeAttribute("pressed", "");

      if (this._holdingID) {
        this._stopHolding();
        this.confirm();
      }
    });

    a.installDownUpEvent(this.$spinDown);

    this.$spinDown.addEventListener("down", (t) => {
      a.acceptEvent(t);
      r._setFocusElement(this);
      this.$spinWrapper.focus();
      this.$spinDown.setAttribute("pressed", "");

      if (!this.readonly) {
        this._stepDown();
        this._startHolding(this.$spinDown, this._stepDown);
      }
    });

    this.$spinDown.addEventListener("up", (t) => {
      a.acceptEvent(t);
      this.$spinDown.removeAttribute("pressed", "");

      if (this._holdingID) {
        this._stopHolding();
        this.confirm();
      }
    });

    this._initFocusable(this, this.$input);
    this._initDisable(false);
    this._initReadonly(false);
    this._initInputState(this.$input);

    if (this.droppable) {
      this._initDroppable(this);
    }

    this.$input.readOnly = this.readonly;
    this._initEvents();
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

    this.$input.addEventListener("keydown", (t) => {
      if (!this.readonly) {
        if (t.keyCode === 38) {
          a.acceptEvent(t);
          this._stepUp();
        } else if (t.keyCode === 40) {
          a.acceptEvent(t);
          this._stepDown();
        }
      }
    });

    this.$input.addEventListener(
      "mousewheel",
      (t) => {
        if (this.focused) {
          t.stopPropagation();

          this.readonly ||
            (t.deltaY > 0 ? this._stepDown() : this._stepUp(),
            a.fire(this, "confirm", {
              bubbles: true,
              detail: { value: this._value, confirmByEnter: false },
            }));
        }
      },
      { passive: true }
    );

    if (this.droppable) {
      this.addEventListener(
        "drop-area-enter",
        this._onDropAreaEnter.bind(this)
      );

      this.addEventListener(
        "drop-area-leave",
        this._onDropAreaLeave.bind(this)
      );

      this.addEventListener(
        "drop-area-accept",
        this._onDropAreaAccept.bind(this)
      );

      this.addEventListener("drop-area-move", this._onDropAreaMove.bind(this));
    }
  },
  _isTypeValid(t) {
    return (
      t === this.resourceType ||
      cc.js.isChildClassOf(Editor.assets[t], Editor.assets[this.resourceType])
    );
  },
  _onDropAreaMove(t) {
    t.stopPropagation();

    if (this.invalid) {
      _.updateDropEffect(t.detail.dataTransfer, "none");
    } else {
      _.updateDropEffect(t.detail.dataTransfer, "copy");
    }
  },
  async _onDropAreaEnter(t) {
    t.stopPropagation();
    let e = t.detail.dragItems;

    if (!this.checking) {
      this.invalid = !(await this._checkType(e.map((t) => t.id)));
      this.highlighted = !this.invalid;
    }
  },
  _onDropAreaLeave(t) {
    t.stopPropagation();

    if (this._requestID) {
      Editor.Ipc.cancelRequest(this._requestID);
      this._requestID = null;
    }

    this.highlighted = false;
    this.invalid = false;
  },
  _onDropAreaAccept(t) {
    t.stopPropagation();
    this.highlighted = false;
    this.invalid = false;
    this._updateValue(t.detail.dragItems);
  },
  _updateValue(t) {
    let e = t.map((t) => t.id);
    this.$input.value = this._value + e.length;
    this._value += e.length;

    Editor.UI.fire(this, "confirm", {
      bubbles: true,
      detail: { value: this._value, dragItems: t },
    });
  },
  async _checkType(t) {
    this.checking = true;
    let e = false;
    let i = this.parentElement.__vue__;
    if (!i) {
      this.checking = false;
      return e;
    }
    let s = false;
    let n = i.target;

    if (n && n.values && n.values.length === 1) {
      s = !!n.values[0].find((e) => !!t.find((t) => t === e.value.uuid));
    }

    if (s) {
      this.checking = false;
      return e;
    }

    try {
      let i = t.map(async (t) =>
        this.elementType === "cc.Node"
          ? await this._queryNodeInfo(t)
          : await this._queryAssetInfo(t)
      );
      await Promise.all(i);
      e = true;
    } catch (t) {}
    this.checking = false;
    return e;
  },
  async _queryNodeInfo(t) {
    let e = await promisify(Editor.Ipc.sendToPanel)(
      "scene",
      "scene:query-node-info",
      t,
      this.attrType
    );
    this.highlighted = true;

    return this.resourceType !== "cc.Node" && e.compID
      ? Promise.resolve()
      : Promise.reject();
  },
  async _queryAssetInfo(t) {
    let e = await promisify(Editor.assetdb.queryMetaInfoByUuid)(t);
    if (this._isTypeValid(e.assetType)) {
      return Promise.resolve();
    }
    let i = JSON.parse(e.json);
    let s = Object.keys(i.subMetas);
    if (s.length !== 1) {
      return Promise.reject();
    }
    let n = i.subMetas[s[0]].uuid;
    let a = promisify(Editor.assetdb.queryInfoByUuid)(n);
    return this._isTypeValid(a.type) ? Promise.resolve() : Promise.reject();
  },
  _formatValue(t) {
    return t === null || t === ""
      ? ""
      : this._type === "int"
      ? s.toFixed(t, 0)
      : this._precision === 0
      ? s.toFixed(t, this._precision)
      : s.toFixed(t, this._precision, this._precision);
  },
  _clampValue(t) {
    Math.max(this._min, t);

    Math.min(this._max, t);

    return t;
  },
  _parseInput() {
    if (this.$input.value === null) {
      return 0;
    }
    if (this.$input.value.trim() === "") {
      return 0;
    }
    let e = { res: NaN };
    try {
      t.runInNewContext(`\n          res = ${this.$input.value};\n        `, e);
    } catch (t) {}
    let i = this._parseFn(e.res);

    if (isNaN(i)) {
      i = this._parseFn(this.$input._initValue);
      i = this._parseFn(this._formatValue(i));
    } else {
      i = this._parseFn(this._formatValue(i));
    }

    return i;
  },
  _stepUp() {
    let t = this._value;

    if (Array.isArray(t)) {
      t = t[0];
    }

    let e = t + this._step;
    e = this._clampValue(e);
    this.$input.value = this._formatValue(e);
    this._onInputChange();
  },
  _stepDown() {
    let t = this._value;

    if (Array.isArray(t)) {
      t = t[0];
    }

    let e = t - this._step;
    e = this._clampValue(e);
    this.$input.value = this._formatValue(e);
    this._onInputChange();
  },
  _startHolding(t, e) {
    this._curSpin = t;

    this._holdingID = setTimeout(() => {
      this._stepingID = setInterval(() => {
        e.apply(this);
      }, 50);
    }, 500);
  },
  _stopHolding() {
    clearInterval(this._holdingID);
    this._holdingID = null;
    clearTimeout(this._stepingID);
    this._stepingID = null;
    this._curSpin = null;
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
  _onInputConfirm(t, e) {
    if (!this.readonly && this._changed) {
      this._changed = false;
      let i = this._parseInput();
      let s = i;
      i = this._clampValue(i);
      let n = this._formatValue(i);
      t.value = n;
      t._initValue = n;
      this._value = i;

      if (s !== i) {
        a.fire(this, "change", {
          bubbles: true,
          detail: { value: this._value },
        });
      }

      a.fire(this, "confirm", {
        bubbles: true,
        detail: { value: this._value, confirmByEnter: e },
      });
    }

    if (e) {
      this.focus();
    }
  },
  _onInputCancel(t, e) {
    if (!this.readonly && this._changed) {
      this._changed = false;

      if (t._initValue !== t.value) {
        t.value = t._initValue;
        let e = this._parseInput();
        let i = this._formatValue(e);
        t.value = i;
        t._initValue = i;
        this._value = e;

        a.fire(this, "change", {
          bubbles: true,
          detail: { value: this._value },
        });
      }

      a.fire(this, "cancel", {
        bubbles: true,
        detail: { value: this._value, cancelByEsc: e },
      });
    }

    if (e) {
      t.blur();
      this.focus();
    }
  },
  _onInputChange() {
    this._changed = true;
    this._value = this._parseInput();
    this.multiValues = false;
    a.fire(this, "change", { bubbles: true, detail: { value: this._value } });
  },
  _mouseDownHandler(t) {
    t.stopPropagation();
    r._setFocusElement(this);
  },
  _keyDownHandler(t) {
    if (!this.disabled && (t.keyCode === 13 || t.keyCode === 32)) {
      a.acceptEvent(t);
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
});
