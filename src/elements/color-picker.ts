/**
 * UI Color Picker 组件
 */

import chroma from "chroma-js";
import elementUtils from "../utils/utils";
import { getElementStyleSync } from "../utils/css-loader";
import { fire, acceptEvent } from "../utils/dom-utils";
import focusMgr from "../utils/focus-mgr";
import focusableBehavior from "../behaviors/focusable";

// 浏览器兼容的设置存储系统（使用 localStorage）
interface ColorPickerSettings {
  colors: string[];
}

const SettingsStorage = {
  STORAGE_KEY: "ui-color-picker-settings",
  
  load(): ColorPickerSettings | null {
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
  
  save(settings: ColorPickerSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("[color-picker] Failed to save settings:", e);
    }
  },
  
  get(key: string): ColorPickerSettings | null {
    const settings = this.load();
    return settings ? (settings as any)[key] || settings : null;
  },
  
  set(key: string, value: ColorPickerSettings): void {
    const settings = this.load() || { colors: [] };
    (settings as any)[key] = value;
    this.save(settings);
  }
};

// 浏览器版本的右键菜单
class ContextMenu {
  menu: HTMLElement | null = null;
  items: MenuItem[] = [];
  
  append(item: MenuItem): void {
    this.items.push(item);
  }
  
  popup(event: MouseEvent): void {
    this._removeMenu();
    
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
      
      this.menu!.appendChild(menuItem);
    });
    
    const x = event.clientX;
    const y = event.clientY;
    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;
    
    document.body.appendChild(this.menu);
    
    const closeHandler = (e: MouseEvent) => {
      if (this.menu && !this.menu.contains(e.target as Node)) {
        this._removeMenu();
        document.removeEventListener("click", closeHandler);
        document.removeEventListener("contextmenu", closeHandler as any);
      }
    };
    
    setTimeout(() => {
      document.addEventListener("click", closeHandler);
      document.addEventListener("contextmenu", closeHandler as any);
    }, 0);
  }
  
  _removeMenu(): void {
    if (this.menu && this.menu.parentNode) {
      this.menu.parentNode.removeChild(this.menu);
      this.menu = null;
    }
  }
}

interface MenuItemOptions {
  label: string;
  click?: () => void;
}

class MenuItem {
  options: MenuItemOptions;
  
