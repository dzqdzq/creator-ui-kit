/**
 * UI Input 组件
 */

import elementUtils from "../utils/utils";
import { getElementStyleSync } from "../utils/css-loader";
import { fire, acceptEvent } from "../utils/dom-utils";
import focusMgr from "../utils/focus-mgr";
import focusableBehavior from "../behaviors/focusable";
import disableBehavior from "../behaviors/disable";
import readonlyBehavior from "../behaviors/readonly";
import inputStateBehavior from "../behaviors/input-state";

const template = /*html*/ `
    <input></input>
  `;

interface ExtendedInput extends HTMLInputElement {
  _initValue?: string;
}

export default elementUtils.registerElement("ui-input", {
  get value(): string {
    return this.$input.value;
  },

  set value(value: string | null | undefined) {
    if (value === null || value === undefined) {
      value = "";
    }

    value += "";
    this._value = value;

    if (!this.multiValues) {
      if (this._maxLength !== null) {
        this.$input.value = value.substr(0, this._maxLength);
      } else {
        this.$input.value = value;
      }
    }
  },

  get values(): string[] {
    return this._values;
  },

  set values(values: string[]) {
    this._values = values;

    if (this.multiValues) {
      this._updateMultiValue();
    }
  },

  get placeholder(): string {
    return this.$input.placeholder;
  },

  set placeholder(placeholder: string) {
    this.$input.placeholder = placeholder;
  },

  get password(): boolean {
    return this.$input.type === "password";
  },

  set password(isPassword: boolean) {
    this.$input.type = isPassword === true ? "password" : "";
  },

  get maxLength(): number | null {
    return this._maxLength;
  },

  set maxLength(length: number | string | null) {
    let numLength: number | null = length as number;
    if (numLength !== null) {
      numLength = Number(numLength);
    }

    if (isNaN(numLength as number)) {
      numLength = null;
    }

    this._maxLength = numLength;

    if (numLength) {
      this.$input.value = this._value.substr(0, this._maxLength!);
    }
  },

  get multiValues(): boolean {
    return this._multiValues;
  },

  set multiValues(value: boolean) {
    const boolValue = !(value == null || value === false);
    if (boolValue !== this._multiValues) {
      this._multiValues = boolValue;
      this._updateMultiValue();
    }
  },

  get observedAttributes(): string[] {
    return ["placeholder", "password", "multi-values"];
  },

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (
      oldValue !== newValue &&
      (name === "placeholder" ||
        name === "password" ||
        name === "multi-values")
    ) {
      const propertyName = name.replace(/-(\w)/g, (_match, letter) => letter.toUpperCase());
      (this as any)[propertyName] = newValue;
    }
  },

  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior, inputStateBehavior],
  template,
  style: getElementStyleSync("input"),
  $: { input: "input" },

  factoryImpl(value: string): void {
    if (value) {
      this.value = value;
    }
  },

  ready(): void {
    this._value = "";
    this._values = [""];
    this.$input.value = this.getAttribute("value") || "";
    this.$input.placeholder = this.getAttribute("placeholder") || "";
    this.$input.type = this.getAttribute("password") !== null ? "password" : "";
    this.maxLength = this.getAttribute("max-length");
    this.multiValues = this.getAttribute("multi-values") as any;
    this._initFocusable(this, this.$input);
    this._initDisable(false);
    this._initReadonly(false);
    this._initInputState(this.$input);
    this.$input.readOnly = this.readonly;
    this._initEvents();
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
  },

  _onInputConfirm(input: ExtendedInput, confirmByEnter?: boolean): void {
    if (!this.readonly) {
      if (this._changed) {
        this._changed = false;
        input._initValue = input.value;
        this._value = input.value;
        this.multiValues = false;

        fire(this, "confirm", {
          bubbles: true,
          detail: { value: input.value, confirmByEnter },
        });
      }
    }

    if (confirmByEnter) {
      this.focus();
    }
  },

  _onInputCancel(input: ExtendedInput, cancelByEsc?: boolean): void {
    if (!this.readonly) {
      if (this._changed) {
        this._changed = false;

        if (input._initValue !== input.value) {
          input.value = input._initValue || "";
          this._value = input._initValue || "";
          fire(this, "change", {
            bubbles: true,
            detail: { value: input.value },
          });
        }

        fire(this, "cancel", {
          bubbles: true,
          detail: { value: input.value, cancelByEsc },
        });
      }
    }

    if (cancelByEsc) {
      input.blur();
      this.focus();
    }
  },

  _onInputChange(input: HTMLInputElement): void {
    this._changed = true;

    if (this._maxLength && input.value.length > this._maxLength) {
      input.value = input.value.substr(0, this._maxLength);
    }

    fire(this, "change", { bubbles: true, detail: { value: input.value } });
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

  _updateMultiValue(): void {
    if (
      !this.multiValues ||
      !this._values ||
      this.values.length <= 1
    ) {
      this.$input.value = this._value;
      return this.$input.removeAttribute("multi-values");
    }

    if (this._values.every((value: string, index: number) => index === 0 || value === this._values[index - 1])) {
      this.$input.removeAttribute("multi-values");
    } else {
      this.$input.value = "-";
      this.$input.setAttribute("multi-values", "");
    }
  },
});

