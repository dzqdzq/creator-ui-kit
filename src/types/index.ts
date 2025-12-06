/**
 * UI Kit 核心类型定义
 */

// ============ 基础类型 ============

export interface ElementConfig {
  template?: string;
  style?: string;
  listeners?: Record<string, EventListener>;
  behaviors?: Behavior[];
  $?: Record<string, string>;
  factoryImpl?: (...args: any[]) => void;
  shadowDOM?: boolean;
  observedAttributes?: string[];
  [key: string]: any;
}

export interface Behavior {
  [key: string]: any;
}

// ============ DOM 工具类型 ============

export interface FireOptions {
  bubbles?: boolean;
  composed?: boolean;
  detail?: any;
}

export interface WalkOptions {
  excludeSelf?: boolean;
}

// ============ CSS 加载器类型 ============

export interface CSSMap {
  [elementName: string]: string;
}

// ============ 焦点管理器类型 ============

export interface FocusableElement extends HTMLElement {
  focusable?: boolean;
  focused?: boolean;
  _setFocused?(focused: boolean): void;
  _focusELs?: HTMLElement[];
  _navELs?: HTMLElement[];
}

// ============ Behaviors 类型 ============

export interface FocusableBehavior {
  focusable: boolean;
  focused: boolean;
  unnavigable: boolean;
  _initFocusable(
    focusEls?: HTMLElement | HTMLElement[],
    navEls?: HTMLElement | HTMLElement[],
  ): void;
  _getFirstFocusableElement(): HTMLElement | null;
  _setFocused(focused: boolean): void;
  _focusELs?: HTMLElement[];
  _navELs?: HTMLElement[];
  _curFocus?: HTMLElement;
}

export interface DisableBehavior {
  canBeDisable: boolean;
  disabled: boolean;
  _initDisable(nested: boolean): void;
  _propgateDisable(): void;
  _isDisabledInHierarchy(excludeSelf?: boolean): boolean;
  _isDisabledSelf(): boolean;
  _setIsDisabledAttribute(disabled: boolean): void;
  _disabled?: boolean;
  _disabledNested?: boolean;
}

export interface ReadonlyBehavior {
  canBeReadonly: boolean;
  readonly: boolean;
  _initReadonly(nested: boolean): void;
  _propgateReadonly(): void;
  _isReadonlyInHierarchy(excludeSelf?: boolean): boolean;
  _isReadonlySelf(): boolean;
  _setIsReadonlyAttribute(readonly: boolean): void;
  _readonly?: boolean;
  _readonlyNested?: boolean;
}

export interface ButtonStateBehavior {
  _initButtonState(element: HTMLElement): void;
  _setPressed(element: HTMLElement, pressed: boolean): void;
  _onButtonClick?(element: HTMLElement, event: MouseEvent): void;
  _canceledByEsc?: boolean;
  _enterTimeoutID?: ReturnType<typeof setTimeout> | null;
}

export interface InputStateBehavior {
  _initInputState(input: HTMLInputElement | HTMLTextAreaElement): void;
  _unselect(input: HTMLInputElement | HTMLTextAreaElement): void;
  _onInputConfirm(input: HTMLInputElement | HTMLTextAreaElement, confirmByEnter?: boolean): void;
  _onInputCancel(input: HTMLInputElement | HTMLTextAreaElement, cancelByEsc?: boolean): void;
  _onInputChange(input: HTMLInputElement | HTMLTextAreaElement): void;
}

export interface ResizableBehavior {
  _resizable: boolean;
  row: boolean;
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
}

export interface DockableBehavior {
  _dockable: boolean;
  noCollapse: boolean;
  _initDockable(): void;
  _notifyResize(): void;
  _collapse(): boolean;
  _makeRoomForNewComer(position: string, element: HTMLElement): void;
  addDock(position: string, element: HTMLElement, noResize?: boolean): void;
  removeDock(element: HTMLElement): boolean;
}

export interface DroppableBehavior {
  droppable: string | null;
  multi: boolean;
  canDrop: boolean;
  _initDroppable(element: HTMLElement): void;
  _dragenterCnt?: number;
  _canDrop?: boolean;
}

// ============ 元素接口类型 ============

export interface UIButtonElement
  extends HTMLElement,
    FocusableBehavior,
    DisableBehavior,
    ButtonStateBehavior {
  ready(): void;
  _onButtonClick(element: HTMLElement, event: MouseEvent): void;
}

export interface UICheckboxElement
  extends HTMLElement,
    FocusableBehavior,
    DisableBehavior,
    ReadonlyBehavior,
    ButtonStateBehavior {
  checked: boolean;
  value: boolean;
  values: boolean[];
  multiValues: boolean;
  ready(): void;
  _onButtonClick(element: HTMLElement, event: MouseEvent): void;
  _updateMultiValue(): void;
}

