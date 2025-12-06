/**
 * UI Color 组件
 */

import chroma from 'chroma-js';
import elementUtils from '../utils/utils';
import { getElementStyleSync } from '../utils/css-loader';
import { acceptEvent, fire } from '../utils/dom-utils';
import focusMgr from '../utils/focus-mgr';
import focusableBehavior from '../behaviors/focusable';
import disableBehavior from '../behaviors/disable';
import readonlyBehavior from '../behaviors/readonly';

// 颜色选择器元素引用
let colorPicker:
  | (HTMLElement & {
      value?: number[];
      hide?(confirm: boolean): void;
      _target?: HTMLElement | null;
    })
  | null = null;

// 点击外部关闭功能
let hitGhostHandler: ((event: MouseEvent) => void) | null = null;

function addHitGhost(_type: string, _zIndex: number, callback: () => void): void {
  removeHitGhost();

  hitGhostHandler = (event: MouseEvent) => {
    if (colorPicker && !colorPicker.contains(event.target as Node)) {
      if (colorPicker._target && !colorPicker._target.contains(event.target as Node)) {
        callback();
      }
    }
  };

  setTimeout(() => {
    document.addEventListener('mousedown', hitGhostHandler!, true);
  }, 0);
}

function removeHitGhost(): void {
  if (hitGhostHandler) {
    document.removeEventListener('mousedown', hitGhostHandler, true);
    hitGhostHandler = null;
  }
}

const template = /*html*/ `
    <div class="inner">
      <div class="rgb"></div>
      <div class="alpha"></div>
    </div>
    <div class="mask"></div>
  `;

