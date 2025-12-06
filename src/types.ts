/**
 * 通用类型定义
 */

/**
 * 自定义事件触发选项
 */
export interface FireOptions extends CustomEventInit {
  detail?: unknown;
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
}

/**
 * DOM 遍历选项
 */
export interface WalkOptions {
  excludeSelf?: boolean;
}

/**
 * 元素注册配置
 */
export interface ElementRegistration {
  tagName: string;
  template?: string;
  style?: string;
  listeners?: Record<string, EventListener>;
  behaviors?: object[];
  $?: Record<string, string>;
  shadowDOM?: boolean;
}

/**
 * 元素配置
 */
export interface ElementConfig {
  tagName?: string;
  template?: string;
  style?: string;
  $?: Record<string, string>;
  listeners?: Record<string, EventListener>;
  behaviors?: object[];
  shadowDOM?: boolean;
  [key: string]: unknown;
}

/**
 * Behavior 接口
 */
export interface Behavior {
  [key: string]: unknown;
}

/**
 * CSS 样式映射
 */
export type CSSMap = Record<string, string>;

/**
 * 可聚焦元素接口
 */
export interface FocusableElement extends HTMLElement {
  focused?: boolean;
  unnavigable?: boolean;
  focusable?: boolean;
  _focusedChangedCallbacks?: Array<(focused: boolean) => void>;
  _setFocused?: (focused: boolean) => void;
  _losingFocus?: () => void;
  _initFocusable?: () => void;
}

/**
 * 可禁用元素接口
 */
export interface DisableableElement extends HTMLElement {
  disabled?: boolean;
  _initDisable?: () => void;
  _propDisableToChild?: (disabled: boolean) => void;
}

/**
 * 只读元素接口
 */
export interface ReadonlyElement extends HTMLElement {
  readonly?: boolean;
  _initReadonly?: () => void;
}

/**
 * 按钮状态元素接口
 */
export interface ButtonStateElement extends HTMLElement {
  pressed?: boolean;
  _initButtonState?: () => void;
}

/**
 * 输入状态元素接口
 */
export interface InputStateElement extends HTMLElement {
  _inputElement?: HTMLInputElement | HTMLTextAreaElement;
  _initInputState?: () => void;
  _onInputConfirm?: (value: string, event?: Event) => void;
  _onInputCancel?: (event?: Event) => void;
  _onInputChange?: (event?: Event) => void;
}

/**
 * 可停靠元素接口
 */
export interface DockableElement extends HTMLElement {
  _dockable?: boolean;
  noCollapse?: boolean;
  _preferredWidth?: number | "auto";
  _preferredHeight?: number | "auto";
  _computedMinWidth?: number;
  _computedMinHeight?: number;
  _computedMaxWidth?: number | "auto";
  _computedMaxHeight?: number | "auto";
  _initDockable?: () => void;
  addDock?: (el: HTMLElement, before?: HTMLElement | null) => void;
  removeDock?: (el: HTMLElement) => void;
  _collapse?: () => void;
}

/**
 * 可调整大小元素接口
 */
export interface ResizableElement extends HTMLElement {
  row?: boolean;
  _initWidth?: number;
  _initHeight?: number;
  _minWidth?: number;
  _maxWidth?: number;
  _minHeight?: number;
  _maxHeight?: number;
  _initResizable?: () => void;
}

/**
 * 可拖放元素接口
 */
export interface DroppableElement extends HTMLElement {
  droppable?: string;
  multi?: boolean;
  _droppable?: boolean;
  _initDroppable?: () => void;
}

/**
 * Behavior 类型定义
 */
export interface FocusableBehavior {
  get focused(): boolean;
  set focused(value: boolean);
  get unnavigable(): boolean;
  set unnavigable(value: boolean);
  _focusedChangedCallbacks?: Array<(focused: boolean) => void>;
  _setFocused(focused: boolean): void;
  _losingFocus(): void;
  _initFocusable(el?: HTMLElement): void;
  [key: string]: unknown;
}

export interface DisableBehavior {
  get disabled(): boolean;
  set disabled(value: boolean);
  _initDisable(nested?: boolean): void;
  _propDisableToChild(disabled: boolean): void;
  [key: string]: unknown;
}

export interface ReadonlyBehavior {
  get readonly(): boolean;
  set readonly(value: boolean);
  _initReadonly(nested?: boolean): void;
  [key: string]: unknown;
}

export interface ButtonStateBehavior {
  get pressed(): boolean;
  set pressed(value: boolean);
  _initButtonState(el?: HTMLElement): void;
  [key: string]: unknown;
}

export interface InputStateBehavior {
  _inputElement?: HTMLInputElement | HTMLTextAreaElement;
  _initInputState(inputEl?: HTMLInputElement | HTMLTextAreaElement): void;
  [key: string]: unknown;
}

export interface DockableBehavior {
  _dockable: boolean;
  noCollapse: boolean;
  _preferredWidth: number | "auto";
  _preferredHeight: number | "auto";
  _computedMinWidth: number;
  _computedMinHeight: number;
  _computedMaxWidth: number | "auto";
  _computedMaxHeight: number | "auto";
  _initDockable(): void;
  addDock(el: HTMLElement, before?: HTMLElement | null): void;
  removeDock(el: HTMLElement): void;
  _collapse(): void;
  [key: string]: unknown;
}

export interface ResizableBehavior {
  row: boolean;
  _initWidth: number;
  _initHeight: number;
  _minWidth: number;
  _maxWidth: number;
  _minHeight: number;
  _maxHeight: number;
  _initResizable(): void;
  [key: string]: unknown;
}

export interface DroppableBehavior {
  _droppable: boolean;
  _initDroppable(): void;
  [key: string]: unknown;
}

