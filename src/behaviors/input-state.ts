/**
 * 输入状态行为
 */

import domUtils from "../utils/dom-utils";
import focusMgr from "../utils/focus-mgr";
import type { InputStateBehavior, FocusableElement } from '../types';

interface ExtendedInput extends HTMLInputElement {
  _initValue?: string;
  _focused?: boolean;
  _selectAllWhenMouseUp?: boolean;
  _mouseStartX?: number;
}

interface InputStateElement extends HTMLElement {
  disabled?: boolean;
}

const inputStateBehavior: InputStateBehavior & ThisType<InputStateElement & InputStateBehavior> = {
  _initInputState(input: HTMLInputElement | HTMLTextAreaElement): void {
    const extInput = input as ExtendedInput;
    
    if (!this._onInputConfirm) {
      throw new Error(
        "Failed to init input-state: please implement _onInputConfirm"
      );
    }
    if (!this._onInputCancel) {
      throw new Error(
        "Failed to init input-state: please implement _onInputCancel"
      );
    }
    if (!this._onInputChange) {
      throw new Error(
        "Failed to init input-state: please implement _onInputChange"
      );
    }

    const isTextArea = input instanceof HTMLTextAreaElement;
    extInput._initValue = extInput.value;
    extInput._focused = false;
    extInput._selectAllWhenMouseUp = false;
    extInput._mouseStartX = -1;

    input.addEventListener("focus", () => {
      extInput._focused = true;
      extInput._initValue = extInput.value;

      if (extInput._selectAllWhenMouseUp === false) {
        input.select();
      }
    });

    input.addEventListener("blur", () => {
      extInput._focused = false;
    });

    input.addEventListener("change", (e: Event) => {
      domUtils.acceptEvent(e);
      this._onInputConfirm(input);
    });

    input.addEventListener("input", (e: Event) => {
      domUtils.acceptEvent(e);
      this._onInputChange(input);
    });

    input.addEventListener("keydown", (e: Event) => {
      const event = e as KeyboardEvent;
      if (!this.disabled) {
        event.stopPropagation();

        if (event.keyCode === 13) {
          if (!isTextArea || event.ctrlKey || event.metaKey) {
            domUtils.acceptEvent(event);
            this._onInputConfirm(input, true);
          }
        } else if (event.keyCode === 27) {
          domUtils.acceptEvent(event);
          this._onInputCancel(input, true);
        }
      }
    });

    input.addEventListener("keyup", (e: Event) => {
      e.stopPropagation();
    });

    input.addEventListener("keypress", (e: Event) => {
      e.stopPropagation();
    });

    input.addEventListener("mousedown", (e: Event) => {
      const event = e as MouseEvent;
      event.stopPropagation();
      focusMgr._setFocusElement(this as FocusableElement);
      extInput._mouseStartX = event.clientX;

      if (!extInput._focused) {
        extInput._selectAllWhenMouseUp = true;
      }
    });

    input.addEventListener("mouseup", (e: Event) => {
      const event = e as MouseEvent;
      event.stopPropagation();

      if (extInput._selectAllWhenMouseUp) {
        extInput._selectAllWhenMouseUp = false;
        if (Math.abs(event.clientX - (extInput._mouseStartX || 0)) < 4) {
          input.select();
        }
      }
    });
  },

  _unselect(input: HTMLInputElement | HTMLTextAreaElement): void {
    input.selectionStart = input.selectionEnd = -1;
  },

  // 这些方法需要在具体组件中实现
  _onInputConfirm(_input: HTMLInputElement | HTMLTextAreaElement, _confirmByEnter?: boolean): void {},
  _onInputCancel(_input: HTMLInputElement | HTMLTextAreaElement, _cancelByEsc?: boolean): void {},
  _onInputChange(_input: HTMLInputElement | HTMLTextAreaElement): void {},
};

export default inputStateBehavior;

