import e from "./utils.js";
// import t from "../../../share/platform"; // 外部依赖，暂时注释
import i from "../utils/resource-mgr.js";
import s from "../utils/dom-utils.js";
import a from "../utils/focus-mgr.js";
import u from "../behaviors/focusable.js";
import l from "../behaviors/disable.js";
import n from "../behaviors/readonly.js";
import h from "../behaviors/input-state.js";

// 创建 platform 占位符
const t = {
  isMac: navigator.platform.toUpperCase().indexOf('MAC') >= 0,
  isWindows: navigator.platform.toUpperCase().indexOf('WIN') >= 0,
  isLinux: navigator.platform.toUpperCase().indexOf('LINUX') >= 0,
};
let r = "⌘ + enter";

if (t.isWin32) {
  r = "ctrl + enter";
}

export default e.registerElement("ui-text-area", {
  get value() {
    return this._value;
  },
  set value(e) {
    if (e === null || e === undefined) {
      e = "";
    }

    e += "";
    this._value = e;

    if (!this._multiValues) {
      if (this._maxLength !== null) {
        this.$input.value = e.substr(0, this._maxLength);
      } else {
        this.$input.value = e;
      }
    }
  },
  get values() {
    return this._values;
  },
  set values(e) {
    this._values = e;

    if (this.multiValues) {
      this.$input.value = "-";
    }
  },
  get placeholder() {
    return this.$input.placeholder;
  },
  set placeholder(e) {
    this.$input.placeholder = e;
  },
  get maxLength() {
    return this._maxLength;
  },
  set maxLength(e) {
    if (e !== null) {
      e -= 0;
    }

    if (isNaN(e)) {
      e = null;
    }

    this._maxLength = e;

    if (e) {
      this.$input.value = this._value.substr(0, this._maxLength);
    }
  },
  get multiValues() {
    return this._multiValues;
  },
  set multiValues(e) {
    if ((e = !(e == null || e === false)) !== this._multiValues) {
      this._multiValues = e;

      e
        ? ((this.$input.value = "-"), this.setAttribute("multi-values", ""))
        : ((this.$input.value = this._value),
          this.removeAttribute("multi-values"));
    }
  },
  get observedAttributes() {
    return ["placeholder", "max-length", "multi-values"];
  },
  attributeChangedCallback(e, t, i) {
    if (t !== i) {
      switch (e) {
        case "multi-values":
        case "placeholder":
        case "max-length": {
          this[e.replace(/\-(\w)/g, (e, t) => t.toUpperCase())] = i;
        }
      }
    }
  },
  behaviors: [u, l, n, h],
  template: `\n    <div class="back">\n      <span>${r}</span>\n    </div>\n    <textarea></textarea>\n  `,
  style: i.getResource("theme://elements/text-area.css"),
  $: { input: "textarea", span: "span" },
  factoryImpl(e) {
    if (e) {
      this.value = e;
    }
  },
  ready() {
    this._value = "";
    this._values = [""];
    this.value = this.getAttribute("value");
    this.placeholder = this.getAttribute("placeholder") || "";
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
    this._value = "";
    this._values = [""];
    this.$input.value = "";
    this.confirm();
  },
  confirm() {
    this._onInputConfirm(this.$input);
  },
  cancel() {
    this._onInputCancel(this.$input);
  },
  _initEvents() {
    this.addEventListener("mousedown", this._mouseDownHandler);
    this.addEventListener("keydown", this._keyDownHandler);
    this.addEventListener("focus-changed", this._focusChangedHandler);

    this.$input.addEventListener("focus", () => {
      this.$span.style.display = "inline-block";
    });

    this.$input.addEventListener("blur", () => {
      this.$span.style.display = "none";
    });
  },
  _onInputConfirm(e, t) {
    if (!this.readonly) {
      if (this._changed) {
        this._changed = false;
        e._initValue = e.value;
        this._value = e.value;
        this.multiValues = false;

        s.fire(this, "confirm", {
          bubbles: true,
          detail: { value: e.value, confirmByEnter: t },
        });
      }
    }

    if (t) {
      this.focus();
    }
  },
  _onInputCancel(e, t) {
    if (!this.readonly) {
      if (this._changed) {
        this._changed = false;

        e._initValue !== e.value &&
          ((this._value = e.value = e._initValue),
          s.fire(this, "change", {
            bubbles: true,
            detail: { value: e.value },
          }));

        s.fire(this, "cancel", {
          bubbles: true,
          detail: { value: e.value, cancelByEsc: t },
        });
      }
    }

    if (t) {
      e.blur();
      this.focus();
    }
  },
  _onInputChange(e) {
    this._changed = true;

    if (this._maxLength && e.value.length > this._maxLength) {
      e.value = e.value.substr(0, this._maxLength);
    }

    this._value = e.value;
    s.fire(this, "change", { bubbles: true, detail: { value: e.value } });
  },
  _mouseDownHandler(e) {
    e.stopPropagation();
    a._setFocusElement(this);
  },
  _keyDownHandler(e) {
    if (!this.disabled && (e.keyCode === 13 || e.keyCode === 32)) {
      s.acceptEvent(e);
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
