/**
 * UI Select 组件
 */

import elementUtils from "../utils/utils";
import { getElementStyleSync } from "../utils/css-loader";
import { acceptEvent, fire, clear } from "../utils/dom-utils";
import focusMgr from "../utils/focus-mgr";
import focusableBehavior from "../behaviors/focusable";
import disableBehavior from "../behaviors/disable";
import readonlyBehavior from "../behaviors/readonly";

const template = /*html*/ `
    <select></select>
  `;

export default elementUtils.registerElement("ui-select", {
  get value(): string {
    return this._value;
  },

  set value(value: string) {
    const oldValue = this._value;
    this._value = value;

    if (this.valueChanged) {
      this.valueChanged(oldValue, value);
    }

    if (!this.multiValues) {
      this.$select.value = value;
    }
  },

  get values(): string[] {
    return this._values;
  },

  set values(values: string[]) {
    const oldValues = this._values;
    this._values = values;

    if (this.valuesChanged) {
      this.valuesChanged(oldValues, values);
    }

    if (this.multiValues) {
      this.$select.value = "";
    }
  },

  get selectedIndex(): number {
    return this.$select.selectedIndex;
  },

  set selectedIndex(index: number) {
    this.$select.selectedIndex = index;
  },

  get selectedText(): string {
    return this.$select.item(this.$select.selectedIndex)?.text || "";
  },

  get multiValues(): boolean {
    return this._multiValues;
  },

  set multiValues(value: boolean) {
    const boolValue = !(value == null || value === false);
    if (boolValue !== this._multiValues) {
      if (boolValue) {
        this.$select.value = "";
        this.setAttribute("multi-values", "");
      } else {
        this.$select.value = this._value;
        this.removeAttribute("multi-values");
      }

      this._multiValues = boolValue;
    }
  },

  get observedAttributes(): string[] {
    return ["selectedIndex", "selectedText", "multi-values"];
  },

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (
      oldValue !== newValue &&
      (name === "selectedIndex" ||
        name === "selectedText" ||
        name === "multi-values")
    ) {
      const propertyName = name.replace(/-(\w)/g, (_match, letter) => letter.toUpperCase());
      (this as any)[propertyName] = newValue;
    }
  },

  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior],
  template,
  style: getElementStyleSync("select"),
  $: { select: "select" },

  factoryImpl(value: string): void {
    if (!isNaN(Number(value))) {
      this.value = value;
    }
  },

  ready(): void {
    this._observer = new MutationObserver(() => {
      this._updateItems();
    });

    this._observer.observe(this, { childList: true });
    for (let i = 0; i < this.children.length; ++i) {
      const child = this.children[i];
      if (child instanceof HTMLOptionElement || child instanceof HTMLOptGroupElement) {
        const cloned = child.cloneNode(true);
        this.$select.add(cloned as HTMLOptionElement | HTMLOptGroupElement, null);
      }
    }
    const valueAttr = this.getAttribute("value");

    if (valueAttr !== null) {
      this._value = valueAttr;
      this.$select.value = valueAttr;
    } else {
      this._value = this.$select.value;
    }

    this.multiValues = this.getAttribute("multi-values") as any;
    this._initFocusable(this.$select);
    this._initDisable(false);
    this._initReadonly(false);
    this.addEventListener("mousedown", this._mouseDownHandler);

    this.$select.addEventListener("keydown", (event: KeyboardEvent) => {
      if (this.disabled) {
        event.preventDefault();
        return;
      }
      if (this.readonly) {
        event.preventDefault();
        return;
      }
      if (event.keyCode === 38 || event.keyCode === 40) {
        event.preventDefault();
      }
      if (event.keyCode === 32 || event.ctrlKey || event.metaKey) {
        return;
      }
      event.preventDefault();
    });

    this.$select.addEventListener("change", (event: Event) => {
      acceptEvent(event);
      this._value = this.$select.value;
      this.multiValues = false;

      fire(this, "change", {
        bubbles: true,
        detail: {
          index: this.selectedIndex,
          value: this.value,
          text: this.selectedText,
        },
      });

      fire(this, "confirm", {
        bubbles: true,
        detail: {
          index: this.selectedIndex,
          value: this.value,
          text: this.selectedText,
        },
      });
    });
  },

  _mouseDownHandler(event: MouseEvent): void {
    event.stopPropagation();
    this._mouseStartX = event.clientX;

    if (!this._inputFocused) {
      this._selectAllWhenMouseUp = true;
    }

    focusMgr._setFocusElement(this);

    if (this.readonly) {
      acceptEvent(event);
      return;
    }
  },

  _updateItems(): void {
    clear(this.$select);
    for (let i = 0; i < this.children.length; ++i) {
      const child = this.children[i];
      if (child instanceof HTMLOptionElement || child instanceof HTMLOptGroupElement) {
        const cloned = child.cloneNode(true);
        this.$select.add(cloned as HTMLOptionElement | HTMLOptGroupElement, null);
      }
    }
    this.$select.value = this._value;
  },

  addItem(value: string, text: string, index?: number): void {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    this.addElement(option, index);
    this._value = this.$select.value;
  },

  addElement(element: HTMLOptionElement | HTMLOptGroupElement, index?: number): void {
    if (!(element instanceof HTMLOptionElement || element instanceof HTMLOptGroupElement)) {
      return;
    }
    let beforeElement: HTMLOptionElement | null;
    this._observer.disconnect();

    if (index !== undefined) {
      this.insertBefore(element, this.children[index]);
    } else {
      this.appendChild(element);
    }

    beforeElement = index !== undefined ? this.$select.item(index) as HTMLOptionElement : null;
    this.$select.add(element.cloneNode(true) as HTMLOptionElement | HTMLOptGroupElement, beforeElement);
    this._observer.observe(this, { childList: true });
  },

  removeItem(index: number): void {
    this.$select.remove(index);
  },

  clear(): void {
    clear(this.$select);
    this._value = "";
    this.$select.value = "";
  },

  // 可选的回调函数
  valueChanged: undefined as ((oldValue: string, newValue: string) => void) | undefined,
  valuesChanged: undefined as ((oldValues: string[], newValues: string[]) => void) | undefined,
});

