/**
 * UI-Kit 类型定义
 * 从 Cocos Creator Editor 提取的 UI 组件库
 */

// ============ 工具模块 ============

export declare const utils: {
  clamp: (val: number, min: number, max: number) => number;
  clamp01: (val: number) => number;
  lerp: (from: number, to: number, ratio: number) => number;
  numOfDecimalPlaces: (value: number) => number;
  numOfSignificantFigures: (value: number) => number;
  toPrecision: (value: number, precision: number) => number;
  calculatePrecision: (min: number, max: number, step: number) => number;
};

export declare const domUtils: {
  fire: (
    element: HTMLElement,
    eventName: string,
    opts?: { bubbles?: boolean; composed?: boolean; detail?: any },
  ) => void;
  acceptEvent: (event: Event) => void;
  installDownUpEvent: (element: HTMLElement) => void;
  inDocument: (element: HTMLElement) => boolean;
  addon: (object: object, ...args: object[]) => object;
  getParentTabIndex: (element: HTMLElement) => HTMLElement | null;
};

export declare const focusMgr: {
  focusParent: (element: HTMLElement) => void;
  focusLast: () => void;
  setFocusElement: (element: HTMLElement) => void;
};

export declare const cssLoader: {
  getElementStyleSync: (elementName: string, themeName?: string) => string;
  preloadElementStyles: (elementNames: string[], themeName?: string) => void;
};

// ============ Web Components 接口 ============

/** ui-button 组件 */
export interface UIButton extends HTMLElement {
  disabled: boolean;
  focused: boolean;
}

/** ui-checkbox 组件 */
export interface UICheckbox extends HTMLElement {
  checked: boolean;
  value: boolean;
  disabled: boolean;
  readonly: boolean;
}

/** ui-input 组件 */
export interface UIInput extends HTMLElement {
  value: string;
  placeholder: string;
  password: boolean;
  maxLength: number;
  disabled: boolean;
  readonly: boolean;
}

/** ui-select 组件 */
export interface UISelect extends HTMLElement {
  value: string;
  selectedIndex: number;
  disabled: boolean;
  readonly: boolean;
}

/** ui-num-input 组件 */
export interface UINumInput extends HTMLElement {
  value: number;
  min: number;
  max: number;
  step: number;
  precision: number;
  disabled: boolean;
  readonly: boolean;
}

/** ui-progress 组件 */
export interface UIProgress extends HTMLElement {
  value: number;
}

/** ui-slider 组件 */
export interface UISlider extends HTMLElement {
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  readonly: boolean;
}

/** ui-color 组件 */
export interface UIColor extends HTMLElement {
  value: string;
  disabled: boolean;
  readonly: boolean;
}

/** ui-section 组件 */
export interface UISection extends HTMLElement {
  name: string;
  folded: boolean;
  foldable: boolean;
}

/** ui-prop 组件 */
export interface UIProp extends HTMLElement {
  name: string;
  tooltip: string;
  type: string;
  slidable: boolean;
}

/** ui-text-area 组件 */
export interface UITextArea extends HTMLElement {
  value: string;
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
}

// ============ 全局类型扩展 ============

declare global {
  interface HTMLElementTagNameMap {
    'ui-button': UIButton;
    'ui-checkbox': UICheckbox;
    'ui-input': UIInput;
    'ui-select': UISelect;
    'ui-num-input': UINumInput;
    'ui-progress': UIProgress;
    'ui-slider': UISlider;
    'ui-color': UIColor;
    'ui-section': UISection;
    'ui-prop': UIProp;
    'ui-text-area': UITextArea;
  }

  interface HTMLElementEventMap {
    confirm: CustomEvent;
    change: CustomEvent;
    cancel: CustomEvent;
  }
}

// ============ Vue 组件重导出 ============

export * from './cc';