  constructor(options: MenuItemOptions) {
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
  get value(): number[] {
    return this._value;
  },

  set value(value: number[] | string) {
    const rgba = chroma(value as any).rgba();

    if (rgba !== this._value) {
      this._value = rgba;
      this._lastAssigned = rgba.slice(0);
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

  factoryImpl(value: number[] | string): void {
    if (value) {
      this.value = value;
    }
  },

  ready(): void {
    const attrValue = this.getAttribute("value");
    this._value = attrValue !== null ? chroma(attrValue).rgba() : [255, 255, 255, 1];
    this._lastAssigned = this._value.slice(0);
    const settings = SettingsStorage.get("ui-color-picker");
    this._settings = settings || { colors: [] };
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

  hide(confirm: boolean): void {
    fire(this, "hide", { bubbles: false, detail: { confirm } });
  },

  _initEvents(): void {
    this.addEventListener("keydown", (event: Event) => {
      const e = event as KeyboardEvent;
      if (e.keyCode === 13 || e.keyCode === 32) {
        acceptEvent(e);
        this.hide(true);
      } else if (e.keyCode === 27) {
        acceptEvent(e);
        this.hide(false);
      }
    });

    this.$hueCtrl.addEventListener("mousedown", (event: Event) => {
      const e = event as MouseEvent;
      acceptEvent(e);
      focusMgr._setFocusElement(this);
      this.$hueCtrl.focus();
      const alpha = this._value[3];
      this._initValue = this._value;
      const rect = this.$hueCtrl.getBoundingClientRect();
      const ratio = (e.clientY - rect.top) / this.$hueCtrl.clientHeight;
      this.$hueHandle.style.top = `${100 * ratio}%`;
      const hue = 360 * (1 - ratio);
      const hsv = chroma(this._value).hsv();
      this._value = chroma(hue, hsv[1], hsv[2], "hsv").rgba();
      this._value[3] = alpha;
      this._updateColorDiff();
      this._updateColor(hue);
      this._updateAlpha();
      this._updateSliders();
      this._updateHexInput();
      this._emitChange();
    });

    this.$hueCtrl.addEventListener("keydown", (event: Event) => {
      const e = event as KeyboardEvent;
      if (e.keyCode === 27) {
        acceptEvent(e);
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

    this.$alphaCtrl.addEventListener("mousedown", (event: Event) => {
      const e = event as MouseEvent;
      acceptEvent(e);
      focusMgr._setFocusElement(this);
      this.$alphaCtrl.focus();
      this._initValue = this._value.slice();
      const rect = this.$alphaCtrl.getBoundingClientRect();
      const ratio = (e.clientY - rect.top) / this.$alphaCtrl.clientHeight;
      this.$alphaHandle.style.top = `${100 * ratio}%`;
      this._value[3] = parseFloat((1 - ratio).toFixed(3));
      this._updateColorDiff();
      this._updateSliders();
      this._emitChange();
    });

    this.$alphaCtrl.addEventListener("keydown", (event: Event) => {
      const e = event as KeyboardEvent;
      if (e.keyCode === 27) {
        acceptEvent(e);
        this._value = this._initValue;
        this._updateColorDiff();
        this._updateAlpha();
        this._updateSliders();
        this._emitChange();
        this._emitCancel();
      }
    });

    this.$colorCtrl.addEventListener("mousedown", (event: Event) => {
      const e = event as MouseEvent;
      acceptEvent(e);
      focusMgr._setFocusElement(this);
      this.$colorCtrl.focus();
      const hue = 360 * (1 - parseFloat(this.$hueHandle.style.top) / 100);
      const alpha = this._value[3];
      this._initValue = this._value.slice();
      const rect = this.$colorCtrl.getBoundingClientRect();
      const saturation = (e.clientX - rect.left) / this.$colorCtrl.clientWidth;
      const brightness = (e.clientY - rect.top) / this.$colorCtrl.clientHeight;
      let gray = brightness * brightness * (3 - 2 * brightness);
      gray *= 255;
      this.$colorHandle.style.left = `${100 * saturation}%`;
      this.$colorHandle.style.top = `${100 * brightness}%`;
      this.$colorHandle.style.color = chroma(gray, gray, gray).hex();
      this._value = chroma(hue, saturation, 1 - brightness, "hsv").rgba();
      this._value[3] = alpha;
      this._updateColorDiff();
      this._updateAlpha();
      this._updateSliders();
      this._updateHexInput();
      this._emitChange();
    });

    this.$colorCtrl.addEventListener("keydown", (event: Event) => {
      const e = event as KeyboardEvent;
      if (e.keyCode === 27) {
        acceptEvent(e);
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

    // Slider events
    const sliderChangeHandler = (index: number, isAlpha = false) => (event: Event) => {
      const e = event as CustomEvent;
      e.stopPropagation();
      if (isAlpha) {
        this._value[index] = parseFloat(String(e.detail.value)) / 255;
      } else {
        this._value[index] = parseInt(e.detail.value);
      }
      this._updateColorDiff();
      if (!isAlpha) {
        this._updateHue();
        this._updateColor();
      }
      this._updateAlpha();
      if (!isAlpha) {
        this._updateHexInput();
      }
      this._emitChange();
    };

    const sliderConfirmHandler = (event: Event) => {
      event.stopPropagation();
      this._emitConfirm();
    };

    const sliderCancelHandler = (event: Event) => {
      event.stopPropagation();
      this._emitCancel();
    };

    this.$sliderR.addEventListener("change", sliderChangeHandler(0));
    this.$sliderR.addEventListener("confirm", sliderConfirmHandler);
    this.$sliderR.addEventListener("cancel", sliderCancelHandler);

    this.$sliderG.addEventListener("change", sliderChangeHandler(1));
    this.$sliderG.addEventListener("confirm", sliderConfirmHandler);
    this.$sliderG.addEventListener("cancel", sliderCancelHandler);

    this.$sliderB.addEventListener("change", sliderChangeHandler(2));
    this.$sliderB.addEventListener("confirm", sliderConfirmHandler);
    this.$sliderB.addEventListener("cancel", sliderCancelHandler);

    this.$sliderA.addEventListener("change", sliderChangeHandler(3, true));
    this.$sliderA.addEventListener("confirm", sliderConfirmHandler);
    this.$sliderA.addEventListener("cancel", sliderCancelHandler);

    this.$hexInput.addEventListener("change", (e: Event) => {
      e.stopPropagation();
    });

    this.$hexInput.addEventListener("cancel", (e: Event) => {
      e.stopPropagation();
    });

    this.$hexInput.addEventListener("confirm", (event: Event) => {
      const e = event as CustomEvent;
      e.stopPropagation();
      const alpha = this._value[3];
      this._value = chroma(e.detail.value).rgba();
      this._value[3] = alpha;
      this._updateColorDiff();
      this._updateHue();
      this._updateColor();
      this._updateAlpha();
      this._updateSliders();
      this._updateHexInput();
      this._emitChange();
      this._emitConfirm();
    });

    this.$btnAdd.addEventListener("confirm", (event: Event) => {
      event.stopPropagation();
      const css = chroma(this._value).css();
      const colorBox = this._newColorBox(css);
      this.$palette.appendChild(colorBox);
      this._settings.colors.push(css);
      this._saveSettings();
    });
  },

  _initPalette(): void {
    this._settings.colors.forEach((color: string) => {
      const colorBox = this._newColorBox(color);
      this.$palette.appendChild(colorBox);
    });
  },

  _newColorBox(color: string): HTMLElement {
    const box = document.createElement("div");
    box.classList.add("color-box");
    const inner = document.createElement("div");
    inner.classList.add("inner");
    inner.style.backgroundColor = color;
    box.appendChild(inner);

    box.addEventListener("contextmenu", (event: Event) => {
      const e = event as MouseEvent;
      e.preventDefault();
      const menu = new ContextMenu();

      menu.append(
        new MenuItem({
          label: "Replace",
          click: () => {
            const index = Array.from(box.parentElement!.children).indexOf(box);
            const css = chroma(this._value).css();
            inner.style.backgroundColor = css;
            this._settings.colors[index] = css;
            this._saveSettings();
          },
        })
      );

      menu.append(
        new MenuItem({
          label: "Delete",
          click: () => {
            const index = Array.from(box.parentElement!.children).indexOf(box);
            box.remove();
            this._settings.colors.splice(index, 1);
            this._saveSettings();
          },
        })
      );

      menu.popup(e);
    });

    box.addEventListener("mousedown", (event: Event) => {
      const e = event as MouseEvent;
      e.stopPropagation();

      if (e.button === 0) {
        this._value = chroma(inner.style.backgroundColor).rgba();
        this._updateColorDiff();
        this._updateHue();
        this._updateColor();
        this._updateAlpha();
        this._updateSliders();
        this._updateHexInput();
        this._emitChange();
        this._emitConfirm();
      }
    });

    return box;
  },

  _saveSettings(): void {
    SettingsStorage.set("ui-color-picker", this._settings);
  },

  _updateColorDiff(): void {
    this.$oldColor.style.backgroundColor = chroma(this._lastAssigned).css();
    this.$newColor.style.backgroundColor = chroma(this._value).css();
  },

  _updateHue(): void {
    const hsv = chroma(this._value).hsv();

    if (isNaN(hsv[0])) {
      hsv[0] = 360;
    }

    this.$hueHandle.style.top = `${100 * (1 - hsv[0] / 360)}%`;
  },

  _updateColor(hue?: number): void {
    const hsv = chroma(this._value).hsv();

    if (isNaN(hsv[0])) {
      hsv[0] = 360;
    }

    const h = hue === undefined ? hsv[0] : hue;
    const [, s, v] = hsv;
    let gray = 1 - v;
    gray = gray * gray * (3 - 2 * gray);
    gray *= 255;
    this.$colorCtrl.style.backgroundColor = chroma(h, 1, 1, "hsv").hex();
    this.$colorHandle.style.left = `${100 * s}%`;
    this.$colorHandle.style.top = `${100 * (1 - v)}%`;
    this.$colorHandle.style.color = chroma(gray, gray, gray).hex();
  },

  _updateAlpha(): void {
    this.$alphaCtrl.style.backgroundColor = chroma(
      this._value[0],
      this._value[1],
      this._value[2]
    ).hex();

    this.$alphaHandle.style.top = `${100 * (1 - this._value[3])}%`;
  },

  _updateSliders(): void {
    this.$sliderR.value = this._value[0];
    this.$sliderG.value = this._value[1];
    this.$sliderB.value = this._value[2];
    this.$sliderA.value = parseInt(String(255 * this._value[3]));
  },

  _updateHexInput(): void {
    this.$hexInput.value = chroma(this._value).hex().toUpperCase();
  },

  _emitConfirm(): void {
    fire(this, "confirm", { bubbles: true, detail: { value: this._value } });
  },

  _emitCancel(): void {
    fire(this, "cancel", { bubbles: true, detail: { value: this._value } });
  },

  _emitChange(): void {
    fire(this, "change", { bubbles: true, detail: { value: this._value } });
  },
});

