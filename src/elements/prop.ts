/**
 * UI Prop 组件
 */

import elementUtils from "../utils/utils";
import { getElementStyleSync } from "../utils/css-loader";
import { walk, fire, acceptEvent } from "../utils/dom-utils";
import focusMgr from "../utils/focus-mgr";
import focusableBehavior from "../behaviors/focusable";
import disableBehavior from "../behaviors/disable";
import readonlyBehavior from "../behaviors/readonly";
import hintElement from "./hint";

const percentPattern = /\d$/;
let tooltipElement: HTMLElement | null = null;
let isResizing = false;
let resizeStartX = 0;
let resizeStartWidth = 0;

if (typeof document !== 'undefined') {
  document.addEventListener("mouseup", () => {
    isResizing = false;
  });
}

const template = /*html*/ `
    <div class="wrapper">
      <div class="label">
        <i class="move icon-braille"></i>
        <i class="fold icon-fold-up"></i>
        <span class="text"></span>
        <div class="resizer">
            <i class="resizer-icon"></i>
        </div>
        <div class="lock">
          <i class="icon-lock"></i>
        </div>
      </div>
      <div class="wrapper-content">
        <slot></slot>
      </div>
      <div class="remove">
        <i class="icon-trash-empty"></i>
      </div>
    </div>
    <slot name="child"></slot>
  `;

