/**
 * UI Text Area 组件
 */

import elementUtils from "../utils/utils";
import { getElementStyleSync } from "../utils/css-loader";
import { fire } from "../utils/dom-utils";
import focusMgr from "../utils/focus-mgr";
import focusableBehavior from "../behaviors/focusable";
import disableBehavior from "../behaviors/disable";
import readonlyBehavior from "../behaviors/readonly";
import inputStateBehavior from "../behaviors/input-state";

const template = /*html*/ `
    <div class="back">
      <span>⌘ + enter</span>
    </div>
    <textarea></textarea>
  `;

interface ExtendedTextarea extends HTMLTextAreaElement {
  _initValue?: string;
}

export default elementUtils.registerElement("ui-text-area", {
  get value(): string {
    return this._value;
  },

  set value(value: string | null | undefined) {
    if (value === null || value === undefined) {
      value = "";
    }

    value += "";
    this._value = value;

    if (!this._multiValues) {
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
      this.$input.value = "-";
    }
  },

  get placeholder(): string {
    return this.$input.placeholder;
  },

  set placeholder(value: string) {
    this.$input.placeholder = value;
  },

  get maxLength(): number | null {
    return this._maxLength;
  },

  set maxLength(value: number | string | null) {
    let numValue: number | null = value as number;
    if (numValue !== null) {
      numValue = Number(numValue);
    }

    if (isNaN(numValue as number)) {
      numValue = null;
    }

    this._maxLength = numValue;

    if (numValue) {
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

      if (boolValue) {
        this.$input.value = "-";
        this.setAttribute("multi-values", "");
      } else {
        this.$input.value = this._value;
        this.removeAttribute("multi-values");
      }
    }
  },

  get observedAttributes(): string[] {
    return ["placeholder", "max-length", "multi-values"];
  },

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      switch (name) {
        case "multi-values":
        case "placeholder":
        case "max-length": {
          const propertyName = name.replace(/-(\w)/g, (_e, t) => t.toUpperCase());
          (this as any)[propertyName] = newValue;
        }
      }
    }
  },

  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior, inputStateBehavior],
  template,
  style: getElementStyleSync("text-area"),
  $: { input: "textarea", span: "span" },

  factoryImpl(value: string): void {
    if (value) {
      this.value = value;
    }
  },

  ready(): void {
    this._value = "";
    this._values = [""];
    this.value = this.getAttribute("value") || "";
    this.placeholder = this.getAttribute("placeholder") || "";
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
    this._value = "";
    this._values = [""];
    this.$input.value = "";
    this.confirm();
  },

  confirm(): void {
    this._onInputConfirm(this.$input);
  },

  cancel(): void {
    this._onInputCancel(this.$input);
  },

  _initEvents(): void {
    this.addEventListener("mousedown", this._mouseDownHandler);
    this.addEventListener("focus-changed", this._focusChangedHandler);
    this.$input.addEventListener("focus", () => {
      this.$span.style.display = "inline-block";
    });

    this.$input.addEventListener("blur", () => {
      this.$span.style.display = "none";
    });
  },

  _onInputConfirm(input: ExtendedTextarea, confirmByEnter?: boolean): void {
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

  _onInputCancel(input: ExtendedTextarea, cancelByEsc?: boolean): void {
    if (!this.readonly) {
      if (this._changed) {
        this._changed = false;

        if (input._initValue !== input.value) {
          this._value = input.value = input._initValue || "";
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

  _onInputChange(input: HTMLTextAreaElement): void {
    this._changed = true;

    if (this._maxLength && input.value.length > this._maxLength) {
      input.value = input.value.substr(0, this._maxLength);
    }

    this._value = input.value;
    fire(this, "change", { bubbles: true, detail: { value: input.value } });
  },

  _mouseDownHandler(event: MouseEvent): void {
    event.stopPropagation();
    focusMgr._setFocusElement(this);
  },

  _focusChangedHandler(): void {
    if (this.focused) {
      (this.$input as ExtendedTextarea)._initValue = this.$input.value;
    } else {
      this._unselect(this.$input);
    }
  },
});

