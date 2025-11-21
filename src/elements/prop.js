import elementUtils from "./utils.js";
import { getElementStyleSync } from "../utils/css-loader.js";
import domUtils from "../utils/dom-utils.js";
import focusMgr from "../utils/focus-mgr.js";
import focusableBehavior from "../behaviors/focusable.js";
import disableBehavior from "../behaviors/disable.js";
import readonlyBehavior from "../behaviors/readonly.js";
import hintElement from "./hint.js";
// import o from "../../../share/platform"; // 外部依赖，暂时注释

// 创建 platform 占位符
const o = {
  isMac: navigator.platform.toUpperCase().indexOf('MAC') >= 0,
  isWindows: navigator.platform.toUpperCase().indexOf('WIN') >= 0,
  isLinux: navigator.platform.toUpperCase().indexOf('LINUX') >= 0,
};
const r = /\d$/;
let d = null;
let u = false;
let c = 0;
let b = 0;

if (document) {
  document.addEventListener("mouseup", (t) => {
    u = false;
  });
}

let m = elementUtils.registerElement("ui-prop", {
  get name() {
    return this._name;
  },
  set name(t) {
    if (this._name !== t) {
      this._name = t;
      this.$text.innerText = t;
    }
  },
  get slidable() {
    return this.getAttribute("slidable") !== null;
  },
  set slidable(t) {
    if (t) {
      this.setAttribute("slidable", "");
    } else {
      this.removeAttribute("slidable");
    }
  },
  get movable() {
    return this.getAttribute("movable") !== null;
  },
  set movable(t) {
    if (t) {
      this.setAttribute("movable", "");
    } else {
      this.removeAttribute("movable");
    }
  },
  get removable() {
    return this.getAttribute("removable") !== null;
  },
  set removable(t) {
    if (t) {
      this.setAttribute("removable", "");
    } else {
      this.removeAttribute("removable");
    }
  },
  get foldable() {
    return this.getAttribute("foldable") !== null;
  },
  set foldable(t) {
    if (t) {
      this.setAttribute("foldable", "");
    } else {
      this.removeAttribute("foldable");
    }
  },
  get autoHeight() {
    return this.getAttribute("auto-height") !== null;
  },
  set autoHeight(t) {
    if (t) {
      this.setAttribute("auto-height", "");
    } else {
      this.removeAttribute("auto-height");
    }
  },
  get selected() {
    return this.getAttribute("selected") !== null;
  },
  set selected(t) {
    if (t) {
      this.setAttribute("selected", "");
    } else {
      this.removeAttribute("selected");
    }
  },
  get hovering() {
    return this.getAttribute("hovering") !== null;
  },
  set hovering(t) {
    if (t) {
      this.setAttribute("hovering", "");
    } else {
      this.removeAttribute("hovering");
    }
  },
  get indent() {
    return this._indent;
  },
  set indent(t) {
    if (this._indent !== t) {
      let e = parseInt(t);
      this.setAttribute("indent", e);
      this.$label.style.paddingLeft = `${13 * e}px`;
      this._indent = e;
    }
  },
  get multiValues() {
    return this._multiValues;
  },
  set multiValues(t) {
    t = !(t == null || t === false);
    const e = this._multiValues;
    this._multiValues = t;

    if (t) {
      this.setAttribute("multi-values", "");
    } else {
      this.removeAttribute("multi-values");
    }

    if (this.multiValuesChanged) {
      this.multiValuesChanged(e, t);
    }

    return this._multiValues;
  },
  get value() {
    return this._value;
  },
  set value(t) {
    if (this._value !== t) {
      let e = this._value;
      this._value = t;

      if (this.valueChanged) {
        this.valueChanged(e, t);
      }
    }
  },
  get values() {
    return this._values;
  },
  set values(t) {
    if (JSON.stringify(this.values) !== JSON.stringify(t)) {
      let e = this._values;
      this._values = t;

      if (this.valuesChanged) {
        this.valuesChanged(e, t);
      }
    }
  },
  get attrs() {
    return this._attrs;
  },
  set attrs(t) {
    if (this._attrs !== t) {
      let e = this._attrs;
      this._attrs = t;

      if (this.attrsChanged) {
        this.attrsChanged(e, t);
      }
    }
  },
  set type(t) {
    if (this._type !== t) {
      this._type = t;
      this._type !== null && this.regen();
    }
  },
  get type() {
    return this._type;
  },
  get tooltip() {
    return this._tooltip;
  },
  set tooltip(t) {
    if (this._tooltip !== t) {
      this._tooltip = Editor.i18n.format(t);
    }
  },
  get path() {
    return this._path;
  },
  get labelWidth() {
    return this._labelWidth || this.$label.style.width;
  },
  set labelWidth(t) {
    if (t) {
      r.test(t) && (t += "%");
      this._labelWidth = t;
      this.$label.style.width = t;
    }
  },
  get observedAttributes() {
    return [
      "type",
      "name",
      "indent",
      "tooltip",
      "multi-values",
      "label-width",
      "input-type",
      "min",
      "max",
      "step",
      "precision",
    ];
  },
  attributeChangedCallback(t, e, i) {
    if (e !== i) {
      if (
        t == "type" ||
        t == "name" ||
        t == "name" ||
        t == "indent" ||
        t == "name" ||
        t == "indent" ||
        t == "tooltip" ||
        t == "name" ||
        t == "indent" ||
        t == "tooltip" ||
        t == "multi-values" ||
        t == "name" ||
        t == "indent" ||
        t == "tooltip" ||
        t == "multi-values" ||
        t == "label-width"
      ) {
        this[t.replace(/\-(\w)/g, (t, e) => e.toUpperCase())] = i;
      }

      if (
        this._type === "number" &&
        (t === "input-type" ||
          t === "min" ||
          t === "max" ||
          t === "step" ||
          t === "precision")
      ) {
        this.regen();
      }
    }
  },
  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior],
  template:
    '\n    <div class="wrapper">\n      <div class="label">\n        <i class="move icon-braille"></i>\n        <i class="fold icon-fold-up"></i>\n        <span class="text"></span>\n        <div class="resizer">\n            <i class="resizer-icon"></i>\n        </div>\n        <div class="lock">\n          <i class="icon-lock"></i>\n        </div>\n      </div>\n      <div class="wrapper-content">\n        <slot></slot>\n      </div>\n      <div class="remove">\n        <i class="icon-trash-empty"></i>\n      </div>\n    </div>\n    <slot name="child"></slot>\n  ',
  style: getElementStyleSync("prop"),
  $: {
    label: ".label",
    moveIcon: ".move",
    removeIcon: ".remove",
    foldIcon: ".fold",
    text: ".text",
    resizer: ".resizer",
  },
  factoryImpl(t, e, i, s, l) {
    this.name = t || "";
    this.indent = l || 0;
    this._value = e;
    this._attrs = s || {};
    this._type = i || typeof e;
    this.regen();
  },
  ready() {
    if (this.querySelector('[slot="child"]') === null) {
      const t = this.querySelector(".child");

      if (t) {
        t.setAttribute("slot", "child");
      }
    }
    let t = this.getAttribute("name");
    this._name = t !== null ? t : "-";
    let e = this.getAttribute("label-width");

    if (e) {
      this.labelWidth = e;
    }

    this._path = this.getAttribute("path");
    let s = this.getAttribute("indent");

    if (s !== null) {
      s = parseInt(s);
      this.$label.style.paddingLeft = `${13 * s}px`;
    } else {
      s = 0;
    }

    this._indent = s;
    this.multiValues = this.getAttribute("multi-values");

    if (this.getAttribute("folded") !== null) {
      this.fold();
    } else {
      this.foldup();
    }

    if (s >= 1 && this.movable) {
      this.$moveIcon.style.left = `${13 * (s - 1)}px`;
    }

    this.tooltip = this.getAttribute("tooltip");
    this.$text.innerText = this._name;
    this._initFocusable(this);
    this._initDisable(true);
    this._initReadonly(true);
    this._initEvents();
    this._type = this.getAttribute("type");

    if (this._type !== null) {
      this.regen();
    }

    if (this._disabled) {
      domUtils.walk(this, { excludeSelf: true }, (t) => {
        if (t.tagName.indexOf("UI-") === 0) {
          t.setAttribute("is-disabled", "");
        }

        return false;
      });
    }

    if (this._readonly) {
      domUtils.walk(this, { excludeSelf: true }, (t) => {
        if (t.tagName.indexOf("UI-") === 0) {
          t.setAttribute("is-readonly", "");
        }

        return false;
      });
    }

    if (o.isWin32) {
      this.$resizer.classList.add("platform-win");
    }
  },
  connectedCallback() {
    domUtils.fire(this, "ui-prop-connected", { bubbles: true, detail: this });
  },
  fold() {
    if (!this._folded) {
      this._folded = true;
      this.$foldIcon.classList.remove("icon-fold-up");
      this.$foldIcon.classList.add("icon-fold");
      this.setAttribute("folded", "");
    }
  },
  foldup() {
    if (this._folded) {
      this._folded = false;
      this.$foldIcon.classList.remove("icon-fold");
      this.$foldIcon.classList.add("icon-fold-up");
      this.removeAttribute("folded");
    }
  },
  regen(e) {
    elementUtils.regenProperty(this, e);
  },
  installStandardEvents(t) {
    if (typeof this.inputValue != "function") {
      throw new Error("Invalid proto, inputValue is not defined.");
    }

    t.addEventListener("change", () => {
      this._value = this.inputValue();
      this._emitChange();
    });

    t.addEventListener("confirm", () => {
      this._value = this.inputValue();
      this._emitConfirm();
    });

    t.addEventListener("cancel", () => {
      this._value = this.inputValue();
      this._emitCancel();
    });
  },
  installSlideEvents(t, e, i, s) {
    if (!(t instanceof m)) {
      throw new Error("Invalid element, only <ui-prop> has slide events.");
    }
    if (typeof this.inputValue != "function") {
      throw new Error("Invalid proto, inputValue is not defined.");
    }

    t.addEventListener("slide-start", () => {
      this._initValue = this.inputValue();
    });

    t.addEventListener("slide-change", (t) => {
      if (e) {
        e(t.detail.dx, t.detail.dy);
      }

      this._changed = true;
      this._value = this.inputValue();
      this._emitChange();
    });

    t.addEventListener("slide-confirm", () => {
      if (this._changed) {
        this._changed = false;
        this._value = this.inputValue();
        i && i();
        this._emitConfirm();
      }
    });

    t.addEventListener("slide-cancel", () => {
      if (this._changed) {
        this._changed = false;
        this._value = this._initValue;
        s && s();
        this._emitCancel();
      }
    });
  },
  _emitConfirm() {
    domUtils.fire(this, "confirm", {
      bubbles: true,
      detail: { path: this._path, value: this._value },
    });
  },
  _emitCancel() {
    domUtils.fire(this, "cancel", {
      bubbles: true,
      detail: { path: this._path, value: this._value },
    });
  },
  _emitChange() {
    domUtils.fire(this, "change", {
      bubbles: true,
      detail: { path: this._path, value: this._value },
    });
  },
  _emitLabelWidthChange(t) {
    domUtils.fire(this, "label-width-change", { bubbles: true, detail: t });
  },
  _getFirstFocusableElement() {
    let t = s._getFirstFocusableFrom(this, true);
    return t && t.parentElement && t.parentElement.classList.contains("child")
      ? null
      : t;
  },
  _initEvents() {
    function t(t) {
      u = false;
      domUtils.fire(t, "label-width-change-finish", { bubbles: true });
    }

    this.addEventListener("focus-changed", (t) => {
      if (this.parentElement instanceof m) {
        t.stopPropagation();
      }

      this.selected = t.detail.focused;

      if (!this.disabled && t.detail.focused && t.target === this) {
        let t = this._getFirstFocusableElement();

        if (t) {
          s._setFocusElement(t);
        }
      }
    });

    this.addEventListener("mouseover", (t) => {
      t.stopImmediatePropagation();
      this.hovering = true;
    });

    this.addEventListener("mouseout", (t) => {
      t.stopImmediatePropagation();
      this.hovering = false;
    });

    this.$label.addEventListener("mouseenter", () => {
      this._showTooltip();
    });

    this.$label.addEventListener("mouseleave", () => {
      this._hideTooltip();
    });

    this.$moveIcon.addEventListener("mouseenter", () => {
      this.style.backgroundColor = "rgba(0,0,0,0.1)";
    });

    this.$moveIcon.addEventListener("mouseleave", () => {
      this.style.backgroundColor = "";
    });

    this.$removeIcon.addEventListener("mouseenter", () => {
      this.style.backgroundColor = "rgba(255,0,0,0.3)";
      this.style.outline = "1px solid rgba(255,0,0,1)";
    });

    this.$removeIcon.addEventListener("mouseleave", () => {
      this.style.backgroundColor = "";
      this.style.outline = "";
    });

    this.addEventListener("mousedown", (t) => {
      i.acceptEvent(t);

      if (this.disabled) {
        s._setFocusElement(this);
        return undefined;
      }

      if (this.slidable) {
        if (this.readonly) {
          i.startDrag("ew-resize", t);
        } else {
          this._sliding = true;
          domUtils.fire(this, "slide-start", { bubbles: false });

          i.startDrag(
            "ew-resize",
            t,
            (t) => {
              domUtils.fire(this, "slide-change", {
                bubbles: false,
                detail: { dx: t.movementX, dy: t.movementY },
              });
            },
            () => {
              domUtils.fire(this, "slide-confirm", { bubbles: false });
            }
          );
        }
      }

      s._setFocusElement(null);
      let e = this._getFirstFocusableElement();

      if (e) {
        s._setFocusElement(e);
      } else {
        s._setFocusElement(this);
      }
    });

    this.addEventListener("keydown", (t) => {
      switch (t.keyCode) {
        case 13:
        case 27:
          this._sliding;
          break;
        case 37:
          i.acceptEvent(t);
          this.fold();
          break;
        case 39:
          i.acceptEvent(t);
          this.foldup();
          break;
      }
    });

    this.$foldIcon.addEventListener("click", () => {
      if (this._folded) {
        this.foldup();
      } else {
        this.fold();
      }
    });

    this.$resizer.addEventListener("mousedown", (t) => {
      if (!this._readonly && !this.slidable) {
        if (!this.slidable) {
          u = true;
          c = t.pageX;
          b = this.$label.clientWidth;
        }
      }
    });

    this.addEventListener("mousemove", (t) => {
      if (!u) {
        return;
      }
      let e = this.$label;
      let i = e.clientWidth / e.parentElement.clientWidth;
      let s = (b + (t.pageX - c)) / e.parentElement.clientWidth;
      let l = 80;
      let n = getComputedStyle(this.$label).minWidth;

      if (n !== "auto") {
        l = parseFloat(n.substr(0, n.length - 2));
      }

      if ((s <= i || s <= 0.8) && s * (e.clientWidth / i) > l) {
        e.style.width = `${100 * s}%`;
        this._emitLabelWidthChange(e.style.width);
      }
    });

    this.$resizer.addEventListener("mouseup", (e) => {
      t(this);
    });

    this.$resizer.addEventListener("mousecancel", (e) => {
      t(this);
    });

    this.addEventListener("mouseup", (e) => {
      t(this);
    });
  },
  _showTooltip() {
    if (this.tooltip) {
        d ||
          (((d = new hintElement(this._tooltip)).style.display = "none"),
        (d.style.position = "absolute"),
        (d.style.maxWidth = "200px"),
        (d.style.zIndex = "999"),
        (d.classList = "bottom shadow"),
        (d.position = "20px"),
        document.body.appendChild(d));
      d.innerText = this._tooltip;

      this._showTooltipID = setTimeout(() => {
        this._showTooltipID = null;
        d.style.display = "block";
        let t = this.$text.getBoundingClientRect();
        let e = d.getBoundingClientRect();
        d.style.left = t.left - 10;
        d.style.top = t.top - e.height - 10;
      }, 200);
    }
  },
  _hideTooltip() {
    if (this.tooltip) {
      clearTimeout(this._showTooltipID);
      this._showTooltipID = null;
      d && (d.style.display = "none");
    }
  },
});
export default m;
