import chroma from "chroma-js";
import elementUtils from "./utils.js";
import { getElementStyleSync } from "../utils/css-loader.js";
import { fire, acceptEvent } from "../utils/dom-utils.js";
import focusMgr from "../utils/focus-mgr.js";
import focusableBehavior from "../behaviors/focusable.js";

// 浏览器兼容的设置存储系统（使用 localStorage）
const SettingsStorage = {
  STORAGE_KEY: "ui-color-picker-settings",
  
  load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("[color-picker] Failed to load settings:", e);
    }
    return null;
  },
  
  save(settings) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("[color-picker] Failed to save settings:", e);
    }
  },
  
  get(key) {
    const settings = this.load();
    return settings ? settings[key] : null;
  },
  
  set(key, value) {
    const settings = this.load() || {};
    settings[key] = value;
    this.save(settings);
  }
};

// 浏览器版本的右键菜单
class ContextMenu {
  constructor() {
    this.menu = null;
    this.items = [];
  }
  
  append(item) {
    this.items.push(item);
  }
  
  popup(event) {
    // 移除已存在的菜单
    this._removeMenu();
    
    // 创建菜单元素
    this.menu = document.createElement("div");
    this.menu.className = "ui-color-picker-context-menu";
    this.menu.style.cssText = `
      position: fixed;
      z-index: 10000;
      background: #2d2d2d;
      border: 1px solid #555;
      border-radius: 4px;
      padding: 4px 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      min-width: 120px;
      font-size: 12px;
    `;
    
    // 创建菜单项
    this.items.forEach((item) => {
      const menuItem = document.createElement("div");
      menuItem.className = "ui-color-picker-menu-item";
      menuItem.textContent = item.options.label;
      menuItem.style.cssText = `
        padding: 6px 16px;
        cursor: pointer;
        color: #e0e0e0;
        user-select: none;
      `;
      
      menuItem.addEventListener("mouseenter", () => {
        menuItem.style.backgroundColor = "#3d3d3d";
      });
      
      menuItem.addEventListener("mouseleave", () => {
        menuItem.style.backgroundColor = "transparent";
      });
      
      menuItem.addEventListener("click", (e) => {
        e.stopPropagation();
        if (item.options.click) {
          item.options.click();
        }
        this._removeMenu();
      });
      
      this.menu.appendChild(menuItem);
    });
    
    // 定位菜单
    const x = event.clientX;
    const y = event.clientY;
    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;
    
    // 添加到文档
    document.body.appendChild(this.menu);
    
    // 点击外部关闭菜单
    const closeHandler = (e) => {
      if (!this.menu.contains(e.target)) {
        this._removeMenu();
        document.removeEventListener("click", closeHandler);
        document.removeEventListener("contextmenu", closeHandler);
      }
    };
    
    // 使用 setTimeout 确保当前事件处理完成后再添加监听器
    setTimeout(() => {
      document.addEventListener("click", closeHandler);
      document.addEventListener("contextmenu", closeHandler);
    }, 0);
  }
  
  _removeMenu() {
    if (this.menu && this.menu.parentNode) {
      this.menu.parentNode.removeChild(this.menu);
      this.menu = null;
    }
  }
}

class MenuItem {
  constructor(options) {
    this.options = options;
  }
}

