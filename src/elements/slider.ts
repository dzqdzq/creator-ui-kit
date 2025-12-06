/**
 * UI Slider 组件
 */

import elementUtils from "../utils/utils";
import jsUtils from "../utils/js-utils";
import mathUtils from "../utils/math";
import { getElementStyleSync } from "../utils/css-loader";
import { acceptEvent, fire } from "../utils/dom-utils";
import focusMgr from "../utils/focus-mgr";
import focusableBehavior from "../behaviors/focusable";
import disableBehavior from "../behaviors/disable";
import readonlyBehavior from "../behaviors/readonly";
import inputStateBehavior from "../behaviors/input-state";

// 默认配置对象
const settings = {
  stepFloat: 0.1,
  shiftStep: 10,
};

const template = /*html*/ `
    <div class="wrapper">
      <div class="track"></div>
      <div class="nubbin"></div>
    </div>
    <input></input>
  `;

interface ExtendedInput extends HTMLInputElement {
  _initValue?: string;
}

export default elementUtils.registerElement("ui-slider", {
  get value(): number {
    return this._value;
  },

  set value(value: number | null | undefined) {
    if (value === null || value === undefined) {
      value = 0;
    }

    value = mathUtils.clamp(value, this._min, this._max);
    this._value = value;
    this._updateNubbinAndInput();
  },

  get values(): number[] {
    return this._values;
  },

  set values(values: number[]) {
    this._values = values;
  },

  get min(): number {
    return this._min;
  },

  set min(value: number | string | null | undefined) {
    if (value === null || value === undefined) {
      this._min = 0;
      return;
    }

    const numValue = parseFloat(String(value));
    if (this._min !== numValue) {
      this._min = numValue;
    }
  },

  get max(): number {
    return this._max;
  },

  set max(value: number | string | null | undefined) {
    if (value === null || value === undefined) {
      this._max = 1;
      return;
    }

    const numValue = parseFloat(String(value));
    if (this._max !== numValue) {
      this._max = numValue;
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
      }
    }
  },

  get step(): number {
    return this._step;
  },

  set step(value: number | string) {
    if (value !== undefined && value !== null) {
      const numValue = parseFloat(String(value));
      if (this._step !== numValue) {
        this._step = numValue === 0 ? settings.stepFloat : numValue;
      }
    }
  },

  get snap(): boolean {
    return this._snap;
  },

  set snap(value: boolean) {
    if (value !== undefined && value !== null && this._snap !== value) {
      this._snap = value;
    }
  },

  get multiValues(): boolean {
    return this._multiValues;
  },

  set multiValues(value: boolean) {
    const boolValue = !(value == null || value === false);
    if (boolValue !== this._multiValues) {
      this._multiValues = boolValue;

      if (boolValue) {
        this.setAttribute("multi-values", "");
      } else {
        this.removeAttribute("multi-values");
      }
    }
  },

  get observedAttributes(): string[] {
    return ["precision", "min", "max", "multi-values"];
  },

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      switch (name) {
        case "multi-values":
        case "precision": {
          const propertyName = name.replace(/-(\w)/g, (_t, e) => e.toUpperCase());
          (this as any)[propertyName] = newValue;
          break;
        }
        case "min":
          this.min = newValue;
          break;
        case "max":
          this.max = newValue;
          break;
      }
    }
  },

  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior, inputStateBehavior],
  template,
  style: getElementStyleSync("slider"),
  $: {
    wrapper: ".wrapper",
    track: ".track",
    nubbin: ".nubbin",
    input: "input",
  },

  factoryImpl(value: number): void {
    if (!isNaN(value)) {
      this.value = value;
    }
  },

  ready(): void {
    const precision = this.getAttribute("precision");
    this._precision = precision !== null ? parseInt(precision) : 1;
    const min = this.getAttribute("min");
    this._min = min !== null ? parseFloat(min) : 0;
    const max = this.getAttribute("max");
    this._max = max !== null ? parseFloat(max) : 1;
    const value = this.getAttribute("value");
    this._value = value !== null ? parseFloat(value) : 0;

    this._value = this._initValue = mathUtils.clamp(this._value, this._min, this._max);

    const step = this.getAttribute("step");
    this._step = step !== null ? parseFloat(step) : settings.stepFloat;
    this._snap = true;
    this.multiValues = this.getAttribute("multi-values") as any;
    this._updateNubbinAndInput();
    this._initFocusable([this.$wrapper, this.$input], this.$input);
    this._initDisable(false);
    this._initReadonly(false);
    this._initInputState(this.$input);
    this.$input.readOnly = this.readonly;
    this._initEvents();
  },

  _initEvents(): void {
    this.addEventListener("mousedown", this._mouseDownHandler);
    this.addEventListener("focus-changed", this._focusChangedHandler);

    this.$wrapper.addEventListener("keydown", this._wrapperKeyDownHandler.bind(this));
    this.$wrapper.addEventListener("keyup", this._wrapperKeyUpHandler.bind(this));
    this.$wrapper.addEventListener("mousedown", this._wrapperMouseDownHandler.bind(this));
    this.$nubbin.addEventListener("mousedown", this._nubbinMouseDownHandler.bind(this));

    this.$input.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.keyCode === 38) {
        acceptEvent(event);
        if (!this.readonly) this._stepUp(event);
      } else if (event.keyCode === 40) {
        acceptEvent(event);
        if (!this.readonly) this._stepDown(event);
      }
    });
  },

  _mouseDownHandler(event: MouseEvent): void {
    acceptEvent(event);
    focusMgr._setFocusElement(this);
  },

  _wrapperMouseDownHandler(event: MouseEvent): void {
    acceptEvent(event);
    focusMgr._setFocusElement(this);
    this.$wrapper.focus();

    if (this.readonly || this.disabled) {
      return;
    }

    this._initValue = this._value;
    this._startDrag(event);
  },

  _nubbinMouseDownHandler(event: MouseEvent): void {
    acceptEvent(event);
    focusMgr._setFocusElement(this);
    this.$wrapper.focus();

    if (this.readonly || this.disabled) {
      return;
    }

    this._initValue = this._value;
    this._startDrag(event);
  },

  _startDrag(event: MouseEvent): void {
    this._isDragging = true;
    this._updateValueFromEvent(event);

    this._dragMouseMoveHandler = this._dragMouseMoveHandler || this._onDragMove.bind(this);
    this._dragMouseUpHandler = this._dragMouseUpHandler || this._onDragEnd.bind(this);

    document.addEventListener("mousemove", this._dragMouseMoveHandler);
    document.addEventListener("mouseup", this._dragMouseUpHandler);
  },

  _onDragMove(event: MouseEvent): void {
    if (!this._isDragging) {
      return;
    }

    this._updateValueFromEvent(event);
  },

  _onDragEnd(event: MouseEvent): void {
    if (!this._isDragging) {
      return;
    }

    this._isDragging = false;
    this._updateValueFromEvent(event);
    this.confirm();

    document.removeEventListener("mousemove", this._dragMouseMoveHandler);
    document.removeEventListener("mouseup", this._dragMouseUpHandler);
  },

  _updateValueFromEvent(event: MouseEvent): void {
    const rect = this.$track.getBoundingClientRect();
    let ratio = (event.clientX - rect.left) / this.$track.clientWidth;
    ratio = Math.max(0, Math.min(1, ratio));
    let newValue = this._min + ratio * (this._max - this._min);

    if (this._snap) {
      newValue = this._snapToStep(newValue);
    }

    const formatted = this._formatValue(newValue);
    this.$input.value = formatted;
    this._value = parseFloat(formatted);
    this._updateNubbin();
    this._emitChange();
  },

  _wrapperKeyDownHandler(event: KeyboardEvent): void {
    if (!this.disabled) {
      if (event.keyCode === 13 || event.keyCode === 32) {
        acceptEvent(event);
        (this.$input as ExtendedInput)._initValue = this.$input.value;
        this.$input.focus();
        this.$input.select();
      } else if (event.keyCode === 27) {
        this.cancel();
      } else if (event.keyCode === 37) {
        acceptEvent(event);
        if (!this.readonly) this._stepDown(event);
      } else if (event.keyCode === 39) {
        acceptEvent(event);
        if (!this.readonly) this._stepUp(event);
      }
    }
  },

  _stepUp(event: KeyboardEvent): void {
    let step = this._step;

    if (event.shiftKey) {
      step *= settings.shiftStep;
    }

    this._value = mathUtils.clamp(this._value + step, this._min, this._max);
    this._updateNubbinAndInput();
    this._emitChange();
  },

  _stepDown(event: KeyboardEvent): void {
    let step = this._step;

    if (event.shiftKey) {
      step *= settings.shiftStep;
    }

    this._value = mathUtils.clamp(this._value - step, this._min, this._max);
    this._updateNubbinAndInput();
    this._emitChange();
  },

  _wrapperKeyUpHandler(event: KeyboardEvent): void {
    if (event.keyCode === 37 || event.keyCode === 39) {
      acceptEvent(event);

      if (!this.readonly) {
        this.confirm();
      }
    }
  },

  _parseInput(): number {
    if (this.$input.value === null || this.$input.value.trim() === "") {
      return this._min;
    }
    let value = parseFloat(this.$input.value);

    if (isNaN(value)) {
      value = parseFloat((this.$input as ExtendedInput)._initValue || "0");
      value = parseFloat(this._formatValue(value));
    } else {
      value = parseFloat(this._formatValue(value));
    }

    return mathUtils.clamp(value, this._min, this._max);
  },

  _updateNubbin(): void {
    const ratio = (this._value - this._min) / (this._max - this._min);
    this.$nubbin.style.left = `${100 * ratio}%`;
  },

  _updateNubbinAndInput(): void {
    const ratio = (this._value - this._min) / (this._max - this._min);
    this.$nubbin.style.left = `${100 * ratio}%`;
    this.$input.value = this._formatValue(this._value);
  },

  confirm(): void {
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

  cancel(): void {
    if (this._changed) {
      this._changed = false;

      if (this._value !== this._initValue) {
        this._value = this._initValue;
        this._updateNubbinAndInput();
        fire(this, "change", {
          bubbles: true,
          detail: { value: this._value },
        });
      }

      fire(this, "cancel", { bubbles: true, detail: { value: this._value } });
    }
  },

  _onInputConfirm(input: ExtendedInput, confirmByEnter?: boolean): void {
    if (!this.readonly && this._changed) {
      this._changed = false;
      const value = this._parseInput();
      input.value = String(value);
      input._initValue = String(value);
      this._value = value;
      this._initValue = value;
      this._updateNubbin();

      fire(this, "confirm", {
        bubbles: true,
        detail: { value: this._value, confirmByEnter },
      });
    }

    if (confirmByEnter) {
      this.$wrapper.focus();
    }
  },

  _onInputCancel(input: ExtendedInput, cancelByEsc?: boolean): void {
    if (!this.readonly && this._changed) {
      this._changed = false;

      if (input._initValue !== input.value) {
        input.value = input._initValue || "";
        const value = this._parseInput();
        input.value = String(value);
        this._value = value;
        this._initValue = value;
        this._updateNubbin();

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
      this.$wrapper.focus();
    }
  },

  _onInputChange(): void {
    const value = this._parseInput();
    this._value = value;
    this._updateNubbin();
    this._emitChange();
  },

  _focusChangedHandler(): void {
    if (!this.focused) {
      this._unselect(this.$input);
    }
  },

  _emitChange(): void {
    this._changed = true;
    fire(this, "change", { bubbles: true, detail: { value: this._value } });
  },

  _snapToStep(value: number): number {
    const steps = Math.round((value - this._value) / this._step);
    value = this._value + this._step * steps;
    return mathUtils.clamp(value, this.min, this.max);
  },

  _formatValue(value: number): string {
    if (value === null || value === undefined || String(value) === "") {
      return "";
    }
    return this._precision === 0
      ? jsUtils.toFixed(value, this._precision)
      : jsUtils.toFixed(value, this._precision, this._precision);
  },
});

