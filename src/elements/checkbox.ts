/**
 * UI Checkbox 组件
 */

import elementUtils from "../utils/utils";
import { getElementStyleSync } from "../utils/css-loader";
import { fire } from "../utils/dom-utils";
import focusableBehavior from "../behaviors/focusable";
import disableBehavior from "../behaviors/disable";
import readonlyBehavior from "../behaviors/readonly";
import buttonStateBehavior from "../behaviors/button-state";

const template = /*html*/ `
    <div class="box">
      <i class="checker icon-ok"></i>
    </div>
    <span class="label">
      <slot></slot>
    </span>
  `;

export default elementUtils.registerElement("ui-checkbox", {
  get checked(): boolean {
    return this.getAttribute("checked") !== null;
  },

  set checked(value: boolean) {
    if (value || value === "" as any || value === 0 as any) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
  },

  get value(): boolean {
    return this.checked;
  },

  set value(value: boolean) {
    this.checked = value;
  },

  get values(): boolean[] {
    return this._values;
  },

  set values(values: boolean[]) {
    this._values = values;
    this._updateMultiValue();
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
    return ["checked", "multi-values"];
  },

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue && (name === "checked" || name === "multi-values")) {
      const propertyName = name.replace(/-(\w)/g, (_match, letter) => letter.toUpperCase());
      (this as any)[propertyName] = newValue;
    }
  },

  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior, buttonStateBehavior],
  template,
  style: getElementStyleSync("checkbox"),

  factoryImpl(checked: boolean, label?: string): void {
    if (label) {
      this.innerText = label;
    }
    this.checked = checked;
  },

  ready(): void {
    this.multiValues = this.getAttribute("multi-values") as any;
    this._initFocusable(this);
    this._initDisable(false);
    this._initReadonly(false);
    this._initButtonState(this);
  },

  _onButtonClick(_element: HTMLElement, event: MouseEvent): void {
    if (!this.readonly) {
      event.stopPropagation();
      this.checked = !this.checked;
      this.multiValues = false;
      fire(this, "change", {
        bubbles: true,
        detail: { value: this.checked },
      });

      fire(this, "confirm", {
        bubbles: true,
        detail: { value: this.checked },
      });
    }
  },

  _updateMultiValue(): void {
    if (
      !this.multiValues ||
      !this._values ||
      this.values.length <= 1
    ) {
      return this.removeAttribute("multi-values");
    }

    if (this._values.every((value: boolean, index: number) => index === 0 || value === this._values[index - 1])) {
      this.removeAttribute("multi-values");
    } else {
      this.setAttribute("multi-values", "");
    }
  },
});

