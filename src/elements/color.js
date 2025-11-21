import chroma from "chroma-js";
import elementUtils from "./utils.js";
import { getElementStyleSync } from "../utils/css-loader.js";
import { acceptEvent, fire } from "../utils/dom-utils.js";
import focusMgr from "../utils/focus-mgr.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";
import readonlyBehavior from "../behaviors/readonly.js";
let e;

// 占位符函数，用于替代可能的外部 API
function addHitGhost(type, zIndex, callback) {
  // 如果这些方法来自外部 API（如 Electron），可以在这里调用
  // 目前作为占位符，不执行任何操作
}

function removeHitGhost() {
  // 如果这些方法来自外部 API（如 Electron），可以在这里调用
  // 目前作为占位符，不执行任何操作
}

export default elementUtils.registerElement("ui-color", {
  get value() {
    return this._value;
  },
  set value(e) {
    if (!e) {
      [0, 0, 0, 1];
    }

    const i = this._value;
    this._value = e;

    if (`${i}` != `${this._value}` && !this._multiValues) {
      if (!this._multiValues) {
        this._draw = chroma(e).rgba();
        this._updateRGB();
        this._updateAlpha();
      }
    }
  },
  get values() {
    return this._values;
  },
  set values(e) {
    const i = this._values;
    this._values = e;

    if (`${i}` != `${e}` && this._multiValues) {
      this._draw = t(e[0]).rgba();
      this._updateRGB();
      this._updateAlpha();
    }
  },
  get multiValues() {
    return this._multiValues;
  },
  set multiValues(e) {
    let t;
    e = !(e == null || e === false);

    if (this._multiValues !== e) {
      this._multiValues = e;

      e
        ? (this._values && (t = this._values[0]),
          this.setAttribute("multi-values", ""))
        : ((t = this._value), this.removeAttribute("multi-values"));

      t && (this._updateRGB(), this._updateAlpha());
    }
  },
  get observedAttributes() {
    return ["multi-values"];
  },
  attributeChangedCallback(e, t, i) {
    if (t !== i && e == "multi-values") {
      this[e.replace(/\-(\w)/g, (e, t) => t.toUpperCase())] = i;
    }
  },
  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior],
  template:
    '\n    <div class="inner">\n      <div class="rgb"></div>\n      <div class="alpha"></div>\n    </div>\n    <div class="mask"></div>\n  ',
  style: getElementStyleSync("color"),
  $: { rgb: ".rgb", alpha: ".alpha" },
  factoryImpl(e) {
    if (e) {
      this.value = e;
    }
  },
  ready() {
    this._showing = false;
    let t = this.getAttribute("value");
    this.value = t !== null ? t : [255, 255, 255, 1];
    this.multiValues = this.getAttribute("multi-values");
    this._updateRGB();
    this._updateAlpha();
    this._initFocusable(this);
    this._initDisable(false);
    this._initReadonly(false);
    this._initEvents();

    if (!e) {
      (e = document.createElement("ui-color-picker")).style.position = "fixed";
      e.style.zIndex = 999;
      e.style.display = "none";
    }
  },
  detachedCallback() {
    this._showColorPicker(false);
  },
  _initEvents() {
    this.addEventListener("mousedown", (t) => {
      if (!this.disabled) {
        acceptEvent(t);
        focusMgr._setFocusElement(this);

        this.readonly ||
          (this._showing
            ? this._showColorPicker(false)
            : ((e.value = this._draw), this._showColorPicker(true)));
      }
    });

    this.addEventListener("keydown", (t) => {
      if (
        !this.readonly &&
        !this.disabled &&
        (t.keyCode === 13 || t.keyCode === 32)
      ) {
        acceptEvent(t);
        e.value = this._draw;
        this._showColorPicker(true);
      }
    });

    this._hideFn = (e) => {
      if (this._changed) {
        this._changed = false;

        e.detail.confirm
          ? ((this._initValue = this._value),
            fire(this, "confirm", {
              bubbles: true,
              detail: { value: this._value },
            }))
          : (this._initValue !== this._value &&
              ((this.value = this._initValue),
              fire(this, "change", {
                bubbles: true,
                detail: { value: this._value },
              })),
            fire(this, "cancel", {
              bubbles: true,
              detail: { value: this._value },
            }));
      }

      this._showColorPicker(false);
    };

    this._changeFn = (e) => {
      this._changed = true;
      this.multiValues = false;
      acceptEvent(e);

      this.value = e.detail.value.map((e) => e);

      fire(this, "change", {
        bubbles: true,
        detail: { value: this._value },
      });
    };
  },
  _updateRGB() {
    this.$rgb.style.backgroundColor = t(this._draw.slice(0, 3)).hex();
  },
  _updateAlpha() {
    this.$alpha.style.width = `${100 * this._draw[3]}%`;
  },
  _equals(e) {
    return (
      this._value.length === e.length &&
      this._value[0] === e[0] &&
      this._value[1] === e[1] &&
      this._value[2] === e[2] &&
      this._value[3] === e[3]
    );
  },
  _showColorPicker(t) {
    if (this._showing !== t) {
      this._showing = t;

      t
        ? ((this._initValue = this._draw),
          e.addEventListener("hide", this._hideFn),
          e.addEventListener("change", this._changeFn),
          e.addEventListener("confirm", this._confirmFn),
          e.addEventListener("cancel", this._cancelFn),
          addHitGhost("default", 998, () => {
            e.hide(true);
          }),
          document.body.appendChild(e),
          (e._target = this),
          (e.style.display = "block"),
          this._updateColorPickerPosition(),
          focusMgr._setFocusElement(e))
        : (e.removeEventListener("hide", this._hideFn),
          e.removeEventListener("change", this._changeFn),
          e.removeEventListener("confirm", this._confirmFn),
          e.removeEventListener("cancel", this._cancelFn),
          removeHitGhost(),
          (e._target = null),
          e.remove(),
          (e.style.display = "none"),
          focusMgr._setFocusElement(this));
    }
  },
  _updateColorPickerPosition() {
    window.requestAnimationFrame(() => {
      if (!this._showing) {
        return;
      }
      let t = document.body.getBoundingClientRect();
      let i = this.getBoundingClientRect();
      let s = e.getBoundingClientRect();
      let e_style = e.style;
      e_style.left = `${i.right - s.width}px`;

      if (t.height - i.bottom <= s.height + 10) {
        e_style.top = `${t.bottom - s.height - 10}px`;
      } else {
        e_style.top = `${i.bottom - t.top + 10}px`;
      }

      if (t.width - i.left <= s.width) {
        e_style.left = `${t.right - s.width - 10}px`;
      } else {
        e_style.left = `${i.left - t.left}px`;
      }

      this._updateColorPickerPosition();
    });
  },
});
