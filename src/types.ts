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
  get focusable(): boolean;
  get focused(): boolean;
  get unnavigable(): boolean;
  set unnavigable(value: boolean);
  _focusedChangedCallbacks?: Array<(focused: boolean) => void>;
  _focusELs?: HTMLElement[];
  _navELs?: HTMLElement[];
  _curFocus?: HTMLElement;
  _setFocused(focused: boolean): void;
  _initFocusable(focusEls?: HTMLElement | HTMLElement[], navEls?: HTMLElement | HTMLElement[]): void;
  _getFirstFocusableElement(): HTMLElement | null;
  [key: string]: unknown;
}

export interface DisableBehavior {
  get canBeDisable(): boolean;
  get disabled(): boolean;
  set disabled(value: boolean);
  _disabled?: boolean;
  _disabledNested?: boolean;
  _initDisable(nested?: boolean): void;
  _propgateDisable(): void;
  _isDisabledInHierarchy(excludeSelf?: boolean): boolean;
  _isDisabledSelf(): boolean;
  _setIsDisabledAttribute(disabled: boolean): void;
  [key: string]: unknown;
}

export interface ReadonlyBehavior {
  get readonly(): boolean;
  set readonly(value: boolean);
  _initReadonly(nested?: boolean): void;
  [key: string]: unknown;
}

export interface ButtonStateBehavior {
  _canceledByEsc?: boolean;
  _enterTimeoutID?: ReturnType<typeof setTimeout> | null;
  _onButtonClick?(el: HTMLElement, event: MouseEvent): void;
  _initButtonState(el: HTMLElement): void;
  _setPressed(el: HTMLElement, pressed: boolean): void;
  [key: string]: unknown;
}

export interface InputStateBehavior {
  _inputElement?: HTMLInputElement | HTMLTextAreaElement;
  _initInputState(inputEl?: HTMLInputElement | HTMLTextAreaElement): void;
  [key: string]: unknown;
}

export interface DockableBehavior {
  _dockable: boolean;
  get noCollapse(): boolean;
  set noCollapse(value: boolean);
  _preferredWidth?: number | "auto";
  _preferredHeight?: number | "auto";
  _computedMinWidth?: number;
  _computedMinHeight?: number;
  _computedMaxWidth?: number | "auto";
  _computedMaxHeight?: number | "auto";
  _initDockable(): void;
  addDock(position: string, element: HTMLElement, noResize?: boolean): void;
  removeDock(element: HTMLElement): boolean;
  _collapse(): boolean;
  _notifyResize(): void;
  _makeRoomForNewComer(position: string, element: HTMLElement): void;
  [key: string]: unknown;
}

export interface ResizableBehavior {
  _resizable: boolean;
  get row(): boolean;
  set row(value: boolean);
  _initWidth?: number | "auto";
  _initHeight?: number | "auto";
  _initMinWidth?: number;
  _initMinHeight?: number;
  _initMaxWidth?: number | "auto";
  _initMaxHeight?: number | "auto";
  _preferredWidth?: number | "auto";
  _preferredHeight?: number | "auto";
  _computedMinWidth?: number;
  _computedMinHeight?: number;
  _computedMaxWidth?: number | "auto";
  _computedMaxHeight?: number | "auto";
  _needEvaluateSize?: boolean;
  _initResizable(): void;
  _notifyResize(): void;
  calcWidth(width: number): number;
  calcHeight(height: number): number;
  _finalizePreferredSizeRecursively(): void;
  _finalizeMinMaxRecursively(): void;
  _finalizeStyleRecursively(): void;
  _reflowRecursively(): void;
  _finalizeMinMax(): void;
  _finalizePreferredSize(): void;
  _finalizeStyle(): void;
  _reflow(): void;
  [key: string]: unknown;
}

export interface DroppableBehavior {
  _droppable?: boolean;
  _dragenterCnt?: number;
  _canDrop?: boolean;
  get droppable(): string | null;
  set droppable(value: string | null);
  get multi(): boolean;
  set multi(value: boolean);
  get canDrop(): boolean;
  _initDroppable(element: HTMLElement): void;
  [key: string]: unknown;
}