export interface UIInputElement
  extends HTMLElement,
    FocusableBehavior,
    DisableBehavior,
    ReadonlyBehavior,
    InputStateBehavior {
  value: string;
  values: string[];
  placeholder: string;
  password: boolean;
  maxLength: number | null;
  multiValues: boolean;
  $input: HTMLInputElement;
  ready(): void;
  clear(): void;
  confirm(): void;
  cancel(): void;
}

export interface UISelectElement
  extends HTMLElement,
    FocusableBehavior,
    DisableBehavior,
    ReadonlyBehavior {
  value: string;
  values: string[];
  selectedIndex: number;
  selectedText: string;
  multiValues: boolean;
  $select: HTMLSelectElement;
  ready(): void;
  addItem(value: string, text: string, index?: number): void;
  addElement(element: HTMLOptionElement | HTMLOptGroupElement, index?: number): void;
  removeItem(index: number): void;
  clear(): void;
  valueChanged?(oldValue: string, newValue: string): void;
  valuesChanged?(oldValues: string[], newValues: string[]): void;
}

export interface UINumInputElement
  extends HTMLElement,
    FocusableBehavior,
    DisableBehavior,
    ReadonlyBehavior,
    InputStateBehavior {
  type: 'int' | 'float';
  value: number;
  values: number[];
  min: number | null;
  max: number | null;
  precision: number;
  step: number;
  multiValues: boolean;
  highlighted: boolean;
  invalid: boolean;
  $input: HTMLInputElement;
  ready(): void;
  clear(): void;
  confirm(): void;
  cancel(): void;
}

export interface UISliderElement
  extends HTMLElement,
    FocusableBehavior,
    DisableBehavior,
    ReadonlyBehavior,
    InputStateBehavior {
  value: number;
  values: number[];
  min: number;
  max: number;
  precision: number;
  step: number;
  snap: boolean;
  multiValues: boolean;
  $wrapper: HTMLElement;
  $track: HTMLElement;
  $nubbin: HTMLElement;
  $input: HTMLInputElement;
  ready(): void;
  confirm(): void;
  cancel(): void;
}

export interface UIColorElement
  extends HTMLElement,
    FocusableBehavior,
    DisableBehavior,
    ReadonlyBehavior {
  value: number[] | string;
  values: (number[] | string)[];
  multiValues: boolean;
  $rgb: HTMLElement;
  $alpha: HTMLElement;
  ready(): void;
}

export interface UISectionElement extends HTMLElement, FocusableBehavior, DisableBehavior {
  hovering: boolean;
  $wrapper: HTMLElement;
  $foldIcon: HTMLElement;
  ready(): void;
  fold(): void;
  foldup(): void;
}

export interface UIPropElement
  extends HTMLElement,
    FocusableBehavior,
    DisableBehavior,
    ReadonlyBehavior {
  name: string;
  slidable: boolean;
  movable: boolean;
  removable: boolean;
  foldable: boolean;
  autoHeight: boolean;
  selected: boolean;
  hovering: boolean;
  indent: number;
  multiValues: boolean;
  value: any;
  values: any[];
  attrs: Record<string, any>;
  type: string | null;
  tooltip: string;
  path: string;
  labelWidth: string;
  $label: HTMLElement;
  $moveIcon: HTMLElement;
  $removeIcon: HTMLElement;
  $foldIcon: HTMLElement;
  $text: HTMLElement;
  $resizer: HTMLElement;
  ready(): void;
  fold(): void;
  foldup(): void;
  regen(regenerate?: boolean): void;
  installStandardEvents(element: HTMLElement): void;
  installSlideEvents(
    prop: UIPropElement,
    change?: Function,
    confirm?: Function,
    cancel?: Function,
  ): void;
}

export interface UIProgressElement extends HTMLElement {
  value: number;
  $bar: HTMLElement;
  ready(): void;
}

export interface UIHintElement extends HTMLElement {
  position: string;
  ready(): void;
}

// ============ 全局类型扩展 ============

declare global {
  interface HTMLElementTagNameMap {
    'ui-button': UIButtonElement;
    'ui-checkbox': UICheckboxElement;
    'ui-input': UIInputElement;
    'ui-select': UISelectElement;
    'ui-num-input': UINumInputElement;
    'ui-slider': UISliderElement;
    'ui-color': UIColorElement;
    'ui-section': UISectionElement;
    'ui-prop': UIPropElement;
    'ui-progress': UIProgressElement;
    'ui-hint': UIHintElement;
  }
}