export default elementUtils.registerElement('ui-color', {
  get value(): number[] | string {
    return this._value;
  },

  set value(value: number[] | string | null | undefined) {
    if (!value) {
      value = [0, 0, 0, 1];
    }

    const oldValue = this._value;
    this._value = value;

    if (`${oldValue}` !== `${this._value}` && !this._multiValues) {
      if (Array.isArray(value) && value.length >= 3) {
        const r = value[0];
        const g = value[1];
        const b = value[2];
        const a = value.length === 4 ? (value[3] > 1 ? value[3] / 255 : value[3]) : 1;
        this._draw = [r, g, b, a];
      } else {
        this._draw = chroma(value as any).rgba();
      }
      this._updateRGB();
      this._updateAlpha();
    }
  },

  get values(): (number[] | string)[] {
    return this._values;
  },

  set values(values: (number[] | string)[]) {
    const oldValues = this._values;
    this._values = values;

    if (`${oldValues}` !== `${values}` && this._multiValues) {
      this._draw = chroma(values[0] as any).rgba();
      this._updateRGB();
      this._updateAlpha();
    }
  },

  get multiValues(): boolean {
    return this._multiValues;
  },

  set multiValues(value: boolean) {
    const boolValue = !(value == null || value === false);

    if (this._multiValues !== boolValue) {
      this._multiValues = boolValue;
      let color;

      if (boolValue) {
        if (this._values) {
          color = this._values[0];
        }
        this.setAttribute('multi-values', '');
      } else {
        color = this._value;
        this.removeAttribute('multi-values');
      }

      if (color) {
        this._updateRGB();
        this._updateAlpha();
      }
    }
  },

  get observedAttributes(): string[] {
    return ['multi-values'];
  },

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue && name === 'multi-values') {
      const propertyName = name.replace(/-(\w)/g, (_e, t) => t.toUpperCase());
      (this as any)[propertyName] = newValue;
    }
  },

  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior],
  template,
  style: getElementStyleSync('color'),
  $: { rgb: '.rgb', alpha: '.alpha' },

  factoryImpl(value: number[] | string): void {
    if (value) {
      this.value = value;
    }
  },

  ready(): void {
    this._showing = false;

    let attrValue = this.getAttribute('value');
    let initialValue: number[] | string;

    if (attrValue !== null) {
      if (typeof attrValue === 'string' && attrValue.includes(',')) {
        const parts = attrValue.split(',').map((p) => parseFloat(p.trim()));
        if (parts.length >= 3) {
          initialValue = parts.length === 4 ? parts : [...parts, 1];
        } else {
          initialValue = [255, 255, 255, 1];
        }
      } else {
        initialValue = attrValue;
      }
    } else {
      initialValue = [255, 255, 255, 1];
    }

    if (Array.isArray(initialValue) && initialValue.length >= 3) {
      const r = initialValue[0];
      const g = initialValue[1];
      const b = initialValue[2];
      const a =
        initialValue.length === 4
          ? initialValue[3] > 1
            ? initialValue[3] / 255
            : initialValue[3]
          : 1;
      this._draw = [r, g, b, a];
      this._value = initialValue;
    } else {
      this._draw = chroma(initialValue as any).rgba();
      this._value = this._draw;
    }

    this.multiValues = this.getAttribute('multi-values') as any;

    requestAnimationFrame(() => {
      if (!this.$rgb || !this.$alpha) {
        console.error('[ui-color] $rgb 或 $alpha 未找到');
        return;
      }
      this._updateRGB();
      this._updateAlpha();
    });

    this._initFocusable(this);
    this._initDisable(false);
    this._initReadonly(false);
    this._initEvents();

    if (!colorPicker) {
      colorPicker = document.createElement('ui-color-picker') as any;
      colorPicker!.style.position = 'fixed';
      colorPicker!.style.zIndex = '999';
      colorPicker!.style.display = 'none';
    }
  },

  detachedCallback(): void {
    this._showColorPicker(false);
  },

  _initEvents(): void {
    this.addEventListener('mousedown', (event: MouseEvent) => {
      if (!this.disabled) {
        acceptEvent(event);
        focusMgr._setFocusElement(this);

        if (!this.readonly) {
          if (this._showing) {
            this._showColorPicker(false);
          } else {
            if (colorPicker) {
              colorPicker.value = this._draw;
            }
            this._showColorPicker(true);
          }
        }
      }
    });

    this.addEventListener('keydown', (event: KeyboardEvent) => {
      if (!this.readonly && !this.disabled && (event.keyCode === 13 || event.keyCode === 32)) {
        acceptEvent(event);
        if (colorPicker) {
          colorPicker.value = this._draw;
        }
        this._showColorPicker(true);
      }
    });

    this._hideFn = (e: CustomEvent) => {
      if (this._changed) {
        this._changed = false;

        if (e.detail.confirm) {
          this._initValue = this._value;
          fire(this, 'confirm', {
            bubbles: true,
            detail: { value: this._value },
          });
        } else {
          if (this._initValue !== this._value) {
            this.value = this._initValue;
            fire(this, 'change', {
              bubbles: true,
              detail: { value: this._value },
            });
          }
          fire(this, 'cancel', {
            bubbles: true,
            detail: { value: this._value },
          });
        }
      }

      this._showColorPicker(false);
    };

    this._changeFn = (e: CustomEvent) => {
      this._changed = true;
      this.multiValues = false;
      acceptEvent(e);

      this.value = e.detail.value.map((v: number) => v);

      fire(this, 'change', {
        bubbles: true,
        detail: { value: this._value },
      });
    };
  },

  _updateRGB(): void {
    if (!this.$rgb || !this._draw) {
      return;
    }
    try {
      const hexColor = chroma(this._draw.slice(0, 3)).hex();
      this.$rgb.style.backgroundColor = hexColor;
    } catch (error) {
      console.error('[ui-color] 更新 RGB 时出错:', error);
    }
  },

  _updateAlpha(): void {
    if (!this.$alpha || !this._draw) {
      return;
    }
    try {
      const alphaWidth = `${100 * this._draw[3]}%`;
      this.$alpha.style.width = alphaWidth;
    } catch (error) {
      console.error('[ui-color] 更新 Alpha 时出错:', error);
    }
  },

  _equals(value: number[]): boolean {
    return (
      this._value.length === value.length &&
      this._value[0] === value[0] &&
      this._value[1] === value[1] &&
      this._value[2] === value[2] &&
      this._value[3] === value[3]
    );
  },

  _showColorPicker(show: boolean): void {
    if (this._showing !== show) {
      this._showing = show;

      if (show) {
        this._initValue = this._draw;
        colorPicker!.addEventListener('hide', this._hideFn);
        colorPicker!.addEventListener('change', this._changeFn);
        addHitGhost('default', 998, () => {
          colorPicker!.hide?.(true);
        });
        document.body.appendChild(colorPicker!);
        colorPicker!._target = this;
        colorPicker!.style.display = 'block';
        this._updateColorPickerPosition();
        focusMgr._setFocusElement(colorPicker as any);
      } else {
        colorPicker!.removeEventListener('hide', this._hideFn);
        colorPicker!.removeEventListener('change', this._changeFn);
        removeHitGhost();
        colorPicker!._target = null;
        colorPicker!.remove();
        colorPicker!.style.display = 'none';
        focusMgr._setFocusElement(this);
      }
    }
  },

  _updateColorPickerPosition(): void {
    window.requestAnimationFrame(() => {
      if (!this._showing || !colorPicker) {
        return;
      }
      const bodyRect = document.body.getBoundingClientRect();
      const selfRect = this.getBoundingClientRect();
      const pickerRect = colorPicker.getBoundingClientRect();
      const pickerStyle = colorPicker.style;
      pickerStyle.left = `${selfRect.right - pickerRect.width}px`;

      if (bodyRect.height - selfRect.bottom <= pickerRect.height + 10) {
        pickerStyle.top = `${bodyRect.bottom - pickerRect.height - 10}px`;
      } else {
        pickerStyle.top = `${selfRect.bottom - bodyRect.top + 10}px`;
      }

      if (bodyRect.width - selfRect.left <= pickerRect.width) {
        pickerStyle.left = `${bodyRect.right - pickerRect.width - 10}px`;
      } else {
        pickerStyle.left = `${selfRect.left - bodyRect.left}px`;
      }

      this._updateColorPickerPosition();
    });
  },
});
