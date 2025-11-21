import chroma from "chroma-js";
import elementUtils from "./utils.js";
import mathUtils from "../share/math";
import { getElementStyleSync } from "../utils/css-loader.js";
import domUtils from "../utils/dom-utils.js";
import focusMgr from "../utils/focus-mgr.js";
import focusableBehavior from "../behaviors/focusable.js";

// 创建占位符
const t = null; // Electron remote 在浏览器中不可用

const { Menu, MenuItem } = t;

export default elementUtils.registerElement("ui-color-picker", {
  get value() {
    return this._value;
  },
  set value(t) {
    let i = chroma(t).rgba();

    if (i !== this._value) {
      this._value = i;
      this._lastAssigned = i.slice(0);
      this._updateColorDiff();
      this._updateHue();
      this._updateAlpha();
      this._updateColor();
      this._updateSliders();
      this._updateHexInput();
    }
  },
  behaviors: [focusableBehavior],
  template:
    '\n    <div class="hbox">\n      <div class="hue ctrl" tabindex="-1">\n        <div class="hue-handle">\n          <i class="icon-right-dir"></i>\n        </div>\n      </div>\n      <div class="color ctrl" tabindex="-1">\n        <div class="color-handle">\n          <i class="icon-circle-empty"></i>\n        </div>\n      </div>\n      <div class="alpha ctrl" tabindex="-1">\n        <div class="alpha-handle">\n          <i class="icon-left-dir"></i>\n        </div>\n      </div>\n    </div>\n\n    <div class="vbox">\n      <div class="prop">\n        <span class="red tag">R</span>\n        <ui-slider id="r-slider" step=1 precision=0 min=0 max=255></ui-slider>\n      </div>\n      <div class="prop">\n        <span class="green">G</span>\n        <ui-slider id="g-slider" step=1 precision=0 min=0 max=255></ui-slider>\n      </div>\n      <div class="prop">\n        <span class="blue">B</span>\n        <ui-slider id="b-slider" step=1 precision=0 min=0 max=255></ui-slider>\n      </div>\n      <div class="prop">\n        <span class="gray">A</span>\n        <ui-slider id="a-slider" step=1 precision=0 min=0 max=255></ui-slider>\n      </div>\n      <div class="hex-field">\n        <div class="color-block old">\n          <div id="old-color" class="color-inner"></div>\n        </div>\n        <div class="color-block new">\n          <div id="new-color" class="color-inner"></div>\n        </div>\n        <span class="space"></span>\n        <div class="label">Hex Color</div>\n        <ui-input id="hex-input"></ui-input>\n      </div>\n\n      <div class="title">\n        <div>Presets</div>\n          <ui-button id="btn-add" class="transparent tiny">\n            <i class="icon-plus"></i>\n          </ui-button>\n        </div>\n      <div class="hbox palette"></div>\n    </div>\n  ',
  style: getElementStyleSync("color-picker"),
  $: {
    hueHandle: ".hue-handle",
    colorHandle: ".color-handle",
    alphaHandle: ".alpha-handle",
    hueCtrl: ".hue.ctrl",
    colorCtrl: ".color.ctrl",
    alphaCtrl: ".alpha.ctrl",
    sliderR: "#r-slider",
    sliderG: "#g-slider",
    sliderB: "#b-slider",
    sliderA: "#a-slider",
    newColor: "#new-color",
    oldColor: "#old-color",
    hexInput: "#hex-input",
    colorPresets: ".color-box",
    btnAdd: "#btn-add",
    palette: ".palette",
  },
  factoryImpl(t) {
    if (t) {
      this.value = t;
    }
  },
  ready() {
    let t = this.getAttribute("value");
    this._value = t !== null ? chroma(t).rgba() : [255, 255, 255, 1];
    this._lastAssigned = this._value.slice(0);
    let i = Editor.Profile.load("global://settings.json").get(
      "ui-color-picker"
    );
    this._settings = i || { colors: [] };
    this._initPalette();
    this._updateColorDiff();
    this._updateHue();
    this._updateColor();
    this._updateAlpha();
    this._updateSliders();
    this._updateHexInput();
    this._initFocusable(this);
    this._initEvents();
  },
  hide(t) {
    domUtils.fire(this, "hide", { bubbles: false, detail: { confirm: t } });
  },
  _initEvents() {
    this.addEventListener("keydown", (t) => {
      if (t.keyCode === 13 || t.keyCode === 32) {
        domUtils.acceptEvent(t);
        this.hide(true);
      } else if (t.keyCode === 27) {
        domUtils.acceptEvent(t);
        this.hide(false);
      }
    });

    this.$hueCtrl.addEventListener("mousedown", (t) => {
      domUtils.acceptEvent(t);
      focusMgr._setFocusElement(this);
      this.$hueCtrl.focus();
      let i = this._value[3];
      this._initValue = this._value;
      this._dragging = true;
      let s = this.$hueCtrl.getBoundingClientRect();
      let l = (t.clientY - s.top) / this.$hueCtrl.clientHeight;
      this.$hueHandle.style.top = `${100 * l}%`;
      let n = 360 * (1 - l);
      let d = chroma(this._value).hsv();
      this._value = chroma(n, d[1], d[2], "hsv").rgba();
      this._value[3] = i;
      this._updateColorDiff();
      this._updateColor(n);
      this._updateAlpha();
      this._updateSliders();
      this._updateHexInput();
      this._emitChange();

      domUtils.startDrag(
        "ns-resize",
        t,
        (t) => {
          let l = (t.clientY - s.top) / this.$hueCtrl.clientHeight;
          l = mathUtils.clamp(l, 0, 1);
          this.$hueHandle.style.top = `${100 * l}%`;
          let n = 360 * (1 - l);
          let h = chroma(this._value).hsv();
          this._value = chroma(n, h[1], h[2], "hsv").rgba();
          this._value[3] = i;
          this._updateColorDiff();
          this._updateColor(n);
          this._updateAlpha();
          this._updateSliders();
          this._updateHexInput();
          this._emitChange();
        },
        () => {
          this._dragging = false;
          let t = 360 * (1 - parseFloat(this.$hueHandle.style.top) / 100);
          this._updateColorDiff();
          this._updateColor(t);
          this._updateAlpha();
          this._updateSliders();
          this._updateHexInput();
          this._emitConfirm();
        }
      );
    });

    this.$hueCtrl.addEventListener("keydown", (t) => {
      if (t.keyCode === 27 && this._dragging) {
        domUtils.acceptEvent(t);
        this._dragging = false;
        domUtils.cancelDrag();
        this._value = this._initValue;
        this._updateColorDiff();
        this._updateHue();
        this._updateColor();
        this._updateAlpha();
        this._updateSliders();
        this._updateHexInput();
        this._emitChange();
        this._emitCancel();
      }
    });

    this.$alphaCtrl.addEventListener("mousedown", (t) => {
      domUtils.acceptEvent(t);
      focusMgr._setFocusElement(this);
      this.$alphaCtrl.focus();
      this._initValue = this._value.slice();
      this._dragging = true;
      let e = this.$alphaCtrl.getBoundingClientRect();
      let i = (t.clientY - e.top) / this.$alphaCtrl.clientHeight;
      this.$alphaHandle.style.top = `${100 * i}%`;
      this._value[3] = parseFloat((1 - i).toFixed(3));
      this._updateColorDiff();
      this._updateSliders();
      this._emitChange();

      domUtils.startDrag(
        "ns-resize",
        t,
        (t) => {
          let i = (t.clientY - e.top) / this.$hueCtrl.clientHeight;
          i = mathUtils.clamp(i, 0, 1);
          this.$alphaHandle.style.top = `${100 * i}%`;
          this._value[3] = parseFloat((1 - i).toFixed(3));
          this._updateColorDiff();
          this._updateSliders();
          this._emitChange();
        },
        () => {
          this._dragging = false;
          this._updateSliders();
          this._emitConfirm();
        }
      );
    });

    this.$alphaCtrl.addEventListener("keydown", (t) => {
      if (t.keyCode === 27 && this._dragging) {
        domUtils.acceptEvent(t);
        this._dragging = false;
        domUtils.cancelDrag();
        this._value = this._initValue;
        this._updateColorDiff();
        this._updateAlpha();
        this._updateSliders();
        this._emitChange();
        this._emitCancel();
      }
    });

    this.$colorCtrl.addEventListener("mousedown", (t) => {
      domUtils.acceptEvent(t);
      focusMgr._setFocusElement(this);
      this.$colorCtrl.focus();
      let i = 360 * (1 - parseFloat(this.$hueHandle.style.top) / 100);
      let s = this._value[3];
      this._initValue = this._value.slice();
      this._dragging = true;
      let l = this.$colorCtrl.getBoundingClientRect();
      let n = (t.clientX - l.left) / this.$colorCtrl.clientWidth;
      let d = (t.clientY - l.top) / this.$colorCtrl.clientHeight;
      let r = d * d * (3 - 2 * d);
      r *= 255;
      this.$colorHandle.style.left = `${100 * n}%`;
      this.$colorHandle.style.top = `${100 * d}%`;
      this.$colorHandle.style.color = chroma(r, r, r).hex();
      this._value = chroma(i, n, 1 - d, "hsv").rgba();
      this._value[3] = s;
      this._updateColorDiff();
      this._updateAlpha();
      this._updateSliders();
      this._updateHexInput();
      this._emitChange();

      domUtils.startDrag(
        "default",
        t,
        (t) => {
          let n = (t.clientX - l.left) / this.$colorCtrl.clientWidth;
          let h = (t.clientY - l.top) / this.$colorCtrl.clientHeight;
          n = mathUtils.clamp(n, 0, 1);
          let o = (h = mathUtils.clamp(h, 0, 1)) * h * (3 - 2 * h);
          o *= 255;
          this.$colorHandle.style.left = `${100 * n}%`;
          this.$colorHandle.style.top = `${100 * h}%`;
          this.$colorHandle.style.color = chroma(o, o, o).hex();
          this._value = chroma(i, n, 1 - h, "hsv").rgba();
          this._value[3] = s;
          this._updateColorDiff();
          this._updateAlpha();
          this._updateSliders();
          this._updateHexInput();
          this._emitChange();
        },
        () => {
          this._dragging = false;
          this._updateColorDiff();
          this._updateAlpha();
          this._updateSliders();
          this._updateHexInput();
          this._emitConfirm();
        }
      );
    });

    this.$colorCtrl.addEventListener("keydown", (t) => {
      if (t.keyCode === 27 && this._dragging) {
        domUtils.acceptEvent(t);
        this._dragging = false;
        domUtils.cancelDrag();
        this._value = this._initValue;
        this._updateColorDiff();
        this._updateColor();
        this._updateAlpha();
        this._updateSliders();
        this._updateHexInput();
        this._emitChange();
        this._emitCancel();
      }
    });

    this.$sliderR.addEventListener("change", (t) => {
      t.stopPropagation();
      this._value[0] = parseInt(t.detail.value);
      this._updateColorDiff();
      this._updateHue();
      this._updateColor();
      this._updateAlpha();
      this._updateHexInput();
      this._emitChange();
    });

    this.$sliderR.addEventListener("confirm", (t) => {
      t.stopPropagation();
      this._emitConfirm();
    });

    this.$sliderR.addEventListener("cancel", (t) => {
      t.stopPropagation();
      this._emitCancel();
    });

    this.$sliderG.addEventListener("change", (t) => {
      t.stopPropagation();
      this._value[1] = parseInt(t.detail.value);
      this._updateColorDiff();
      this._updateHue();
      this._updateColor();
      this._updateAlpha();
      this._updateHexInput();
      this._emitChange();
    });

    this.$sliderG.addEventListener("confirm", (t) => {
      t.stopPropagation();
      this._emitConfirm();
    });

    this.$sliderG.addEventListener("cancel", (t) => {
      t.stopPropagation();
      this._emitCancel();
    });

    this.$sliderB.addEventListener("change", (t) => {
      t.stopPropagation();
      this._value[2] = parseInt(t.detail.value);
      this._updateColorDiff();
      this._updateHue();
      this._updateColor();
      this._updateAlpha();
      this._updateHexInput();
      this._emitChange();
    });

    this.$sliderB.addEventListener("confirm", (t) => {
      t.stopPropagation();
      this._emitConfirm();
    });

    this.$sliderB.addEventListener("cancel", (t) => {
      t.stopPropagation();
      this._emitCancel();
    });

    this.$sliderA.addEventListener("change", (t) => {
      t.stopPropagation();
      this._value[3] = parseFloat(t.detail.value / 255);
      this._updateColorDiff();
      this._updateAlpha();
      this._emitChange();
    });

    this.$sliderA.addEventListener("confirm", (t) => {
      t.stopPropagation();
      this._emitConfirm();
    });

    this.$sliderA.addEventListener("cancel", (t) => {
      t.stopPropagation();
      this._emitCancel();
    });

    this.$hexInput.addEventListener("change", (t) => {
      t.stopPropagation();
    });

    this.$hexInput.addEventListener("cancel", (t) => {
      t.stopPropagation();
    });

    this.$hexInput.addEventListener("confirm", (t) => {
      t.stopPropagation();
      let i = this._value[3];
      this._value = chroma(t.detail.value).rgba();
      this._value[3] = i;
      this._updateColorDiff();
      this._updateHue();
      this._updateColor();
      this._updateAlpha();
      this._updateSliders();
      this._updateHexInput();
      this._emitChange();
      this._emitConfirm();
    });

    this.$btnAdd.addEventListener("confirm", (t) => {
      t.stopPropagation();
      let i = chroma(this._value).css();
      let s = this._newColorBox(i);
      this.$palette.appendChild(s);
      this._settings.colors.push(i);
      this._saveSettings();
    });
  },
  _initPalette() {
    this._settings.colors.forEach((t) => {
      let e = this._newColorBox(t);
      this.$palette.appendChild(e);
    });
  },
  _newColorBox(l) {
    let a = document.createElement("div");
    a.classList.add("color-box");
    let n = document.createElement("div");
    n.classList.add("inner");
    n.style.backgroundColor = l;
    a.appendChild(n);

    a.addEventListener("contextmenu", (l) => {
      l.preventDefault();
      const o = new Menu();

      o.append(
        new MenuItem({
          label: "Replace",
          click: () => {
            let t = domUtils.index(a);
            let i = chroma(this._value).css();
            n.style.backgroundColor = i;
            this._settings.colors[t] = i;
            this._saveSettings();
          },
        })
      );

      o.append(
        new MenuItem({
          label: "Delete",
          click: () => {
            let t = domUtils.index(a);
            a.remove();
            this._settings.colors.splice(t, 1);
            this._saveSettings();
          },
        })
      );

      o.popup(t.getCurrentWindow());
    });

    a.addEventListener("mousedown", (t) => {
      t.stopPropagation();

      if (t.button === 0) {
        this._value = chroma(n.style.backgroundColor).rgba();
        this._updateColorDiff();
        this._updateHue();
        this._updateColor();
        this._updateAlpha();
        this._updateSliders();
        this._updateHexInput();
        this._emitChange();
        this._emitConfirm();
        return undefined;
      }
    });

    return a;
  },
  _saveSettings() {
    let t = Editor.Profile.load("global://settings.json");
    t.set("ui-color-picker", this._settings);
    t.save();
  },
  _updateColorDiff() {
    this.$oldColor.style.backgroundColor = chroma(this._lastAssigned).css();
    this.$newColor.style.backgroundColor = chroma(this._value).css();
  },
  _updateHue() {
    let t = chroma(this._value).hsv();

    if (isNaN(t[0])) {
      t[0] = 360;
    }

    this.$hueHandle.style.top = `${100 * (1 - t[0] / 360)}%`;
  },
  _updateColor(t) {
    let i = chroma(this._value).hsv();

    if (isNaN(i[0])) {
      i[0] = 360;
    }

    let s = t === undefined ? i[0] : t;
    let [, l, a] = i;
    let n = 1 - a;
    n = n * n * (3 - 2 * n);
    n *= 255;
    this.$colorCtrl.style.backgroundColor = chroma(s, 1, 1, "hsv").hex();
    this.$colorHandle.style.left = `${100 * l}%`;
    this.$colorHandle.style.top = `${100 * (1 - a)}%`;
    this.$colorHandle.style.color = chroma(n, n, n).hex();
  },
  _updateAlpha() {
    this.$alphaCtrl.style.backgroundColor = chroma(
      this._value[0],
      this._value[1],
      this._value[2]
    ).hex();

    this.$alphaHandle.style.top = `${100 * (1 - this._value[3])}%`;
  },
  _updateSliders() {
    this.$sliderR.value = this._value[0];
    this.$sliderG.value = this._value[1];
    this.$sliderB.value = this._value[2];
    this.$sliderA.value = parseInt(255 * this._value[3]);
  },
  _updateHexInput() {
    this.$hexInput.value = chroma(this._value).hex().toUpperCase();
  },
  _emitConfirm() {
    domUtils.fire(this, "confirm", { bubbles: true, detail: { value: this._value } });
  },
  _emitCancel() {
    domUtils.fire(this, "cancel", { bubbles: true, detail: { value: this._value } });
  },
  _emitChange() {
    domUtils.fire(this, "change", { bubbles: true, detail: { value: this._value } });
  },
});