const template = /*html*/ `
    <div class="hbox">
      <div class="hue ctrl" tabindex="-1">
        <div class="hue-handle">
          <i class="icon-right-dir"></i>
        </div>
      </div>
      <div class="color ctrl" tabindex="-1">
        <div class="color-handle">
          <i class="icon-circle-empty"></i>
        </div>
      </div>
      <div class="alpha ctrl" tabindex="-1">
        <div class="alpha-handle">
          <i class="icon-left-dir"></i>
        </div>
      </div>
    </div>

    <div class="vbox">
      <div class="prop">
        <span class="red tag">R</span>
        <ui-slider id="r-slider" step=1 precision=0 min=0 max=255></ui-slider>
      </div>
      <div class="prop">
        <span class="green">G</span>
        <ui-slider id="g-slider" step=1 precision=0 min=0 max=255></ui-slider>
      </div>
      <div class="prop">
        <span class="blue">B</span>
        <ui-slider id="b-slider" step=1 precision=0 min=0 max=255></ui-slider>
      </div>
      <div class="prop">
        <span class="gray">A</span>
        <ui-slider id="a-slider" step=1 precision=0 min=0 max=255></ui-slider>
      </div>
      <div class="hex-field">
        <div class="color-block old">
          <div id="old-color" class="color-inner"></div>
        </div>
        <div class="color-block new">
          <div id="new-color" class="color-inner"></div>
        </div>
        <span class="space"></span>
        <div class="label">Hex Color</div>
        <ui-input id="hex-input"></ui-input>
      </div>

      <div class="title">
        <div>Presets</div>
          <ui-button id="btn-add" class="transparent tiny">
            <i class="icon-plus"></i>
          </ui-button>
        </div>
      <div class="hbox palette"></div>
    </div>
  `;

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
  template,
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
    // 使用浏览器兼容的设置存储
    let i = SettingsStorage.get("ui-color-picker");
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
    fire(this, "hide", { bubbles: false, detail: { confirm: t } });
  },
  _initEvents() {
    this.addEventListener("keydown", (t) => {
      if (t.keyCode === 13 || t.keyCode === 32) {
        acceptEvent(t);
        this.hide(true);
      } else if (t.keyCode === 27) {
        acceptEvent(t);
        this.hide(false);
      }
    });

    this.$hueCtrl.addEventListener("mousedown", (t) => {
      acceptEvent(t);
      focusMgr._setFocusElement(this);
      this.$hueCtrl.focus();
      let i = this._value[3];
      this._initValue = this._value;
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
    });

    this.$hueCtrl.addEventListener("keydown", (t) => {
      if (t.keyCode === 27) {
        acceptEvent(t);
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
      acceptEvent(t);
      focusMgr._setFocusElement(this);
      this.$alphaCtrl.focus();
      this._initValue = this._value.slice();
      let e = this.$alphaCtrl.getBoundingClientRect();
      let i = (t.clientY - e.top) / this.$alphaCtrl.clientHeight;
      this.$alphaHandle.style.top = `${100 * i}%`;
      this._value[3] = parseFloat((1 - i).toFixed(3));
      this._updateColorDiff();
      this._updateSliders();
      this._emitChange();
    });

    this.$alphaCtrl.addEventListener("keydown", (t) => {
      if (t.keyCode === 27) {
        acceptEvent(t);
        this._value = this._initValue;
        this._updateColorDiff();
        this._updateAlpha();
        this._updateSliders();
        this._emitChange();
        this._emitCancel();
      }
    });

    this.$colorCtrl.addEventListener("mousedown", (t) => {
      acceptEvent(t);
      focusMgr._setFocusElement(this);
      this.$colorCtrl.focus();
      let i = 360 * (1 - parseFloat(this.$hueHandle.style.top) / 100);
      let s = this._value[3];
      this._initValue = this._value.slice();
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
    });

    this.$colorCtrl.addEventListener("keydown", (t) => {
      if (t.keyCode === 27) {
        acceptEvent(t);
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
      const o = new ContextMenu();

      o.append(
        new MenuItem({
          label: "Replace",
          click: () => {
            let t = Array.from(a.parentElement.children).indexOf(a);
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
            let t = Array.from(a.parentElement.children).indexOf(a);
            a.remove();
            this._settings.colors.splice(t, 1);
            this._saveSettings();
          },
        })
      );

      // 在浏览器环境中显示自定义右键菜单
      o.popup(l);
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
    // 使用浏览器兼容的设置存储
    SettingsStorage.set("ui-color-picker", this._settings);
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
    fire(this, "confirm", { bubbles: true, detail: { value: this._value } });
  },
  _emitCancel() {
    fire(this, "cancel", { bubbles: true, detail: { value: this._value } });
  },
  _emitChange() {
    fire(this, "change", { bubbles: true, detail: { value: this._value } });
  },
});
