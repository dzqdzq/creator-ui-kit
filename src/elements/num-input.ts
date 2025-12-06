/**
 * UI Num Input 组件
 */

import elementUtils from "../utils/utils";
import jsUtils from "../utils/js-utils";
import { getElementStyleSync } from "../utils/css-loader";
import { acceptEvent, installDownUpEvent, fire } from "../utils/dom-utils";
import focusMgr from "../utils/focus-mgr";
import focusableBehavior from "../behaviors/focusable";
import disableBehavior from "../behaviors/disable";
import readonlyBehavior from "../behaviors/readonly";
import inputStateBehavior from "../behaviors/input-state";

// 默认配置对象
const settings = {
  stepInt: 1,
  stepFloat: 0.1,
};

const template = /*html*/ `
    <input></input>
    <div class="spin-wrapper" tabindex="-1">
      <div class="spin up">
        <i class="icon-up-dir"></i>
      </div>
      <div class="spin-div"></div>
      <div class="spin down">
        <i class="icon-down-dir"></i>
      </div>
    </div>
  `;

type ParseFn = (value: string) => number;

interface ExtendedInput extends HTMLInputElement {
  _initValue?: string;
}

export default elementUtils.registerElement("ui-num-input", {
  get type(): 'int' | 'float' {
    return this._type;
  },

  set type(value: 'int' | 'float') {
    if (this._type !== value) {
      this._type = value;

      if (this._type === "int") {
        this._parseFn = parseInt;
        this._step = parseInt(String(this._step));
        this._step = this._step === 0 ? settings.stepInt : this._step;
      } else {
        this._parseFn = parseFloat;
        this._step = parseFloat(String(this._step));
        this._step = this._step === 0 ? settings.stepFloat : this._step;
      }
    }
  },

  get value(): number {
    return this._value;
  },

  set value(value: number | null | undefined) {
    if (value === null || value === undefined) {
      value = 0;
    }

    value = this._clampValue(value);

    if (this._value !== value) {
      this._value = this._parseFn(String(value));
      if (!this._multiValues) {
        this.$input.value = this._formatValue(this._value);
      }
    }
  },

  get values(): number[] {
    return this._values;
  },

  set values(values: number[]) {
    this._values = values;

    if (this._multiValues) {
      this.$input.value = "-";
    }
  },

  get highlighted(): boolean {
    return this.getAttribute("highlighted") !== null;
  },

  set highlighted(value: boolean) {
    if (value) {
      this.setAttribute("highlighted", "");
    } else {
      this.removeAttribute("highlighted");
    }
  },

  get invalid(): boolean {
    return this.getAttribute("invalid") !== null;
  },

  set invalid(value: boolean) {
    if (value) {
      this.setAttribute("invalid", "");
    } else {
      this.removeAttribute("invalid");
    }
  },

  get min(): number | null {
    return this._min;
  },

  set min(value: number | string | null | undefined) {
    if (value === null || value === undefined) {
      this._min = null;
      return;
    }

    const numValue = this._parseFn(String(value));
    if (this._min !== numValue) {
      this._min = numValue;
      this.value = this._value;
    }
  },

  get max(): number | null {
    return this._max;
  },

  set max(value: number | string | null | undefined) {
    if (value === null || value === undefined) {
      this._max = null;
      return;
    }

    const numValue = this._parseFn(String(value));
    if (this._max !== numValue) {
      this._max = numValue;
      this.value = this._value;
    }
  },

  get precision(): number {
    return this._precision;
  },

  set precision(value: number | string) {
    if (value !== undefined && value !== null) {
      const numValue = parseInt(String(value));
      if (this._precision !== numValue) {
        this._precision = numValue;
        this.$input.value = this._formatValue(this._value);
      }
    }
  },

  get step(): number {
    return this._step;
  },

  set step(value: number | string) {
    if (value !== undefined && value !== null) {
      const numValue = this._parseFn(String(value));
      if (this._step !== numValue) {
        this._step = numValue;

        if (this._type === "int") {
          this._step = this._step === 0 ? settings.stepInt : this._step;
        } else {
          this._step = this._step === 0 ? settings.stepFloat : this._step;
        }
      }
    }
  },

  get multiValues(): boolean {
    return this._multiValues;
  },

  set multiValues(value: boolean) {
    const boolValue = !(value == null || value === false);
    if (boolValue !== this._multiValues) {
      if (boolValue) {
        this.$input.value = "-";
        this.setAttribute("multi-values", "");
      } else {
        this._value = this._parseFn(String(this._clampValue(this._value)));
        this.$input.value = this._formatValue(this._value);
        this.removeAttribute("multi-values");
      }

      this._multiValues = boolValue;
    }
  },

  get observedAttributes(): string[] {
    return ["type", "min", "max", "precision", "step", "multi-values"];
  },

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      const propertyName = name.replace(/-(\w)/g, (_t, e) => e.toUpperCase());
      (this as any)[propertyName] = newValue;
    }
  },

  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior, inputStateBehavior],
  template,
  style: getElementStyleSync("num-input"),
  $: {
    input: "input",
    spinWrapper: ".spin-wrapper",
    spinUp: ".spin.up",
    spinDown: ".spin.down",
  },

  factoryImpl(value: number): void {
    if (!isNaN(value)) {
      this.value = value;
    }
  },

  ready(): void {
    if (this.getAttribute("type") === "int") {
      this._type = "int";
      this._parseFn = parseInt as ParseFn;
    } else {
      this._type = "float";
      this._parseFn = parseFloat as ParseFn;
    }

    const precision = this.getAttribute("precision");
    this._precision = precision !== null ? parseInt(precision) : 7;
    const min = this.getAttribute("min");
    this._min = min !== null ? this._parseFn(min) : null;
    const max = this.getAttribute("max");
    this._max = max !== null ? this._parseFn(max) : null;
    this.multiValues = this.getAttribute("multi-values") as any;
    const value = this.getAttribute("value");
    this._value = value !== null ? this._parseFn(value) : 0;
    this._value = this._clampValue(this._value);
    const step = this.getAttribute("step");

    this._step =
      step !== null
        ? this._parseFn(step)
        : this._type === "int"
        ? settings.stepInt
        : settings.stepFloat;

    this.$input.value = this._formatValue(this._value);
    this.$input.placeholder = "-";
    (this.$input as ExtendedInput)._initValue = "";

    this.$spinWrapper.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.keyCode === 27 && this._holdingID) {
        acceptEvent(event);
        this.cancel();
        this._curSpin?.removeAttribute("pressed");
        this._stopHolding();
      }
    });

    installDownUpEvent(this.$spinUp);

    this.$spinUp.addEventListener("down", (event: Event) => {
      acceptEvent(event);
      focusMgr._setFocusElement(this);
      this.$spinWrapper.focus();
      this.$spinUp.setAttribute("pressed", "");

      if (!this.readonly) {
        this._stepUp();
        this._startHolding(this.$spinUp, this._stepUp);
      }
    });

    this.$spinUp.addEventListener("up", (event: Event) => {
      acceptEvent(event);
      this.$spinUp.removeAttribute("pressed");

      if (this._holdingID) {
        this._stopHolding();
        this.confirm();
      }
    });

    installDownUpEvent(this.$spinDown);

    this.$spinDown.addEventListener("down", (event: Event) => {
      acceptEvent(event);
      focusMgr._setFocusElement(this);
      this.$spinWrapper.focus();
      this.$spinDown.setAttribute("pressed", "");

      if (!this.readonly) {
        this._stepDown();
        this._startHolding(this.$spinDown, this._stepDown);
      }
    });

    this.$spinDown.addEventListener("up", (event: Event) => {
      acceptEvent(event);
      this.$spinDown.removeAttribute("pressed");

      if (this._holdingID) {
        this._stopHolding();
        this.confirm();
      }
    });

    this._initFocusable(this, this.$input);
    this._initDisable(false);
    this._initReadonly(false);
    this._initInputState(this.$input);

    this.$input.readOnly = this.readonly;
    this._initEvents();
  },

  _setIsReadonlyAttribute(isReadonly: boolean): void {
    if (isReadonly) {
      this.setAttribute("is-readonly", "");
    } else {
      this.removeAttribute("is-readonly");
    }

    this.$input.readOnly = isReadonly;
  },

  _initEvents(): void {
    this.addEventListener("mousedown", this._mouseDownHandler);
    this.addEventListener("keydown", this._keyDownHandler);
    this.addEventListener("focus-changed", this._focusChangedHandler);

    this.$input.addEventListener("keydown", (event: KeyboardEvent) => {
      if (!this.readonly) {
        if (event.keyCode === 38) {
          acceptEvent(event);
          this._stepUp();
        } else if (event.keyCode === 40) {
          acceptEvent(event);
          this._stepDown();
        }
      }
    });

    this.$input.addEventListener(
      "mousewheel",
      (event: Event) => {
        const wheelEvent = event as WheelEvent;
        if (this.focused) {
          wheelEvent.stopPropagation();

          if (!this.readonly) {
            if (wheelEvent.deltaY > 0) {
              this._stepDown();
            } else {
              this._stepUp();
            }
            fire(this, "confirm", {
              bubbles: true,
              detail: { value: this._value, confirmByEnter: false },
            });
          }
        }
      },
      { passive: true }
    );
  },

  _formatValue(value: number): string {
    if (value === null || String(value) === "") {
      return "";
    }
    return this._type === "int"
      ? jsUtils.toFixed(value, 0)
      : this._precision === 0
      ? jsUtils.toFixed(value, this._precision)
      : jsUtils.toFixed(value, this._precision, this._precision);
  },

  _clampValue(value: number): number {
    if (this._min !== null && this._min !== undefined) {
      value = Math.max(this._min, value);
    }
    
    if (this._max !== null && this._max !== undefined) {
      value = Math.min(this._max, value);
    }

    return value;
  },

  _parseInput(): number {
    if (this.$input.value === null || this.$input.value.trim() === "") {
      return 0;
    }
    let value = this._parseFn(this.$input.value);

    if (isNaN(value)) {
      value = this._parseFn((this.$input as ExtendedInput)._initValue || "0");
      value = this._parseFn(this._formatValue(value));
    } else {
      value = this._parseFn(this._formatValue(value));
    }

    return value;
  },

  _stepUp(): void {
    let value = this._value;

    if (Array.isArray(value)) {
      value = value[0];
    }

    let newValue = value + this._step;
    newValue = this._clampValue(newValue);
    this.$input.value = this._formatValue(newValue);
    this._onInputChange();
  },

  _stepDown(): void {
    let value = this._value;

    if (Array.isArray(value)) {
      value = value[0];
    }

    let newValue = value - this._step;
    newValue = this._clampValue(newValue);
    this.$input.value = this._formatValue(newValue);
    this._onInputChange();
  },

  _startHolding(spin: HTMLElement, stepFn: () => void): void {
    this._curSpin = spin;

    this._holdingID = setTimeout(() => {
      this._stepingID = setInterval(() => {
        stepFn.apply(this);
      }, 50);
    }, 500);
  },

  _stopHolding(): void {
    clearInterval(this._holdingID);
    this._holdingID = null;
    clearTimeout(this._stepingID);
    this._stepingID = null;
    this._curSpin = null;
  },

  clear(): void {
    this.$input.value = "";
    this.confirm();
  },

  confirm(): void {
    this._onInputConfirm(this.$input);
  },

  cancel(): void {
    this._onInputCancel(this.$input);
  },

  _onInputConfirm(input: ExtendedInput, confirmByEnter?: boolean): void {
    if (!this.readonly && this._changed) {
      this._changed = false;
      let value = this._parseInput();
      const originalValue = value;
      value = this._clampValue(value);
      const formatted = this._formatValue(value);
      input.value = formatted;
      input._initValue = formatted;
      this._value = value;

      if (originalValue !== value) {
        fire(this, "change", {
          bubbles: true,
          detail: { value: this._value },
        });
      }

      fire(this, "confirm", {
        bubbles: true,
        detail: { value: this._value, confirmByEnter },
      });
    }

    if (confirmByEnter) {
      this.focus();
    }
  },

  _onInputCancel(input: ExtendedInput, cancelByEsc?: boolean): void {
    if (!this.readonly && this._changed) {
      this._changed = false;

      if (input._initValue !== input.value) {
        input.value = input._initValue || "";
        const value = this._parseInput();
        const formatted = this._formatValue(value);
        input.value = formatted;
        input._initValue = formatted;
        this._value = value;

        fire(this, "change", {
          bubbles: true,
          detail: { value: this._value },
        });
      }

      fire(this, "cancel", {
        bubbles: true,
        detail: { value: this._value, cancelByEsc },
      });
    }

    if (cancelByEsc) {
      input.blur();
      this.focus();
    }
  },

  _onInputChange(): void {
    this._changed = true;
    this._value = this._parseInput();
    this.multiValues = false;
    fire(this, "change", { bubbles: true, detail: { value: this._value } });
  },

  _mouseDownHandler(event: MouseEvent): void {
    event.stopPropagation();
    focusMgr._setFocusElement(this);
  },

  _keyDownHandler(event: KeyboardEvent): void {
    if (!this.disabled && (event.keyCode === 13 || event.keyCode === 32)) {
      acceptEvent(event);
      (this.$input as ExtendedInput)._initValue = this.$input.value;
      this.$input.focus();
      this.$input.select();
    }
  },

  _focusChangedHandler(): void {
    if (this.focused) {
      (this.$input as ExtendedInput)._initValue = this.$input.value;
    } else {
      this._unselect(this.$input);
    }
  },
});