const propElement = elementUtils.registerElement("ui-prop", {
  get name(): string {
    return this._name;
  },

  set name(value: string) {
    if (this._name !== value) {
      this._name = value;
      this.$text.innerText = value;
    }
  },

  get slidable(): boolean {
    return this.getAttribute("slidable") !== null;
  },

  set slidable(value: boolean) {
    if (value) {
      this.setAttribute("slidable", "");
    } else {
      this.removeAttribute("slidable");
    }
  },

  get movable(): boolean {
    return this.getAttribute("movable") !== null;
  },

  set movable(value: boolean) {
    if (value) {
      this.setAttribute("movable", "");
    } else {
      this.removeAttribute("movable");
    }
  },

  get removable(): boolean {
    return this.getAttribute("removable") !== null;
  },

  set removable(value: boolean) {
    if (value) {
      this.setAttribute("removable", "");
    } else {
      this.removeAttribute("removable");
    }
  },

  get foldable(): boolean {
    return this.getAttribute("foldable") !== null;
  },

  set foldable(value: boolean) {
    if (value) {
      this.setAttribute("foldable", "");
    } else {
      this.removeAttribute("foldable");
    }
  },

  get autoHeight(): boolean {
    return this.getAttribute("auto-height") !== null;
  },

  set autoHeight(value: boolean) {
    if (value) {
      this.setAttribute("auto-height", "");
    } else {
      this.removeAttribute("auto-height");
    }
  },

  get selected(): boolean {
    return this.getAttribute("selected") !== null;
  },

  set selected(value: boolean) {
    if (value) {
      this.setAttribute("selected", "");
    } else {
      this.removeAttribute("selected");
    }
  },

  get hovering(): boolean {
    return this.getAttribute("hovering") !== null;
  },

  set hovering(value: boolean) {
    if (value) {
      this.setAttribute("hovering", "");
    } else {
      this.removeAttribute("hovering");
    }
  },

  get indent(): number {
    return this._indent;
  },

  set indent(value: number | string) {
    const numValue = parseInt(String(value));
    if (this._indent !== numValue) {
      this.setAttribute("indent", String(numValue));
      this.$label.style.paddingLeft = `${13 * numValue}px`;
      this._indent = numValue;
    }
  },

  get multiValues(): boolean {
    return this._multiValues;
  },

  set multiValues(value: boolean) {
    const boolValue = !(value == null || value === false);
    const oldValue = this._multiValues;
    this._multiValues = boolValue;

    if (boolValue) {
      this.setAttribute("multi-values", "");
    } else {
      this.removeAttribute("multi-values");
    }

    if (this.multiValuesChanged) {
      this.multiValuesChanged(oldValue, boolValue);
    }
  },

  get value(): any {
    return this._value;
  },

  set value(newValue: any) {
    if (this._value !== newValue) {
      const oldValue = this._value;
      this._value = newValue;

      if (this.valueChanged) {
        this.valueChanged(oldValue, newValue);
      }
    }
  },

  get values(): any[] {
    return this._values;
  },

  set values(newValues: any[]) {
    if (JSON.stringify(this.values) !== JSON.stringify(newValues)) {
      const oldValues = this._values;
      this._values = newValues;

      if (this.valuesChanged) {
        this.valuesChanged(oldValues, newValues);
      }
    }
  },

  get attrs(): Record<string, any> {
    return this._attrs;
  },

  set attrs(newAttrs: Record<string, any>) {
    if (this._attrs !== newAttrs) {
      const oldAttrs = this._attrs;
      this._attrs = newAttrs;

      if (this.attrsChanged) {
        this.attrsChanged(oldAttrs, newAttrs);
      }
    }
  },

  set type(value: string | null) {
    if (this._type !== value) {
      this._type = value;
      if (this._type !== null) {
        this.regen();
      }
    }
  },

  get type(): string | null {
    return this._type;
  },

  get tooltip(): string {
    return this._tooltip;
  },

  set tooltip(value: string) {
    this._tooltip = value;
  },

  get path(): string {
    return this._path;
  },

  get labelWidth(): string {
    return this._labelWidth || this.$label.style.width;
  },

  set labelWidth(value: string) {
    if (value) {
      if (percentPattern.test(value)) {
        value += "%";
      }
      this._labelWidth = value;
      this.$label.style.width = value;
    }
  },

  get observedAttributes(): string[] {
    return [
      "type",
      "name",
      "indent",
      "tooltip",
      "multi-values",
      "label-width",
      "input-type",
      "min",
      "max",
      "step",
      "precision",
    ];
  },

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      if (
        name === "type" ||
        name === "name" ||
        name === "indent" ||
        name === "tooltip" ||
        name === "multi-values" ||
        name === "label-width"
      ) {
        const propertyName = name.replace(/-(\w)/g, (_t, e) => e.toUpperCase());
        (this as any)[propertyName] = newValue;
      }

      if (
        this._type === "number" &&
        (name === "input-type" ||
          name === "min" ||
          name === "max" ||
          name === "step" ||
          name === "precision")
      ) {
        this.regen();
      }
    }
  },

  behaviors: [focusableBehavior, disableBehavior, readonlyBehavior],
  template,
  style: getElementStyleSync("prop"),
  $: {
    label: ".label",
    moveIcon: ".move",
    removeIcon: ".remove",
    foldIcon: ".fold",
    text: ".text",
    resizer: ".resizer",
  },

  factoryImpl(name: string, value?: any, type?: string, attrs?: Record<string, any>, indent?: number): void {
    this.name = name || "";
    this.indent = indent || 0;
    this._value = value;
    this._attrs = attrs || {};
    this._type = type || typeof value;
    this.regen();
  },

  ready(): void {
    if (this.querySelector('[slot="child"]') === null) {
      const childEl = this.querySelector(".child");
      if (childEl) {
        childEl.setAttribute("slot", "child");
      }
    }

    const name = this.getAttribute("name");
    this._name = name !== null ? name : "-";
    const labelWidth = this.getAttribute("label-width");

    if (labelWidth) {
      this.labelWidth = labelWidth;
    }

    this._path = this.getAttribute("path") || "";
    const indentAttr = this.getAttribute("indent");
    let indent = 0;

    if (indentAttr !== null) {
      indent = parseInt(indentAttr, 10);
      this.$label.style.paddingLeft = `${13 * indent}px`;
    }

    this._indent = indent;
    this.multiValues = this.getAttribute("multi-values") as any;

    if (this.getAttribute("folded") !== null) {
      this.fold();
    } else {
      this.foldup();
    }

    if (indent >= 1 && this.movable) {
      this.$moveIcon.style.left = `${13 * (indent - 1)}px`;
    }

    this.tooltip = this.getAttribute("tooltip") || "";
    this.$text.innerText = this._name;
    this._initFocusable(this);
    this._initDisable(true);
    this._initReadonly(true);
    this._initEvents();
    this._type = this.getAttribute("type");

    if (this._type !== null) {
      this.regen();
    }

    if (this._disabled) {
      walk(this, { excludeSelf: true }, (el: HTMLElement) => {
        if (el.tagName.indexOf("UI-") === 0) {
          el.setAttribute("is-disabled", "");
        }
        return false;
      });
    }

    if (this._readonly) {
      walk(this, { excludeSelf: true }, (el: HTMLElement) => {
        if (el.tagName.indexOf("UI-") === 0) {
          el.setAttribute("is-readonly", "");
        }
        return false;
      });
    }
  },

  connectedCallback(): void {
    fire(this, "ui-prop-connected", { bubbles: true, detail: this });
  },

  fold(): void {
    if (!this._folded) {
      this._folded = true;
      this.$foldIcon.classList.remove("icon-fold-up");
      this.$foldIcon.classList.add("icon-fold");
      this.setAttribute("folded", "");
    }
  },

  foldup(): void {
    if (this._folded) {
      this._folded = false;
      this.$foldIcon.classList.remove("icon-fold");
      this.$foldIcon.classList.add("icon-fold-up");
      this.removeAttribute("folded");
    }
  },

  regen(regenerate?: boolean): void {
    elementUtils.regenProperty(this, regenerate);
  },

  installStandardEvents(element: HTMLElement): void {
    if (typeof this.inputValue !== "function") {
      throw new Error("Invalid proto, inputValue is not defined.");
    }

    element.addEventListener("change", () => {
      this._value = this.inputValue();
      this._emitChange();
    });

    element.addEventListener("confirm", () => {
      this._value = this.inputValue();
      this._emitConfirm();
    });

    element.addEventListener("cancel", () => {
      this._value = this.inputValue();
      this._emitCancel();
    });
  },

  installSlideEvents(
    prop: HTMLElement,
    onChange?: (dx: number, dy: number) => void,
    onConfirm?: () => void,
    onCancel?: () => void
  ): void {
    if (!(prop instanceof (propElement as any))) {
      throw new Error("Invalid element, only <ui-prop> has slide events.");
    }
    if (typeof this.inputValue !== "function") {
      throw new Error("Invalid proto, inputValue is not defined.");
    }

    prop.addEventListener("slide-start", () => {
      this._initValue = this.inputValue();
    });

    prop.addEventListener("slide-change", ((event: CustomEvent) => {
      if (onChange) {
        onChange(event.detail.dx, event.detail.dy);
      }

      this._changed = true;
      this._value = this.inputValue();
      this._emitChange();
    }) as EventListener);

    prop.addEventListener("slide-confirm", () => {
      if (this._changed) {
        this._changed = false;
        this._value = this.inputValue();
        onConfirm?.();
        this._emitConfirm();
      }
    });

    prop.addEventListener("slide-cancel", () => {
      if (this._changed) {
        this._changed = false;
        this._value = this._initValue;
        onCancel?.();
        this._emitCancel();
      }
    });
  },

  _emitConfirm(): void {
    fire(this, "confirm", {
      bubbles: true,
      detail: { path: this._path, value: this._value },
    });
  },

  _emitCancel(): void {
    fire(this, "cancel", {
      bubbles: true,
      detail: { path: this._path, value: this._value },
    });
  },

  _emitChange(): void {
    fire(this, "change", {
      bubbles: true,
      detail: { path: this._path, value: this._value },
    });
  },

  _emitLabelWidthChange(width: string): void {
    fire(this, "label-width-change", { bubbles: true, detail: width });
  },

  _initEvents(): void {
    const finishResize = (target: HTMLElement) => {
      isResizing = false;
      fire(target, "label-width-change-finish", { bubbles: true });
    };

    this.addEventListener("focus-changed", ((event: CustomEvent) => {
      if (this.parentElement instanceof (propElement as any)) {
        event.stopPropagation();
      }

      this.selected = event.detail.focused;

      if (!this.disabled && event.detail.focused && event.target === this) {
        const firstFocusable = this._getFirstFocusableElement();
        if (firstFocusable) {
          focusMgr._setFocusElement(firstFocusable);
        }
      }
    }) as EventListener);

    this.addEventListener("mouseover", (event: Event) => {
      event.stopImmediatePropagation();
      this.hovering = true;
    });

    this.addEventListener("mouseout", (event: Event) => {
      event.stopImmediatePropagation();
      this.hovering = false;
    });

    this.$label.addEventListener("mouseenter", () => {
      this._showTooltip();
    });

    this.$label.addEventListener("mouseleave", () => {
      this._hideTooltip();
    });

    this.$moveIcon.addEventListener("mouseenter", () => {
      this.style.backgroundColor = "rgba(0,0,0,0.1)";
    });

    this.$moveIcon.addEventListener("mouseleave", () => {
      this.style.backgroundColor = "";
    });

    this.$removeIcon.addEventListener("mouseenter", () => {
      this.style.backgroundColor = "rgba(255,0,0,0.3)";
      this.style.outline = "1px solid rgba(255,0,0,1)";
    });

    this.$removeIcon.addEventListener("mouseleave", () => {
      this.style.backgroundColor = "";
      this.style.outline = "";
    });

    this.addEventListener("mousedown", (event: Event) => {
      acceptEvent(event);

      if (this.disabled) {
        focusMgr._setFocusElement(this);
        return;
      }

      focusMgr._setFocusElement(null);
      const firstFocusable = this._getFirstFocusableElement();

      if (firstFocusable) {
        focusMgr._setFocusElement(firstFocusable);
      } else {
        focusMgr._setFocusElement(this);
      }
    });

    this.addEventListener("keydown", (event: Event) => {
      const e = event as KeyboardEvent;
      switch (e.keyCode) {
        case 13:
        case 27:
          break;
        case 37:
          acceptEvent(e);
          this.fold();
          break;
        case 39:
          acceptEvent(e);
          this.foldup();
          break;
      }
    });

    this.$foldIcon.addEventListener("click", () => {
      if (this._folded) {
        this.foldup();
      } else {
        this.fold();
      }
    });

    this.$resizer.addEventListener("mousedown", (event: Event) => {
      const e = event as MouseEvent;
      if (!this._readonly && !this.slidable) {
        isResizing = true;
        resizeStartX = e.pageX;
        resizeStartWidth = this.$label.clientWidth;
      }
    });

    this.addEventListener("mousemove", (event: Event) => {
      const e = event as MouseEvent;
      if (!isResizing) {
        return;
      }
      const label = this.$label;
      const currentRatio = label.clientWidth / label.parentElement!.clientWidth;
      const newRatio = (resizeStartWidth + (e.pageX - resizeStartX)) / label.parentElement!.clientWidth;
      let minWidth = 80;
      const computedMinWidth = getComputedStyle(this.$label).minWidth;

      if (computedMinWidth !== "auto") {
        minWidth = parseFloat(computedMinWidth.slice(0, -2));
      }

      if ((newRatio <= currentRatio || newRatio <= 0.8) && newRatio * (label.clientWidth / currentRatio) > minWidth) {
        label.style.width = `${100 * newRatio}%`;
        this._emitLabelWidthChange(label.style.width);
      }
    });

    this.$resizer.addEventListener("mouseup", () => {
      finishResize(this);
    });

    this.$resizer.addEventListener("mousecancel", () => {
      finishResize(this);
    });

    this.addEventListener("mouseup", () => {
      finishResize(this);
    });
  },

  _showTooltip(): void {
    if (this.tooltip) {
      if (!tooltipElement) {
        tooltipElement = new (hintElement as any)(this._tooltip);
        tooltipElement!.style.display = "none";
        tooltipElement!.style.position = "absolute";
        tooltipElement!.style.maxWidth = "200px";
        tooltipElement!.style.zIndex = "999";
        tooltipElement!.classList.add("bottom", "shadow");
        (tooltipElement as any).position = "20px";
        document.body.appendChild(tooltipElement!);
      }
      tooltipElement!.innerText = this._tooltip;

      this._showTooltipID = setTimeout(() => {
        this._showTooltipID = null;
        tooltipElement!.style.display = "block";
        const textRect = this.$text.getBoundingClientRect();
        const tooltipRect = tooltipElement!.getBoundingClientRect();
        tooltipElement!.style.left = `${textRect.left - 10}px`;
        tooltipElement!.style.top = `${textRect.top - tooltipRect.height - 10}px`;
      }, 200);
    }
  },

  _hideTooltip(): void {
    if (this.tooltip) {
      clearTimeout(this._showTooltipID);
      this._showTooltipID = null;
      if (tooltipElement) {
        tooltipElement.style.display = "none";
      }
    }
  },

  // 可选回调
  valueChanged: undefined as ((oldValue: any, newValue: any) => void) | undefined,
  valuesChanged: undefined as ((oldValues: any[], newValues: any[]) => void) | undefined,
  attrsChanged: undefined as ((oldAttrs: Record<string, any>, newAttrs: Record<string, any>) => void) | undefined,
  multiValuesChanged: undefined as ((oldValue: boolean, newValue: boolean) => void) | undefined,
  inputValue: undefined as (() => any) | undefined,
});

export default propElement;

